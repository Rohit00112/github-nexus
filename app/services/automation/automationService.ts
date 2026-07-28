"use client";

import {
  AutomationRule,
  ConditionGroup,
  Condition,
  ConditionType,
  ConditionOperator,
  Action,
  ActionType,
  RuleExecutionResult,
  AutomationResourceType
} from "@/app/types/automation";
import { v4 as uuidv4 } from 'uuid';
import { GitHubService } from "../github/githubService";

interface AutomationResource {
  number: number;
  title: string;
  body?: string | null;
  labels: Array<{ name?: string } | string>;
  user: { login: string } | null;
  assignees?: Array<{ login: string }> | null;
}

/**
 * Service for managing and executing automation rules
 */
export class AutomationService {
  private rules: AutomationRule[] = [];
  private githubService: GitHubService;

  constructor(githubService: GitHubService) {
    this.githubService = githubService;
    this.loadRules();
  }

  /**
   * Load rules from local storage
   */
  private loadRules(): void {
    if (typeof window !== 'undefined') {
      const savedRules = localStorage.getItem('automationRules');
      if (savedRules) {
        try {
          this.rules = JSON.parse(savedRules);
        } catch (error) {
          console.error('Failed to parse saved automation rules:', error);
          this.rules = [];
        }
      } else {
        // Initialize with empty array if no rules found
        this.rules = [];
        // Save empty array to localStorage to initialize it
        this.saveRules();
      }
    }
  }

