import { 
  RuleMatchingService, 
} from '@/app/services/automation/ruleMatchingService';
import { 
  ConditionType, 
  ConditionOperator, 
  TextMatchCondition, 
  LabelCondition, 
  UserCondition,
  ConditionGroup
} from '@/app/types/automation';

describe('RuleMatchingService', () => {
  let service: RuleMatchingService;

  beforeEach(() => {
    service = new RuleMatchingService();
  });

  describe('evaluateCondition', () => {
    test('should evaluate title contains condition correctly', () => {
      const condition: TextMatchCondition = {
        type: ConditionType.TITLE_CONTAINS,
        value: 'bug',
        caseSensitive: false,
      };

      const resource = { title: 'This is a bug report' };
      expect(service.evaluateCondition(condition, resource)).toBe(true);

      const resourceNoMatch = { title: 'This is a feature request' };
      expect(service.evaluateCondition(condition, resourceNoMatch)).toBe(false);
    });

    test('should evaluate title contains condition with case sensitivity', () => {
      const condition: TextMatchCondition = {
        type: ConditionType.TITLE_CONTAINS,
        value: 'Bug',
        caseSensitive: true,
      };

      const resource = { title: 'This is a Bug report' };
      expect(service.evaluateCondition(condition, resource)).toBe(true);

      const resourceNoMatch = { title: 'This is a bug report' };
      expect(service.evaluateCondition(condition, resourceNoMatch)).toBe(false);
    });

    test('should evaluate negated conditions correctly', () => {
      const condition: TextMatchCondition = {
        type: ConditionType.TITLE_CONTAINS,
        value: 'bug',
        negate: true,
      };

      const resource = { title: 'This is a feature request' };
      expect(service.evaluateCondition(condition, resource)).toBe(true);

      const resourceNoMatch = { title: 'This is a bug report' };
      expect(service.evaluateCondition(condition, resourceNoMatch)).toBe(false);
    });

    test('should evaluate has label condition correctly', () => {
      const condition: LabelCondition = {
        type: ConditionType.HAS_LABEL,
        label: 'bug',
      };

      const resource = { labels: [{ name: 'bug' }, { name: 'priority-high' }] };
      expect(service.evaluateCondition(condition, resource)).toBe(true);

      const resourceNoMatch = { labels: [{ name: 'feature' }, { name: 'priority-low' }] };
      expect(service.evaluateCondition(condition, resourceNoMatch)).toBe(false);
    });

    test('should evaluate created by condition correctly', () => {
      const condition: UserCondition = {
        type: ConditionType.CREATED_BY,
        username: 'octocat',
      };

      const resource = { user: { login: 'octocat' } };
      expect(service.evaluateCondition(condition, resource)).toBe(true);

      const resourceNoMatch = { user: { login: 'monalisa' } };
      expect(service.evaluateCondition(condition, resourceNoMatch)).toBe(false);
    });
  });

  describe('evaluateConditionGroup', () => {
    test('should evaluate AND condition group correctly', () => {
      const group: ConditionGroup = {
        operator: ConditionOperator.AND,
        conditions: [
          {
            type: ConditionType.TITLE_CONTAINS,
            value: 'bug',
          } as TextMatchCondition,
          {
            type: ConditionType.HAS_LABEL,
            label: 'priority-high',
          } as LabelCondition,
        ],
      };

      const resource = {
        title: 'This is a bug report',
        labels: [{ name: 'bug' }, { name: 'priority-high' }],
      };
      expect(service.evaluateConditionGroup(group, resource)).toBe(true);

      const resourcePartialMatch = {
        title: 'This is a bug report',
        labels: [{ name: 'bug' }, { name: 'priority-low' }],
      };
      expect(service.evaluateConditionGroup(group, resourcePartialMatch)).toBe(false);
    });

    test('should evaluate OR condition group correctly', () => {
      const group: ConditionGroup = {
        operator: ConditionOperator.OR,
        conditions: [
          {
            type: ConditionType.TITLE_CONTAINS,
            value: 'bug',
          } as TextMatchCondition,
          {
            type: ConditionType.HAS_LABEL,
            label: 'priority-high',
          } as LabelCondition,
        ],
      };

      const resource = {
        title: 'This is a feature request',
        labels: [{ name: 'feature' }, { name: 'priority-high' }],
      };
      expect(service.evaluateConditionGroup(group, resource)).toBe(true);

      const resourceNoMatch = {
        title: 'This is a feature request',
        labels: [{ name: 'feature' }, { name: 'priority-low' }],
      };
      expect(service.evaluateConditionGroup(group, resourceNoMatch)).toBe(false);
    });

    test('should evaluate nested condition groups correctly', () => {
      const group: ConditionGroup = {
        operator: ConditionOperator.AND,
        conditions: [
          {
            type: ConditionType.CREATED_BY,
            username: 'octocat',
          } as UserCondition,
          {
            operator: ConditionOperator.OR,
            conditions: [
              {
                type: ConditionType.TITLE_CONTAINS,
                value: 'bug',
              } as TextMatchCondition,
              {
                type: ConditionType.HAS_LABEL,
                label: 'priority-high',
              } as LabelCondition,
            ],
          } as ConditionGroup,
        ],
      };

      const resource = {
        title: 'This is a feature request',
        labels: [{ name: 'feature' }, { name: 'priority-high' }],
        user: { login: 'octocat' },
      };
      expect(service.evaluateConditionGroup(group, resource)).toBe(true);

      const resourceNoMatch = {
        title: 'This is a feature request',
        labels: [{ name: 'feature' }, { name: 'priority-low' }],
        user: { login: 'octocat' },
      };
      expect(service.evaluateConditionGroup(group, resourceNoMatch)).toBe(false);
    });
  });
});
