import { AutomationService } from '@/app/services/automation/automationService';
import { 
  AutomationRule, 
  AutomationResourceType, 
  ConditionOperator, 
  ConditionType, 
  ActionType 
} from '@/app/types/automation';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Octokit
const mockOctokit = {
  rest: {
    issues: {
      get: jest.fn(),
      addLabels: jest.fn(),
      removeLabel: jest.fn(),
      addAssignees: jest.fn(),
      removeAssignees: jest.fn(),
      createComment: jest.fn(),
      update: jest.fn(),
    },
    pulls: {
      get: jest.fn(),
      requestReviewers: jest.fn(),
    },
  },
  graphql: jest.fn(),
};

const mockGithubService = {
  octokit: mockOctokit,
};

describe('AutomationService', () => {
  let service: AutomationService;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    service = new AutomationService(mockGithubService);
  });

  describe('rule management', () => {
    test('should create a rule with correct properties', () => {
      const rule = service.createRule({
        name: 'Test Rule',
        description: 'A test rule',
        resourceType: AutomationResourceType.ISSUE,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [
            {
              type: ConditionType.TITLE_CONTAINS,
              value: 'bug',
            },
          ],
        },
        actions: [
          {
            type: ActionType.ADD_LABEL,
            label: 'bug',
          },
        ],
        createdBy: 'testuser',
      });

      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('createdAt');
      expect(rule).toHaveProperty('updatedAt');
      expect(rule.name).toBe('Test Rule');
      expect(rule.description).toBe('A test rule');
      expect(rule.resourceType).toBe(AutomationResourceType.ISSUE);
      expect(rule.enabled).toBe(true);
      expect(rule.createdBy).toBe('testuser');
    });

    test('should retrieve all rules', () => {
      service.createRule({
        name: 'Rule 1',
        resourceType: AutomationResourceType.ISSUE,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [],
        },
        actions: [],
        createdBy: 'testuser',
      });

      service.createRule({
        name: 'Rule 2',
        resourceType: AutomationResourceType.PULL_REQUEST,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [],
        },
        actions: [],
        createdBy: 'testuser',
      });

      const rules = service.getRules();
      expect(rules).toHaveLength(2);
      expect(rules[0].name).toBe('Rule 1');
      expect(rules[1].name).toBe('Rule 2');
    });

    test('should update a rule', () => {
      const rule = service.createRule({
        name: 'Original Name',
        resourceType: AutomationResourceType.ISSUE,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [],
        },
        actions: [],
        createdBy: 'testuser',
      });

      const updatedRule = service.updateRule(rule.id, {
        name: 'Updated Name',
        enabled: false,
      });

      expect(updatedRule).not.toBeNull();
      expect(updatedRule?.name).toBe('Updated Name');
      expect(updatedRule?.enabled).toBe(false);
      expect(updatedRule?.resourceType).toBe(AutomationResourceType.ISSUE);
      expect(updatedRule?.updatedAt).not.toBe(rule.updatedAt);
    });

    test('should delete a rule', () => {
      const rule = service.createRule({
        name: 'Rule to Delete',
        resourceType: AutomationResourceType.ISSUE,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [],
        },
        actions: [],
        createdBy: 'testuser',
      });

      expect(service.getRules()).toHaveLength(1);
      
      const result = service.deleteRule(rule.id);
      expect(result).toBe(true);
      expect(service.getRules()).toHaveLength(0);
    });
  });

  describe('rule execution', () => {
    test('should execute rules for an issue', async () => {
      // Create a test rule
      service.createRule({
        name: 'Bug Label Rule',
        resourceType: AutomationResourceType.ISSUE,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [
            {
              type: ConditionType.TITLE_CONTAINS,
              value: 'bug',
            },
          ],
        },
        actions: [
          {
            type: ActionType.ADD_LABEL,
            label: 'bug',
          },
        ],
        createdBy: 'testuser',
      });

      // Mock the GitHub API response
      mockOctokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 123,
          title: 'This is a bug report',
          labels: [],
        },
      });

      mockOctokit.rest.issues.addLabels.mockResolvedValue({});

      // Execute rules for the issue
      const results = await service.executeRulesForIssue('owner', 'repo', 123);

      // Verify the results
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].actionsExecuted).toHaveLength(1);
      expect(results[0].actionsExecuted[0].type).toBe(ActionType.ADD_LABEL);
      expect(results[0].actionsExecuted[0].success).toBe(true);

      // Verify the GitHub API was called correctly
      expect(mockOctokit.rest.issues.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });

      expect(mockOctokit.rest.issues.addLabels).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
        labels: ['bug'],
      });
    });

    test('should not execute actions if conditions do not match', async () => {
      // Create a test rule
      service.createRule({
        name: 'Bug Label Rule',
        resourceType: AutomationResourceType.ISSUE,
        enabled: true,
        conditions: {
          operator: ConditionOperator.AND,
          conditions: [
            {
              type: ConditionType.TITLE_CONTAINS,
              value: 'bug',
            },
          ],
        },
        actions: [
          {
            type: ActionType.ADD_LABEL,
            label: 'bug',
          },
        ],
        createdBy: 'testuser',
      });

      // Mock the GitHub API response with a title that doesn't match
      mockOctokit.rest.issues.get.mockResolvedValue({
        data: {
          number: 123,
          title: 'This is a feature request',
          labels: [],
        },
      });

      // Execute rules for the issue
      const results = await service.executeRulesForIssue('owner', 'repo', 123);

      // Verify the results
      expect(results).toHaveLength(1);
      expect(results[0].matched).toBe(false);
      expect(results[0].actionsExecuted).toHaveLength(0);

      // Verify the GitHub API was called correctly
      expect(mockOctokit.rest.issues.get).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
      });

      // Verify that no actions were executed
      expect(mockOctokit.rest.issues.addLabels).not.toHaveBeenCalled();
    });
  });
});
