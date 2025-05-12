"use client";

import { useState, useEffect } from "react";
import { useAutomation } from "../../context/AutomationContext";
import { 
  AutomationRule, 
  AutomationResourceType, 
  RuleExecutionResult 
} from "../../types/automation";
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Divider,
  Accordion,
  AccordionItem,
  Spinner
} from "@nextui-org/react";
import { PlayIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface RuleExecutorProps {
  owner: string;
  repo: string;
  issueNumber?: number;
  pullNumber?: number;
}

export default function RuleExecutor({ owner, repo, issueNumber, pullNumber }: RuleExecutorProps) {
  const { rules, executeRulesForIssue, executeRulesForPullRequest } = useAutomation();
  const [applicableRules, setApplicableRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionResults, setExecutionResults] = useState<RuleExecutionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter rules that apply to this issue/PR
  useEffect(() => {
    if (!rules.length) return;

    const resourceType = issueNumber ? AutomationResourceType.ISSUE : AutomationResourceType.PULL_REQUEST;
    const filtered = rules.filter(rule => 
      rule.enabled && 
      (rule.resourceType === resourceType || rule.resourceType === AutomationResourceType.BOTH) &&
      (!rule.repositories || rule.repositories.includes(`${owner}/${repo}`))
    );
    
    setApplicableRules(filtered);
  }, [rules, owner, repo, issueNumber, pullNumber]);

  const executeRules = async () => {
    if ((!issueNumber && !pullNumber) || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let results: RuleExecutionResult[];
      
      if (issueNumber) {
        results = await executeRulesForIssue(owner, repo, issueNumber);
      } else if (pullNumber) {
        results = await executeRulesForPullRequest(owner, repo, pullNumber!);
      } else {
        throw new Error("Either issue number or pull number must be provided");
      }
      
      setExecutionResults(results);
    } catch (error) {
      console.error("Error executing rules:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const executeSingleRule = async (ruleId: string) => {
    if ((!issueNumber && !pullNumber) || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) {
        throw new Error("Rule not found");
      }
      
      let results: RuleExecutionResult[];
      
      if (issueNumber) {
        // Execute just this one rule
        const result = await executeRulesForIssue(owner, repo, issueNumber, [rule]);
        results = result;
      } else if (pullNumber) {
        const result = await executeRulesForPullRequest(owner, repo, pullNumber!, [rule]);
        results = result;
      } else {
        throw new Error("Either issue number or pull number must be provided");
      }
      
      // Merge with existing results or set as new results
      if (executionResults.length) {
        const updatedResults = [...executionResults];
        const index = updatedResults.findIndex(r => r.ruleId === ruleId);
        
        if (index >= 0) {
          updatedResults[index] = results[0];
        } else {
          updatedResults.push(results[0]);
        }
        
        setExecutionResults(updatedResults);
      } else {
        setExecutionResults(results);
      }
    } catch (error) {
      console.error("Error executing rule:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (applicableRules.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">
            No automation rules apply to this {issueNumber ? "issue" : "pull request"}.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Automation Rules</h3>
        <Button
          color="primary"
          size="sm"
          startContent={<PlayIcon className="h-4 w-4" />}
          onPress={executeRules}
          isLoading={isLoading}
        >
          Run All Rules
        </Button>
      </div>
      
      {error && (
        <div className="text-danger text-sm p-2 bg-danger-50 rounded-md">
          {error}
        </div>
      )}
      
      <Accordion>
        {applicableRules.map((rule) => {
          const result = executionResults.find(r => r.ruleId === rule.id);
          
          return (
            <AccordionItem
              key={rule.id}
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{rule.name}</span>
                    {result && (
                      <Chip 
                        size="sm" 
                        color={result.matched ? "success" : "danger"}
                      >
                        {result.matched ? "Matched" : "Not Matched"}
                      </Chip>
                    )}
                  </div>
                </div>
              }
              subtitle={rule.description}
              classNames={{
                title: "text-medium",
              }}
            >
              <div className="px-2 py-1 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Conditions:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {rule.conditions.conditions.map((condition, index) => (
                      <li key={index}>
                        {/* Simplified condition display */}
                        {'operator' in condition 
                          ? `Group with ${condition.operator} operator` 
                          : `${condition.type.replace(/_/g, ' ')}`}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Actions:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {rule.actions.map((action, index) => (
                      <li key={index}>
                        {action.type.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {result && (
                  <>
                    <Divider />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Execution Result:</p>
                      <div className="flex items-center gap-2 mb-2">
                        {result.matched ? (
                          <div className="flex items-center text-success">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            <span>Conditions matched</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-danger">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            <span>Conditions did not match</span>
                          </div>
                        )}
                      </div>
                      
                      {result.matched && result.actionsExecuted.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Actions executed:</p>
                          <ul className="list-disc pl-5 text-sm">
                            {result.actionsExecuted.map((action, index) => (
                              <li key={index} className={action.success ? "text-success" : "text-danger"}>
                                {action.type.replace(/_/g, ' ')} - {action.success ? "Success" : `Failed: ${action.message}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<PlayIcon className="h-4 w-4" />}
                    onPress={() => executeSingleRule(rule.id)}
                    isLoading={isLoading}
                  >
                    Run Rule
                  </Button>
                </div>
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