  /**
   * Save rules to local storage
   */
  private saveRules(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('automationRules', JSON.stringify(this.rules));
    }
  }

  /**
   * Get all rules
   */
  getRules(): AutomationRule[] {
    // Refresh rules from localStorage before returning
    this.loadRules();
    return [...this.rules];
  }

  /**
   * Manually refresh rules from localStorage
   */
  refreshRules(): AutomationRule[] {
    this.loadRules();
    return this.getRules();
  }

  /**
   * Get a rule by ID
   */
  getRule(id: string): AutomationRule | undefined {
    return this.rules.find(rule => rule.id === id);
  }

  /**
   * Create a new rule
   */
  createRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.rules.push(newRule);
    this.saveRules();
    return newRule;
  }

  /**
   * Update an existing rule
   */
  updateRule(id: string, updates: Partial<Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>>): AutomationRule | null {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index === -1) return null;

    const updatedRule: AutomationRule = {
      ...this.rules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.rules[index] = updatedRule;
    this.saveRules();
    return updatedRule;
  }

  /**
   * Delete a rule
   */
  deleteRule(id: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== id);

    if (this.rules.length !== initialLength) {
      this.saveRules();
      return true;
    }

    return false;
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(id: string, enabled: boolean): AutomationRule | null {
    return this.updateRule(id, { enabled });
  }

  /**
   * Execute rules for an issue
   */
  async executeRulesForIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    specificRules?: AutomationRule[]
  ): Promise<RuleExecutionResult[]> {
    const issue = await this.githubService.octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    const results: RuleExecutionResult[] = [];

    // If specific rules are provided, use those; otherwise filter applicable rules
    let rulesToExecute: AutomationRule[];

    if (specificRules && specificRules.length > 0) {
      // Use the provided specific rules
      rulesToExecute = specificRules;
    } else {
      // Filter rules that apply to issues
      const applicableRules = this.rules.filter(rule =>
        rule.enabled &&
        (rule.resourceType === AutomationResourceType.ISSUE || rule.resourceType === AutomationResourceType.BOTH) &&
        (!rule.repositories || rule.repositories.includes(`${owner}/${repo}`))
      );

      // Sort rules by runOrder if specified
      rulesToExecute = [...applicableRules].sort((a, b) =>
        (a.runOrder || Number.MAX_SAFE_INTEGER) - (b.runOrder || Number.MAX_SAFE_INTEGER)
      );
    }

    for (const rule of rulesToExecute) {
      const result = await this.executeRule(rule, issue.data, owner, repo);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute rules for a pull request
   */
  async executeRulesForPullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    specificRules?: AutomationRule[]
  ): Promise<RuleExecutionResult[]> {
    const pullRequest = await this.githubService.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const results: RuleExecutionResult[] = [];

    // If specific rules are provided, use those; otherwise filter applicable rules
    let rulesToExecute: AutomationRule[];

    if (specificRules && specificRules.length > 0) {
      // Use the provided specific rules
      rulesToExecute = specificRules;
    } else {
      // Filter rules that apply to pull requests
      const applicableRules = this.rules.filter(rule =>
        rule.enabled &&
        (rule.resourceType === AutomationResourceType.PULL_REQUEST || rule.resourceType === AutomationResourceType.BOTH) &&
        (!rule.repositories || rule.repositories.includes(`${owner}/${repo}`))
      );

      // Sort rules by runOrder if specified
      rulesToExecute = [...applicableRules].sort((a, b) =>
        (a.runOrder || Number.MAX_SAFE_INTEGER) - (b.runOrder || Number.MAX_SAFE_INTEGER)
      );
    }

    for (const rule of rulesToExecute) {
      const result = await this.executeRule(rule, pullRequest.data, owner, repo);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute a single rule against an issue or pull request
   */
  private async executeRule(rule: AutomationRule, resource: AutomationResource, owner: string, repo: string): Promise<RuleExecutionResult> {
    const result: RuleExecutionResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      matched: false,
      actionsExecuted: [],
      timestamp: new Date().toISOString(),
    };

    // Check if the resource matches the rule conditions
    const matched = this.evaluateConditionGroup(rule.conditions, resource);
    result.matched = matched;

    // If conditions match, execute actions
    if (matched) {
      for (const action of rule.actions) {
        try {
          await this.executeAction(action, resource, owner, repo);
          result.actionsExecuted.push({
            type: action.type,
            success: true,
          });
        } catch (error) {
          console.error(`Failed to execute action ${action.type}:`, error);
          result.actionsExecuted.push({
            type: action.type,
            success: false,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    return result;
  }

  /**
   * Test a rule against an issue without executing actions
   */
  async testRuleAgainstIssue(rule: AutomationRule, owner: string, repo: string, issueNumber: number): Promise<RuleExecutionResult> {
    const issue = await this.githubService.octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    return this.testRule(rule, issue.data);
  }

  /**
   * Test a rule against a pull request without executing actions
   */
  async testRuleAgainstPullRequest(rule: AutomationRule, owner: string, repo: string, pullNumber: number): Promise<RuleExecutionResult> {
    const pullRequest = await this.githubService.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return this.testRule(rule, pullRequest.data);
  }

  /**
   * Test a rule against a resource without executing actions
   */
  private testRule(rule: AutomationRule, resource: AutomationResource): RuleExecutionResult {
    const result: RuleExecutionResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      matched: false,
      actionsExecuted: [],
      timestamp: new Date().toISOString(),
      testMode: true,
    };

    // Check if the resource matches the rule conditions
    const matched = this.evaluateConditionGroup(rule.conditions, resource);
    result.matched = matched;

    // In test mode, we don't execute actions but we simulate what would happen
    if (matched) {
      for (const action of rule.actions) {
        result.actionsExecuted.push({
          type: action.type,
          success: true,
          testMode: true,
        });
      }
    }

    return result;
  }

  /**
   * Evaluate a condition group against a resource
   */
  private evaluateConditionGroup(group: ConditionGroup, resource: AutomationResource): boolean {
    if (group.operator === ConditionOperator.AND) {
      // All conditions must be true
      return group.conditions.every(condition => {
        if ('operator' in condition) {
          // This is a nested condition group
          return this.evaluateConditionGroup(condition as ConditionGroup, resource);
        } else {
          // This is a single condition
          return this.evaluateCondition(condition as Condition, resource);
        }
      });
    } else {
      // At least one condition must be true
      return group.conditions.some(condition => {
        if ('operator' in condition) {
          // This is a nested condition group
          return this.evaluateConditionGroup(condition as ConditionGroup, resource);
        } else {
          // This is a single condition
          return this.evaluateCondition(condition as Condition, resource);
        }
      });
    }
  }

  /**
   * Evaluate a single condition against a resource
   */
  private evaluateCondition(condition: Condition, resource: AutomationResource): boolean {
    let result = false;

    switch (condition.type) {
      case ConditionType.TITLE_CONTAINS:
        result = resource.title.includes(condition.value);
        break;
      case ConditionType.BODY_CONTAINS:
        result = resource.body?.includes(condition.value) || false;
        break;
      case ConditionType.TITLE_MATCHES_REGEX:
        result = new RegExp(condition.pattern, condition.flags).test(resource.title);
        break;
      case ConditionType.BODY_MATCHES_REGEX:
        result = resource.body ? new RegExp(condition.pattern, condition.flags).test(resource.body) : false;
        break;
      case ConditionType.HAS_LABEL:
        result = resource.labels.some((label) => (typeof label === 'string' ? label : label.name ?? '') === condition.label);
        break;
      case ConditionType.CREATED_BY:
        result = resource.user?.login === condition.username;
        break;
      case ConditionType.ASSIGNED_TO:
        result = resource.assignees?.some((assignee) => assignee.login === condition.username) ?? false;
        break;
      // Add more condition evaluations as needed
      default:
        console.warn(`Unsupported condition type: ${(condition as unknown as Record<string, unknown>).type}`);
        result = false;
    }

    // Apply negation if specified
    return condition.negate ? !result : result;
  }

  /**
   * Execute an action on a resource
   */
  private async executeAction(action: Action, resource: AutomationResource, owner: string, repo: string): Promise<void> {
    const issueNumber = resource.number;

    switch (action.type) {
      case ActionType.ADD_LABEL:
        await this.githubService.octokit.rest.issues.addLabels({
          owner,
          repo,
          issue_number: issueNumber,
          labels: [action.label],
        });
        break;
      case ActionType.REMOVE_LABEL:
        await this.githubService.octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: issueNumber,
          name: action.label,
        });
        break;
      case ActionType.ASSIGN_USER:
        await this.githubService.octokit.rest.issues.addAssignees({
          owner,
          repo,
          issue_number: issueNumber,
          assignees: [action.username],
        });
        break;
      case ActionType.UNASSIGN_USER:
        await this.githubService.octokit.rest.issues.removeAssignees({
          owner,
          repo,
          issue_number: issueNumber,
          assignees: [action.username],
        });
        break;
      case ActionType.ADD_COMMENT:
        await this.githubService.octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: action.body,
        });
        break;
      // Add more action implementations as needed
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
}
