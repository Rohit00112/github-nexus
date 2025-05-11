"use client";

import { AutomationRule, ConditionGroup, Condition, ConditionType, ConditionOperator, Action, ActionType } from "@/app/types/automation";
import { Card, CardBody, Divider, Chip } from "@nextui-org/react";

interface RuleDetailsProps {
  rule: AutomationRule;
}

export default function RuleDetails({ rule }: RuleDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Rule Information</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p>{rule.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
            <p>{rule.createdBy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
            <p>{new Date(rule.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p>{new Date(rule.updatedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <Chip color={rule.enabled ? "success" : "danger"} size="sm">
              {rule.enabled ? "Enabled" : "Disabled"}
            </Chip>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Applies To</p>
            <p>{rule.resourceType}</p>
          </div>
        </div>
        {rule.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p>{rule.description}</p>
          </div>
        )}
      </div>

      <Divider />

      <div>
        <h3 className="text-lg font-medium">Conditions</h3>
        <Card className="mt-2">
          <CardBody>
            <ConditionGroupRenderer group={rule.conditions} />
          </CardBody>
        </Card>
      </div>

      <Divider />

      <div>
        <h3 className="text-lg font-medium">Actions</h3>
        <div className="space-y-2 mt-2">
          {rule.actions.map((action, index) => (
            <Card key={index} className="border-l-4 border-blue-500">
              <CardBody>
                <ActionRenderer action={action} />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {rule.repositories && rule.repositories.length > 0 && (
        <>
          <Divider />
          <div>
            <h3 className="text-lg font-medium">Repositories</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {rule.repositories.map((repo, index) => (
                <Chip key={index} variant="flat">{repo}</Chip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ConditionGroupRendererProps {
  group: ConditionGroup;
  level?: number;
}

function ConditionGroupRenderer({ group, level = 0 }: ConditionGroupRendererProps) {
  const operator = group.operator === ConditionOperator.AND ? "AND" : "OR";
  
  return (
    <div className={`pl-${level * 4}`}>
      <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
        {level > 0 ? `${operator} Group:` : `Match ${operator} of the following:`}
      </div>
      <div className="space-y-2 mt-2 pl-4">
        {group.conditions.map((condition, index) => (
          <div key={index}>
            {'operator' in condition ? (
              <ConditionGroupRenderer group={condition as ConditionGroup} level={level + 1} />
            ) : (
              <ConditionRenderer condition={condition as Condition} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ConditionRendererProps {
  condition: Condition;
}

function ConditionRenderer({ condition }: ConditionRendererProps) {
  let description = '';
  
  switch (condition.type) {
    case ConditionType.TITLE_CONTAINS:
      description = `Title ${condition.negate ? 'does not contain' : 'contains'} "${condition.value}"`;
      break;
    case ConditionType.BODY_CONTAINS:
      description = `Body ${condition.negate ? 'does not contain' : 'contains'} "${condition.value}"`;
      break;
    case ConditionType.TITLE_MATCHES_REGEX:
      description = `Title ${condition.negate ? 'does not match' : 'matches'} regex "${condition.pattern}"`;
      break;
    case ConditionType.BODY_MATCHES_REGEX:
      description = `Body ${condition.negate ? 'does not match' : 'matches'} regex "${condition.pattern}"`;
      break;
    case ConditionType.HAS_LABEL:
      description = `${condition.negate ? 'Does not have' : 'Has'} label "${condition.label}"`;
      break;
    case ConditionType.CREATED_BY:
      description = `${condition.negate ? 'Not created' : 'Created'} by ${condition.username}`;
      break;
    case ConditionType.ASSIGNED_TO:
      description = `${condition.negate ? 'Not assigned' : 'Assigned'} to ${condition.username}`;
      break;
    case ConditionType.MENTIONS_USER:
      description = `${condition.negate ? 'Does not mention' : 'Mentions'} user ${condition.username}`;
      break;
    case ConditionType.MODIFIED_FILES_MATCH:
      description = `Modified files ${condition.negate ? 'do not match' : 'match'} "${condition.pattern}"`;
      break;
    case ConditionType.BRANCH_MATCHES:
      description = `Branch ${condition.negate ? 'does not match' : 'matches'} "${condition.pattern}"`;
      break;
    case ConditionType.IS_DRAFT:
      description = `${condition.negate ? 'Is not' : 'Is'} a draft PR`;
      break;
    case ConditionType.DAYS_SINCE_CREATED:
      description = `Created ${condition.operator} ${condition.days} days ago`;
      break;
    case ConditionType.DAYS_SINCE_UPDATED:
      description = `Updated ${condition.operator} ${condition.days} days ago`;
      break;
    default:
      description = `Condition: ${condition.type}`;
  }
  
  return (
    <Card className="border-l-4 border-green-500">
      <CardBody className="py-2 px-4">
        <p>{description}</p>
      </CardBody>
    </Card>
  );
}

interface ActionRendererProps {
  action: Action;
}

function ActionRenderer({ action }: ActionRendererProps) {
  let description = '';
  
  switch (action.type) {
    case ActionType.ADD_LABEL:
      description = `Add label "${action.label}"`;
      break;
    case ActionType.REMOVE_LABEL:
      description = `Remove label "${action.label}"`;
      break;
    case ActionType.ASSIGN_USER:
      description = `Assign to ${action.username}`;
      break;
    case ActionType.UNASSIGN_USER:
      description = `Unassign ${action.username}`;
      break;
    case ActionType.ADD_COMMENT:
      description = `Add comment: "${action.body.length > 50 ? action.body.substring(0, 50) + '...' : action.body}"`;
      break;
    case ActionType.CLOSE:
      description = `Close ${action.reason ? `with reason: ${action.reason}` : ''}`;
      break;
    case ActionType.REOPEN:
      description = 'Reopen';
      break;
    case ActionType.REQUEST_REVIEW:
      description = `Request review from ${action.username}`;
      break;
    case ActionType.SET_MILESTONE:
      description = `Set milestone to ID: ${action.milestoneId}`;
      break;
    case ActionType.REMOVE_MILESTONE:
      description = 'Remove milestone';
      break;
    case ActionType.LOCK_CONVERSATION:
      description = `Lock conversation ${action.reason ? `with reason: ${action.reason}` : ''}`;
      break;
    case ActionType.UNLOCK_CONVERSATION:
      description = 'Unlock conversation';
      break;
    case ActionType.MARK_AS_DUPLICATE:
      description = `Mark as duplicate of #${action.originalIssueNumber}`;
      break;
    case ActionType.CONVERT_TO_DRAFT:
      description = 'Convert to draft';
      break;
    case ActionType.READY_FOR_REVIEW:
      description = 'Mark as ready for review';
      break;
    case ActionType.MERGE:
      description = `Merge PR using ${action.mergeMethod || 'merge'} method`;
      break;
    default:
      description = `Action: ${action.type}`;
  }
  
  return <p>{description}</p>;
}
