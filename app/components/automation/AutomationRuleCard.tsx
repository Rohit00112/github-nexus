"use client";

import { FC } from 'react';
import { 
  Card, 
  CardBody, 
  CardFooter, 
  Button, 
  Chip, 
  Switch,
  Tooltip
} from '@nextui-org/react';
import { AutomationRule } from './AutomationRuleForm';

interface AutomationRuleCardProps {
  rule: AutomationRule;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleActive: (ruleId: string, isActive: boolean) => void;
}

const AutomationRuleCard: FC<AutomationRuleCardProps> = ({
  rule,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const getTriggerLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'issue_opened': 'Issue Opened',
      'issue_labeled': 'Issue Labeled',
      'issue_assigned': 'Issue Assigned',
      'pr_opened': 'Pull Request Opened',
      'pr_labeled': 'Pull Request Labeled',
      'pr_merged': 'Pull Request Merged'
    };
    return labels[type] || type;
  };

  const getActionLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'add_label': 'Add Label',
      'remove_label': 'Remove Label',
      'assign': 'Assign User',
      'comment': 'Add Comment',
      'close': 'Close Issue/PR',
      'reopen': 'Reopen Issue/PR'
    };
    return labels[type] || type;
  };

  const getConditionsText = (): string => {
    const conditions = rule.trigger.conditions;
    const parts: string[] = [];

    if (conditions.labels && conditions.labels.length > 0) {
      parts.push(`labels: ${conditions.labels.join(', ')}`);
    }
    
    if (conditions.title_contains) {
      parts.push(`title contains: "${conditions.title_contains}"`);
    }
    
    if (conditions.body_contains) {
      parts.push(`body contains: "${conditions.body_contains}"`);
    }
    
    if (conditions.author) {
      parts.push(`author: ${conditions.author}`);
    }
    
    if (conditions.branch) {
      parts.push(`branch: ${conditions.branch}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No conditions';
  };

  return (
    <Card className="w-full">
      <CardBody className="gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{rule.name}</h3>
            {rule.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {rule.description}
              </p>
            )}
          </div>
          <Switch
            isSelected={rule.isActive}
            onChange={() => onToggleActive(rule.id!, !rule.isActive)}
            size="sm"
            color="success"
          />
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Chip color="primary" variant="flat" size="sm">Trigger</Chip>
            <span className="text-sm font-medium">
              {getTriggerLabel(rule.trigger.type)}
            </span>
          </div>
          
          {Object.keys(rule.trigger.conditions).length > 0 && (
            <div className="ml-6 mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getConditionsText()}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <Chip color="success" variant="flat" size="sm">Actions</Chip>
          </div>
          
          <div className="ml-6">
            {rule.actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 mb-1">
                <span className="text-sm">
                  {getActionLabel(action.type)}:
                </span>
                <span className="text-sm font-medium">
                  {action.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="gap-2 justify-end">
        <Tooltip content="Edit rule">
          <Button
            isIconOnly
            variant="light"
            onClick={() => onEdit(rule)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </Button>
        </Tooltip>
        
        <Tooltip content="Delete rule">
          <Button
            isIconOnly
            variant="light"
            color="danger"
            onClick={() => onDelete(rule.id!)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};

export default AutomationRuleCard;
