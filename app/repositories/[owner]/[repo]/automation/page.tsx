"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../hooks/useAuth";
import { useGitHub } from "../../../../context/GitHubContext";
import { useAutomation } from "../../../../context/AutomationContext";
import MainLayout from "../../../../components/layout/MainLayout";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Tabs, 
  Tab, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Chip
} from "@nextui-org/react";
import { AutomationRule, AutomationResourceType } from "../../../../types/automation";
import AutomationRuleCard from "../../../../components/automation/AutomationRuleCard";
import AutomationRuleForm from "../../../../components/automation/AutomationRuleForm";

export default function RepositoryAutomationPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const { 
    rules, 
    isLoading: automationLoading, 
    createRule, 
    updateRule, 
    deleteRule 
  } = useAutomation();

  const [repository, setRepository] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("rules");
  const [repositoryRules, setRepositoryRules] = useState<AutomationRule[]>([]);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch repository data
  useEffect(() => {
    async function fetchRepository() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);

          const repoData = await githubService.getRepository(owner, repo);
          setRepository(repoData);
        } catch (err) {
          console.error("Error fetching repository:", err);
          setError("Failed to fetch repository. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchRepository();
  }, [githubService, githubLoading, owner, repo]);

  // Filter rules for this repository
  useEffect(() => {
    if (!automationLoading) {
      const repoFullName = `${owner}/${repo}`;
      
      // Filter rules that apply to this repository
      const filteredRules = rules.filter(rule => 
        !rule.repositories || // Rules with no repository restrictions
        rule.repositories.includes(repoFullName) // Rules specifically for this repo
      );
      
      setRepositoryRules(filteredRules);
    }
  }, [rules, automationLoading, owner, repo]);

  const handleCreateRule = () => {
    setEditingRule(null);
    onOpen();
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    onOpen();
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteRule(ruleId);
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const handleToggleRuleActive = async (ruleId: string, isActive: boolean) => {
    try {
      await updateRule(ruleId, { enabled: isActive });
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleSaveRule = async (ruleData: any) => {
    try {
      const repoFullName = `${owner}/${repo}`;
      
      if (editingRule) {
        // Update existing rule
        await updateRule(editingRule.id, {
          ...ruleData,
          repositories: [repoFullName]
        });
      } else {
        // Create new rule
        await createRule({
          ...ruleData,
          resourceType: AutomationResourceType.BOTH, // Default to both issues and PRs
          repositories: [repoFullName],
          createdBy: "current-user" // This will be replaced by the actual user in the context
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  if (authLoading || githubLoading || automationLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        ) : repository ? (
          <>
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <Link href={`/repositories/${owner}`} className="hover:underline">
                  {owner}
                </Link>
                <span className="mx-1">/</span>
                <Link href={`/repositories/${owner}/${repo}`} className="hover:underline">
                  {repo}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span>Automation</span>
              </div>

              <h1 className="text-3xl font-bold mb-4">Repository Automation</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create and manage automation rules for this repository. Automation rules can help you streamline your workflow by automatically performing actions based on specific triggers.
              </p>
            </div>

            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
            >
              <Tab key="rules" title="Automation Rules">
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Automation Rules</h2>
                    <Button 
                      color="primary" 
                      onClick={handleCreateRule}
                    >
                      Create Rule
                    </Button>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    {repositoryRules.length > 0 ? (
                      <div className="space-y-4">
                        {repositoryRules.map((rule) => (
                          <AutomationRuleCard
                            key={rule.id}
                            rule={rule}
                            onEdit={handleEditRule}
                            onDelete={handleDeleteRule}
                            onToggleActive={handleToggleRuleActive}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Automation Rules</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          You haven't created any automation rules for this repository yet.
                        </p>
                        <Button 
                          color="primary" 
                          onClick={handleCreateRule}
                        >
                          Create Your First Rule
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="history" title="Execution History">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Rule Execution History</h2>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Execution History</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        The execution history will show when automation rules are triggered and what actions they perform.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>

            {/* Rule Editor Modal */}
            <Modal 
              isOpen={isOpen} 
              onClose={onClose}
              size="3xl"
              scrollBehavior="inside"
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader>
                      {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
                    </ModalHeader>
                    <ModalBody>
                      <AutomationRuleForm
                        initialRule={editingRule || undefined}
                        onSave={handleSaveRule}
                        onCancel={onClose}
                      />
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Repository not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The repository you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              href="/repositories"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-block"
            >
              Back to Repositories
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
