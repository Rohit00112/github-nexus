"use client";

import { FC, useState } from 'react';
import { 
  Button, 
  Card, 
  CardBody, 
  Input, 
  Select, 
  SelectItem, 
  Checkbox, 
  Divider,
  Textarea
} from '@nextui-org/react';

export interface AutomationRule {
  id?: string;
  name: string;
  description: string;
  trigger: {
    type: 'issue_opened' | 'issue_labeled' | 'issue_assigned' | 'pr_opened' | 'pr_labeled' | 'pr_merged';
    conditions: {
      labels?: string[];
      title_contains?: string;
      body_contains?: string;
      author?: string;
      branch?: string;
    };
  };
  actions: {
    type: 'add_label' | 'remove_label' | 'assign' | 'comment' | 'close' | 'reopen';
    value: string;
  }[];
  isActive: boolean;
}

interface AutomationRuleFormProps {
  initialRule?: AutomationRule;
  onSave: (rule: AutomationRule) => void;
  onCancel: () => void;
}

const DEFAULT_RULE: AutomationRule = {
  name: '',
  description: '',
  trigger: {
    type: 'issue_opened',
    conditions: {}
  },
  actions: [
    {
      type: 'add_label',
      value: ''
    }
  ],
  isActive: true
};

const AutomationRuleForm: FC<AutomationRuleFormProps> = ({ 
  initialRule = DEFAULT_RULE,
  onSave,
  onCancel
}) => {
  const [rule, setRule] = useState<AutomationRule>(initialRule);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const triggerTypes = [
    { value: 'issue_opened', label: 'Issue Opened' },
    { value: 'issue_labeled', label: 'Issue Labeled' },
    { value: 'issue_assigned', label: 'Issue Assigned' },
    { value: 'pr_opened', label: 'Pull Request Opened' },
    { value: 'pr_labeled', label: 'Pull Request Labeled' },
    { value: 'pr_merged', label: 'Pull Request Merged' }
  ];

  const actionTypes = [
    { value: 'add_label', label: 'Add Label' },
    { value: 'remove_label', label: 'Remove Label' },
    { value: 'assign', label: 'Assign User' },
    { value: 'comment', label: 'Add Comment' },
    { value: 'close', label: 'Close Issue/PR' },
    { value: 'reopen', label: 'Reopen Issue/PR' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setRule(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTriggerTypeChange = (value: string) => {
    setRule(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        type: value as AutomationRule['trigger']['type']
      }
    }));
  };

  const handleConditionChange = (field: string, value: string) => {
    setRule(prev => ({
      ...prev,
      trigger: {
        ...prev.trigger,
        conditions: {
          ...prev.trigger.conditions,
          [field]: value
        }
      }
    }));
  };

  const handleAddAction = () => {
    setRule(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          type: 'add_label',
          value: ''
        }
      ]
    }));
  };

  const handleRemoveAction = (index: number) => {
    setRule(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleActionTypeChange = (index: number, value: string) => {
    setRule(prev => {
      const newActions = [...prev.actions];
      newActions[index] = {
        ...newActions[index],
        type: value as AutomationRule['actions'][0]['type']
      };
      return {
        ...prev,
        actions: newActions
      };
    });
  };

  const handleActionValueChange = (index: number, value: string) => {
    setRule(prev => {
      const newActions = [...prev.actions];
      newActions[index] = {
        ...newActions[index],
        value
      };
      return {
        ...prev,
        actions: newActions
      };
    });
  };

  const handleToggleActive = () => {
    setRule(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!rule.name.trim()) {
      newErrors.name = 'Rule name is required';
    }
    
    if (rule.actions.some(action => !action.value.trim())) {
      newErrors.actions = 'All actions must have a value';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(rule);
    }
  };

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        <h2 className="text-xl font-semibold">
          {initialRule.id ? 'Edit Automation Rule' : 'Create Automation Rule'}
        </h2>
        
        <div className="space-y-4">
          <Input
            label="Rule Name"
            placeholder="Enter a name for this rule"
            value={rule.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            isRequired
          />
          
          <Textarea
            label="Description"
            placeholder="Describe what this rule does"
            value={rule.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          
          <Divider className="my-4" />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Trigger</h3>
            <Select
              label="When this happens"
              selectedKeys={[rule.trigger.type]}
              onChange={(e) => handleTriggerTypeChange(e.target.value)}
            >
              {triggerTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </Select>
            
            <div className="mt-4 space-y-3">
              <Input
                label="Labels (comma separated)"
                placeholder="bug, enhancement, etc."
                value={rule.trigger.conditions.labels?.join(', ') || ''}
                onChange={(e) => handleConditionChange('labels', e.target.value)}
              />
              
              <Input
                label="Title contains"
                placeholder="Enter text that should be in the title"
                value={rule.trigger.conditions.title_contains || ''}
                onChange={(e) => handleConditionChange('title_contains', e.target.value)}
              />
              
              <Input
                label="Author"
                placeholder="GitHub username"
                value={rule.trigger.conditions.author || ''}
                onChange={(e) => handleConditionChange('author', e.target.value)}
              />
            </div>
          </div>
          
          <Divider className="my-4" />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Actions</h3>
            {rule.actions.map((action, index) => (
              <div key={index} className="flex gap-2 mb-3 items-start">
                <Select
                  label="Action"
                  selectedKeys={[action.type]}
                  onChange={(e) => handleActionTypeChange(index, e.target.value)}
                  className="w-1/3"
                >
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
                
                <Input
                  label="Value"
                  placeholder={action.type === 'comment' ? 'Comment text' : 'Label name, username, etc.'}
                  value={action.value}
                  onChange={(e) => handleActionValueChange(index, e.target.value)}
                  className="w-2/3"
                />
                
                {rule.actions.length > 1 && (
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onClick={() => handleRemoveAction(index)}
                    className="mt-7"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            
            {errors.actions && (
              <p className="text-danger text-sm mt-1">{errors.actions}</p>
            )}
            
            <Button
              color="primary"
              variant="flat"
              onClick={handleAddAction}
              className="mt-2"
            >
              + Add Action
            </Button>
          </div>
          
          <Divider className="my-4" />
          
          <Checkbox
            isSelected={rule.isActive}
            onChange={handleToggleActive}
          >
            Rule is active
          </Checkbox>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="flat"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
            >
              {initialRule.id ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AutomationRuleForm;
