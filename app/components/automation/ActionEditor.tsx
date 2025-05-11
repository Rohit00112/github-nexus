"use client";

import { useState, useEffect } from "react";
import { 
  Action, 
  ActionType, 
  LabelAction, 
  AssignmentAction,
  CommentAction,
  StateAction,
  MilestoneAction,
  LockAction,
  DuplicateAction,
  MergeAction,
  AutomationResourceType
} from "@/app/types/automation";
import { 
  Select, 
  SelectItem, 
  Input, 
  Textarea, 
  RadioGroup,
  Radio
} from "@nextui-org/react";

interface ActionEditorProps {
  action: Action;
  onChange: (action: Action) => void;
  resourceType: AutomationResourceType;
}

export default function ActionEditor({ action, onChange, resourceType }: ActionEditorProps) {
  const [actionType, setActionType] = useState<ActionType>(action.type);

  useEffect(() => {
    setActionType(action.type);
  }, [action]);

  const handleTypeChange = (newType: ActionType) => {
    setActionType(newType);
    
    // Create a new action of the selected type with default values
    let newAction: Action;
    
    switch (newType) {
      case ActionType.ADD_LABEL:
      case ActionType.REMOVE_LABEL:
        newAction = {
          type: newType,
          label: "",
        } as LabelAction;
        break;
      case ActionType.ASSIGN_USER:
      case ActionType.UNASSIGN_USER:
      case ActionType.REQUEST_REVIEW:
        newAction = {
          type: newType,
          username: "",
        } as AssignmentAction;
        break;
      case ActionType.ADD_COMMENT:
        newAction = {
          type: newType,
          body: "",
          includeConditionSummary: false,
        } as CommentAction;
        break;
      case ActionType.CLOSE:
        newAction = {
          type: newType,
          reason: "completed",
        } as StateAction;
        break;
      case ActionType.SET_MILESTONE:
        newAction = {
          type: newType,
          milestoneId: 0,
        } as MilestoneAction;
        break;
      case ActionType.LOCK_CONVERSATION:
        newAction = {
          type: newType,
          reason: "resolved",
        } as LockAction;
        break;
      case ActionType.MARK_AS_DUPLICATE:
        newAction = {
          type: newType,
          originalIssueNumber: 0,
        } as DuplicateAction;
        break;
      case ActionType.MERGE:
        newAction = {
          type: newType,
          mergeMethod: "merge",
        } as MergeAction;
        break;
      default:
        newAction = {
          type: newType,
        } as Action;
    }
    
    onChange(newAction);
  };

  const renderActionFields = () => {
    switch (actionType) {
      case ActionType.ADD_LABEL:
      case ActionType.REMOVE_LABEL:
        return (
          <LabelActionFields
            action={action as LabelAction}
            onChange={onChange}
          />
        );
      case ActionType.ASSIGN_USER:
      case ActionType.UNASSIGN_USER:
      case ActionType.REQUEST_REVIEW:
        return (
          <AssignmentActionFields
            action={action as AssignmentAction}
            onChange={onChange}
          />
        );
      case ActionType.ADD_COMMENT:
        return (
          <CommentActionFields
            action={action as CommentAction}
            onChange={onChange}
          />
        );
      case ActionType.CLOSE:
        return (
          <CloseActionFields
            action={action as StateAction}
            onChange={onChange}
          />
        );
      case ActionType.SET_MILESTONE:
        return (
          <MilestoneActionFields
            action={action as MilestoneAction}
            onChange={onChange}
          />
        );
      case ActionType.LOCK_CONVERSATION:
        return (
          <LockActionFields
            action={action as LockAction}
            onChange={onChange}
          />
        );
      case ActionType.MARK_AS_DUPLICATE:
        return (
          <DuplicateActionFields
            action={action as DuplicateAction}
            onChange={onChange}
          />
        );
      case ActionType.MERGE:
        return (
          <MergeActionFields
            action={action as MergeAction}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };

  // Filter action types based on resource type
  const getActionOptions = () => {
    const allOptions = [
      { key: ActionType.ADD_LABEL, label: "Add label" },
      { key: ActionType.REMOVE_LABEL, label: "Remove label" },
      { key: ActionType.ASSIGN_USER, label: "Assign user" },
      { key: ActionType.UNASSIGN_USER, label: "Unassign user" },
      { key: ActionType.ADD_COMMENT, label: "Add comment" },
      { key: ActionType.CLOSE, label: "Close" },
      { key: ActionType.REOPEN, label: "Reopen" },
      { key: ActionType.SET_MILESTONE, label: "Set milestone" },
      { key: ActionType.REMOVE_MILESTONE, label: "Remove milestone" },
      { key: ActionType.LOCK_CONVERSATION, label: "Lock conversation" },
      { key: ActionType.UNLOCK_CONVERSATION, label: "Unlock conversation" },
      { key: ActionType.MARK_AS_DUPLICATE, label: "Mark as duplicate" },
    ];
    
    const prOnlyOptions = [
      { key: ActionType.REQUEST_REVIEW, label: "Request review" },
      { key: ActionType.CONVERT_TO_DRAFT, label: "Convert to draft" },
      { key: ActionType.READY_FOR_REVIEW, label: "Mark ready for review" },
      { key: ActionType.MERGE, label: "Merge pull request" },
    ];
    
    if (resourceType === AutomationResourceType.PULL_REQUEST || resourceType === AutomationResourceType.BOTH) {
      return [...allOptions, ...prOnlyOptions];
    }
    
    return allOptions;
  };

  return (
    <div className="space-y-4">
      <Select
        label="Action Type"
        selectedKeys={[actionType]}
        onChange={(e) => handleTypeChange(e.target.value as ActionType)}
      >
        {getActionOptions().map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
      
      {renderActionFields()}
    </div>
  );
}

interface LabelActionFieldsProps {
  action: LabelAction;
  onChange: (action: Action) => void;
}

function LabelActionFields({ action, onChange }: LabelActionFieldsProps) {
  return (
    <Input
      label="Label name"
      placeholder="Enter label name"
      value={action.label}
      onChange={(e) => onChange({
        ...action,
        label: e.target.value,
      })}
    />
  );
}

interface AssignmentActionFieldsProps {
  action: AssignmentAction;
  onChange: (action: Action) => void;
}

function AssignmentActionFields({ action, onChange }: AssignmentActionFieldsProps) {
  return (
    <Input
      label="Username"
      placeholder="Enter GitHub username"
      value={action.username}
      onChange={(e) => onChange({
        ...action,
        username: e.target.value,
      })}
    />
  );
}

interface CommentActionFieldsProps {
  action: CommentAction;
  onChange: (action: Action) => void;
}

function CommentActionFields({ action, onChange }: CommentActionFieldsProps) {
  return (
    <Textarea
      label="Comment text"
      placeholder="Enter comment text"
      value={action.body}
      onChange={(e) => onChange({
        ...action,
        body: e.target.value,
      })}
      minRows={3}
    />
  );
}

interface CloseActionFieldsProps {
  action: StateAction;
  onChange: (action: Action) => void;
}

function CloseActionFields({ action, onChange }: CloseActionFieldsProps) {
  return (
    <Select
      label="Close reason"
      selectedKeys={[action.reason || "completed"]}
      onChange={(e) => onChange({
        ...action,
        reason: e.target.value,
      })}
    >
      <SelectItem key="completed" value="completed">Completed</SelectItem>
      <SelectItem key="not_planned" value="not_planned">Not planned</SelectItem>
    </Select>
  );
}

interface MilestoneActionFieldsProps {
  action: MilestoneAction;
  onChange: (action: Action) => void;
}

function MilestoneActionFields({ action, onChange }: MilestoneActionFieldsProps) {
  return (
    <Input
      type="number"
      label="Milestone ID"
      placeholder="Enter milestone ID"
      value={action.milestoneId?.toString() || ""}
      onChange={(e) => onChange({
        ...action,
        milestoneId: parseInt(e.target.value) || 0,
      })}
    />
  );
}

interface LockActionFieldsProps {
  action: LockAction;
  onChange: (action: Action) => void;
}

function LockActionFields({ action, onChange }: LockActionFieldsProps) {
  return (
    <Select
      label="Lock reason"
      selectedKeys={[action.reason || "resolved"]}
      onChange={(e) => onChange({
        ...action,
        reason: e.target.value as "off-topic" | "too heated" | "resolved" | "spam",
      })}
    >
      <SelectItem key="resolved" value="resolved">Resolved</SelectItem>
      <SelectItem key="off-topic" value="off-topic">Off-topic</SelectItem>
      <SelectItem key="too heated" value="too heated">Too heated</SelectItem>
      <SelectItem key="spam" value="spam">Spam</SelectItem>
    </Select>
  );
}

interface DuplicateActionFieldsProps {
  action: DuplicateAction;
  onChange: (action: Action) => void;
}

function DuplicateActionFields({ action, onChange }: DuplicateActionFieldsProps) {
  return (
    <Input
      type="number"
      label="Original issue number"
      placeholder="Enter issue number"
      value={action.originalIssueNumber.toString()}
      onChange={(e) => onChange({
        ...action,
        originalIssueNumber: parseInt(e.target.value) || 0,
      })}
    />
  );
}

interface MergeActionFieldsProps {
  action: MergeAction;
  onChange: (action: Action) => void;
}

function MergeActionFields({ action, onChange }: MergeActionFieldsProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Merge method"
        selectedKeys={[action.mergeMethod || "merge"]}
        onChange={(e) => onChange({
          ...action,
          mergeMethod: e.target.value as "merge" | "squash" | "rebase",
        })}
      >
        <SelectItem key="merge" value="merge">Merge</SelectItem>
        <SelectItem key="squash" value="squash">Squash</SelectItem>
        <SelectItem key="rebase" value="rebase">Rebase</SelectItem>
      </Select>
      
      <Input
        label="Commit title (optional)"
        placeholder="Enter commit title"
        value={action.commitTitle || ""}
        onChange={(e) => onChange({
          ...action,
          commitTitle: e.target.value,
        })}
      />
      
      <Textarea
        label="Commit message (optional)"
        placeholder="Enter commit message"
        value={action.commitMessage || ""}
        onChange={(e) => onChange({
          ...action,
          commitMessage: e.target.value,
        })}
        minRows={2}
      />
    </div>
  );
}
