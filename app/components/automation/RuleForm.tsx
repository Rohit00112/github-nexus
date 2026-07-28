"use client";

import { useState, useEffect } from "react";
import { useAutomation } from "../../context/AutomationContext";
import { useGitHub } from "../../context/GitHubContext";
import {
  AutomationResourceType,
  ConditionGroup,
  ConditionOperator,
  Action,
  ActionType,
  ConditionType,
  Condition
} from "../../types/automation";
import { GitHubRepository } from "../../types/github";
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
  Chip,
  Autocomplete,
  AutocompleteItem
} from "@nextui-org/react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import ConditionEditor from "./ConditionEditor";
import ActionEditor from "./ActionEditor";

interface RuleFormProps {
  ruleId?: string;
  onCancel: () => void;
  onSuccess: () => void;
  templateType?: string;
}

export default function RuleForm({ ruleId, onCancel, onSuccess, templateType }: RuleFormProps) {
  const { rules, createRule, updateRule } = useAutomation();
  const { githubService } = useGitHub();
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
  const [availableRepositories, setAvailableRepositories] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedRepoInput, setSelectedRepoInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch repositories when component mounts
  useEffect(() => {
    async function fetchRepositories() {
      if (githubService) {
        try {
          setIsLoadingRepos(true);
          const user = await githubService.getCurrentUser();
          const repos = await githubService.getUserRepositories(user.login, 1, 100);
          setAvailableRepositories(repos as GitHubRepository[]);
        } catch (error) {
          console.error("Error fetching repositories:", error);
        } finally {
          setIsLoadingRepos(false);
        }
      }
    }

    fetchRepositories();
  }, [githubService]);

  // Load rule data when editing or apply template
  useEffect(() => {
    if (ruleId) {
      // Editing an existing rule
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
    } else if (templateType) {
      // Applying a template
      switch (templateType) {
        case "auto-label":
          setName("Auto-Label Issues");
          setDescription("Automatically add labels to issues based on keywords in the title or body");
          setResourceType(AutomationResourceType.ISSUE);
          setEnabled(true);
          setConditions({
            operator: ConditionOperator.OR,
            conditions: [
              {
                type: ConditionType.TITLE_CONTAINS,
                value: "bug",
                negate: false
              },
              {
                type: ConditionType.BODY_CONTAINS,
                value: "bug",
                negate: false
              }
            ]
          });
          setActions([
            {
              type: ActionType.ADD_LABEL,
              label: "bug"
            }
          ]);
          break;

        case "auto-assign":
          setName("Auto-Assign Pull Requests");
          setDescription("Automatically assign pull requests to team members");
          setResourceType(AutomationResourceType.PULL_REQUEST);
          setEnabled(true);
          setConditions({
            operator: ConditionOperator.AND,
            conditions: [
              {
                type: ConditionType.TITLE_CONTAINS,
                value: "feature",
                negate: false
              }
            ]
          });
          setActions([
            {
              type: ActionType.ASSIGN_USER,
              username: ""
            }
          ]);
          break;

        case "welcome-comment":
          setName("Welcome New Contributors");
          setDescription("Add a welcome comment to first-time contributors");
          setResourceType(AutomationResourceType.BOTH);
          setEnabled(true);
          setConditions({
            operator: ConditionOperator.AND,
            conditions: [
              {
                type: ConditionType.CREATED_BY,
                username: "",
                negate: false
              }
            ]
          });
          setActions([
            {
              type: ActionType.ADD_COMMENT,
              body: "Thank you for your contribution! We'll review this as soon as possible."
            }
          ]);
          break;
      }
    }
  }, [ruleId, rules, templateType]);

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

      <div>
        <h3 className="text-md font-medium mb-2">Apply to Repositories</h3>
        <div className="mb-2">
          <Autocomplete
            label="Add Repository"
            placeholder="Search for repositories"
            isLoading={isLoadingRepos}
            defaultItems={availableRepositories}
            inputValue={selectedRepoInput}
            onInputChange={setSelectedRepoInput}
            onSelectionChange={(key) => {
              const repo = availableRepositories.find(r => r.id.toString() === key);
              if (repo && !repositories.includes(repo.full_name)) {
                setRepositories([...repositories, repo.full_name]);
                setSelectedRepoInput("");
              }
            }}
          >
            {(repo) => (
              <AutocompleteItem key={repo.id} textValue={repo.full_name}>
                <div className="flex gap-2 items-center">
                  <div>
                    <div className="text-sm">{repo.full_name}</div>
                    <div className="text-xs text-gray-500">{repo.description || 'No description'}</div>
                  </div>
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {repositories.length === 0 ? (
            <p className="text-sm text-gray-500">No repositories selected. Rule will apply to all repositories.</p>
          ) : (
            repositories.map((repo) => (
              <Chip
                key={repo}
                onClose={() => setRepositories(repositories.filter(r => r !== repo))}
                variant="flat"
              >
                {repo}
              </Chip>
            ))
          )}
        </div>
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
