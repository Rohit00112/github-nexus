"use client";

import { useState, useEffect } from "react";
import { useAutomation } from "../../context/AutomationContext";
import { 
  AutomationRule, 
  AutomationResourceType, 
  ConditionGroup, 
  ConditionOperator, 
  Action, 
  ActionType,
  ConditionType,
  Condition
} from "../../types/automation";
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectItem, 
  Switch, 
  Card, 
  CardBody,
  Divider,
  Chip
} from "@nextui-org/react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import ConditionEditor from "./ConditionEditor";
import ActionEditor from "./ActionEditor";

interface RuleFormProps {
  ruleId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function RuleForm({ ruleId, onCancel, onSuccess }: RuleFormProps) {
  const { rules, createRule, updateRule } = useAutomation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<AutomationResourceType>(AutomationResourceType.BOTH);
  const [enabled, setEnabled] = useState(true);
  const [conditions, setConditions] = useState<ConditionGroup>({
    operator: ConditionOperator.AND,
    conditions: [],
  });
  const [actions, setActions] = useState<Action[]>([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ruleId) {
      const rule = rules.find(r => r.id === ruleId);
      if (rule) {
        setName(rule.name);
        setDescription(rule.description || "");
        setResourceType(rule.resourceType);
        setEnabled(rule.enabled);
        setConditions(rule.conditions);
        setActions(rule.actions);
        setRepositories(rule.repositories || []);
        setIsEditing(true);
      }
    }
  }, [ruleId, rules]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (conditions.conditions.length === 0) {
      newErrors.conditions = "At least one condition is required";
    }
    
    if (actions.length === 0) {
      newErrors.actions = "At least one action is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    const ruleData = {
      name,
      description: description.trim() || undefined,
      resourceType,
      enabled,
      conditions,
      actions,
      repositories: repositories.length > 0 ? repositories : undefined,
    };
    
    try {
      if (isEditing && ruleId) {
        await updateRule(ruleId, ruleData);
      } else {
        await createRule(ruleData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving rule:", error);
      setErrors({ submit: "Failed to save rule. Please try again." });
    }
  };

  const handleAddCondition = () => {
    setConditions({
      ...conditions,
      conditions: [
        ...conditions.conditions,
        {
          type: ConditionType.TITLE_CONTAINS,
          value: "",
        } as Condition,
      ],
    });
  };

  const handleUpdateCondition = (index: number, condition: Condition) => {
    const newConditions = [...conditions.conditions];
    newConditions[index] = condition;
    setConditions({
      ...conditions,
      conditions: newConditions,
    });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = [...conditions.conditions];
    newConditions.splice(index, 1);
    setConditions({
      ...conditions,
      conditions: newConditions,
    });
  };

  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        type: ActionType.ADD_LABEL,
        label: "",
      },
    ]);
  };

  const handleUpdateAction = (index: number, action: Action) => {
    const newActions = [...actions];
    newActions[index] = action;
    setActions(newActions);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };

  const handleOperatorChange = (operator: ConditionOperator) => {
    setConditions({
      ...conditions,
      operator,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Rule Name"
          placeholder="Enter a name for this rule"
          value={name}
          onChange={(e) => setName(e.target.value)}
          isRequired
          errorMessage={errors.name}
          isInvalid={!!errors.name}
        />
        
        <Select
          label="Applies To"
          placeholder="Select resource type"
          selectedKeys={[resourceType]}
          onChange={(e) => setResourceType(e.target.value as AutomationResourceType)}
        >
          <SelectItem key={AutomationResourceType.BOTH} value={AutomationResourceType.BOTH}>
            Issues & Pull Requests
          </SelectItem>
          <SelectItem key={AutomationResourceType.ISSUE} value={AutomationResourceType.ISSUE}>
            Issues Only
          </SelectItem>
          <SelectItem key={AutomationResourceType.PULL_REQUEST} value={AutomationResourceType.PULL_REQUEST}>
            Pull Requests Only
          </SelectItem>
        </Select>
      </div>
      
      <Textarea
        label="Description (Optional)"
        placeholder="Enter a description for this rule"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <div className="flex items-center">
        <Switch
          isSelected={enabled}
          onValueChange={setEnabled}
        />
        <span className="ml-2">Rule is {enabled ? 'enabled' : 'disabled'}</span>
      </div>
      
      <Divider />
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Conditions</h3>
          <div className="flex items-center space-x-2">
            <Select
              size="sm"
              label="Match"
              selectedKeys={[conditions.operator]}
              onChange={(e) => handleOperatorChange(e.target.value as ConditionOperator)}
              className="w-40"
            >
              <SelectItem key={ConditionOperator.AND} value={ConditionOperator.AND}>
                ALL (AND)
              </SelectItem>
              <SelectItem key={ConditionOperator.OR} value={ConditionOperator.OR}>
                ANY (OR)
              </SelectItem>
            </Select>
            <Button
              size="sm"
              color="primary"
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={handleAddCondition}
            >
              Add Condition
            </Button>
          </div>
        </div>
        
        {errors.conditions && (
          <p className="text-danger text-sm mb-2">{errors.conditions}</p>
        )}
        
        <div className="space-y-3">
          {conditions.conditions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No conditions added yet. Add a condition to define when this rule should run.
              </p>
            </div>
          ) : (
            conditions.conditions.map((condition, index) => (
              <Card key={index} className="border-l-4 border-green-500">
                <CardBody>
                  <div className="flex items-start">
                    <div className="flex-grow">
                      <ConditionEditor
                        condition={condition as Condition}
                        onChange={(updatedCondition) => handleUpdateCondition(index, updatedCondition)}
                        resourceType={resourceType}
                      />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveCondition(index)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
      
      <Divider />
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Actions</h3>
          <Button
            size="sm"
            color="primary"
            startContent={<PlusIcon className="h-4 w-4" />}
            onPress={handleAddAction}
          >
            Add Action
          </Button>
        </div>
        
        {errors.actions && (
          <p className="text-danger text-sm mb-2">{errors.actions}</p>
        )}
        
        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No actions added yet. Add an action to define what should happen when conditions match.
              </p>
            </div>
          ) : (
            actions.map((action, index) => (
              <Card key={index} className="border-l-4 border-blue-500">
                <CardBody>
                  <div className="flex items-start">
                    <div className="flex-grow">
                      <ActionEditor
                        action={action}
                        onChange={(updatedAction) => handleUpdateAction(index, updatedAction)}
                        resourceType={resourceType}
                      />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveAction(index)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {errors.submit && (
        <p className="text-danger">{errors.submit}</p>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" onPress={handleSubmit}>
          {isEditing ? "Update Rule" : "Create Rule"}
        </Button>
      </div>
    </div>
  );
}
