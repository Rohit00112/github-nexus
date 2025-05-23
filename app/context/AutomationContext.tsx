"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useGitHub } from "./GitHubContext";
import { AutomationService } from "../services/automation/automationService";
import { RuleMatchingService } from "../services/automation/ruleMatchingService";
import { RuleActionService } from "../services/automation/ruleActionService";
import { AutomationRule, RuleExecutionResult } from "../types/automation";

interface AutomationContextType {
  automationService: AutomationService | null;
  ruleMatchingService: RuleMatchingService | null;
  ruleActionService: RuleActionService | null;
  isLoading: boolean;
  rules: AutomationRule[];
  createRule: (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<AutomationRule>;
  updateRule: (id: string, updates: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>) => Promise<AutomationRule | null>;
  deleteRule: (id: string) => Promise<boolean>;
  executeRulesForIssue: (owner: string, repo: string, issueNumber: number, specificRules?: AutomationRule[]) => Promise<RuleExecutionResult[]>;
  executeRulesForPullRequest: (owner: string, repo: string, pullNumber: number, specificRules?: AutomationRule[]) => Promise<RuleExecutionResult[]>;
}

const AutomationContext = createContext<AutomationContextType>({
  automationService: null,
  ruleMatchingService: null,
  ruleActionService: null,
  isLoading: true,
  rules: [],
  createRule: async () => { throw new Error("Not implemented"); },
  updateRule: async () => { throw new Error("Not implemented"); },
  deleteRule: async () => { throw new Error("Not implemented"); },
  executeRulesForIssue: async () => { throw new Error("Not implemented"); },
  executeRulesForPullRequest: async () => { throw new Error("Not implemented"); },
});

export function useAutomation() {
  return useContext(AutomationContext);
}

interface AutomationProviderProps {
  children: ReactNode;
}

export function AutomationProvider({ children }: AutomationProviderProps) {
  const { githubService, isLoading: isGitHubLoading } = useGitHub();
  const [automationService, setAutomationService] = useState<AutomationService | null>(null);
  const [ruleMatchingService, setRuleMatchingService] = useState<RuleMatchingService | null>(null);
  const [ruleActionService, setRuleActionService] = useState<RuleActionService | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isGitHubLoading && githubService) {
      const automation = new AutomationService(githubService);
      const matching = new RuleMatchingService();
      const action = new RuleActionService(githubService);

      setAutomationService(automation);
      setRuleMatchingService(matching);
      setRuleActionService(action);
      setRules(automation.getRules());
      setIsLoading(false);
    }
  }, [githubService, isGitHubLoading]);

  // Add a listener for localStorage changes to refresh rules
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'automationRules' && automationService) {
        // Refresh rules from the automation service
        setRules(automationService.refreshRules());
      }
    };

    // Function to refresh rules from localStorage
    const refreshRules = () => {
      if (automationService) {
        setRules(automationService.refreshRules());
      }
    };

    // Add event listener for storage changes
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);

      // Set up periodic refresh to ensure rules are always up to date
      const refreshInterval = setInterval(refreshRules, 5000); // Refresh every 5 seconds

      // Initial refresh
      refreshRules();

      // Cleanup function to remove event listener and clear interval
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(refreshInterval);
      };
    }

    return undefined;
  }, [automationService]);

  const createRule = async (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<AutomationRule> => {
    if (!automationService) {
      throw new Error("Automation service not initialized");
    }

    // Get the current user's login
    const { data: user } = await githubService.octokit.rest.users.getAuthenticated();

    const newRule = automationService.createRule({
      ...rule,
      createdBy: user.login,
    });

    setRules(automationService.getRules());
    return newRule;
  };

  const updateRule = async (id: string, updates: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>): Promise<AutomationRule | null> => {
    if (!automationService) {
      throw new Error("Automation service not initialized");
    }

    const updatedRule = automationService.updateRule(id, updates);
    if (updatedRule) {
      setRules(automationService.getRules());
    }

    return updatedRule;
  };

  const deleteRule = async (id: string): Promise<boolean> => {
    if (!automationService) {
      throw new Error("Automation service not initialized");
    }

    const result = automationService.deleteRule(id);
    if (result) {
      setRules(automationService.getRules());
    }

    return result;
  };

  const executeRulesForIssue = async (
    owner: string,
    repo: string,
    issueNumber: number,
    specificRules?: AutomationRule[]
  ): Promise<RuleExecutionResult[]> => {
    if (!automationService) {
      throw new Error("Automation service not initialized");
    }

    return automationService.executeRulesForIssue(owner, repo, issueNumber, specificRules);
  };

  const executeRulesForPullRequest = async (
    owner: string,
    repo: string,
    pullNumber: number,
    specificRules?: AutomationRule[]
  ): Promise<RuleExecutionResult[]> => {
    if (!automationService) {
      throw new Error("Automation service not initialized");
    }

    return automationService.executeRulesForPullRequest(owner, repo, pullNumber, specificRules);
  };

  return (
    <AutomationContext.Provider
      value={{
        automationService,
        ruleMatchingService,
        ruleActionService,
        isLoading,
        rules,
        createRule,
        updateRule,
        deleteRule,
        executeRulesForIssue,
        executeRulesForPullRequest,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
}
