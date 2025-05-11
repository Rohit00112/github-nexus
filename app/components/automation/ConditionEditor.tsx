"use client";

import { useState, useEffect } from "react";
import { 
  Condition, 
  ConditionType, 
  TextMatchCondition, 
  RegexMatchCondition,
  LabelCondition,
  UserCondition,
  FilePathCondition,
  BranchCondition,
  TimeCondition,
  DraftCondition,
  AutomationResourceType
} from "@/app/types/automation";
import { 
  Select, 
  SelectItem, 
  Input, 
  Switch, 
  Textarea,
  RadioGroup,
  Radio
} from "@nextui-org/react";

interface ConditionEditorProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  resourceType: AutomationResourceType;
}

export default function ConditionEditor({ condition, onChange, resourceType }: ConditionEditorProps) {
  const [conditionType, setConditionType] = useState<ConditionType>(condition.type);
  const [negate, setNegate] = useState<boolean>(condition.negate || false);

  useEffect(() => {
    setConditionType(condition.type);
    setNegate(condition.negate || false);
  }, [condition]);

  const handleTypeChange = (newType: ConditionType) => {
    setConditionType(newType);
    
    // Create a new condition of the selected type with default values
    let newCondition: Condition;
    
    switch (newType) {
      case ConditionType.TITLE_CONTAINS:
      case ConditionType.BODY_CONTAINS:
      case ConditionType.COMMENT_CONTAINS:
        newCondition = {
          type: newType,
          value: "",
          caseSensitive: false,
          negate,
        } as TextMatchCondition;
        break;
      case ConditionType.TITLE_MATCHES_REGEX:
      case ConditionType.BODY_MATCHES_REGEX:
        newCondition = {
          type: newType,
          pattern: "",
          flags: "i",
          negate,
        } as RegexMatchCondition;
        break;
      case ConditionType.HAS_LABEL:
        newCondition = {
          type: newType,
          label: "",
          negate,
        } as LabelCondition;
        break;
      case ConditionType.CREATED_BY:
      case ConditionType.ASSIGNED_TO:
      case ConditionType.MENTIONS_USER:
      case ConditionType.COMMENT_BY:
      case ConditionType.REVIEW_REQUESTED_FROM:
        newCondition = {
          type: newType,
          username: "",
          negate,
        } as UserCondition;
        break;
      case ConditionType.MODIFIED_FILES_MATCH:
        newCondition = {
          type: newType,
          pattern: "",
          isRegex: false,
          negate,
        } as FilePathCondition;
        break;
      case ConditionType.BRANCH_MATCHES:
        newCondition = {
          type: newType,
          pattern: "",
          isRegex: false,
          negate,
        } as BranchCondition;
        break;
      case ConditionType.IS_DRAFT:
        newCondition = {
          type: newType,
          isDraft: true,
          negate,
        } as DraftCondition;
        break;
      case ConditionType.DAYS_SINCE_CREATED:
      case ConditionType.DAYS_SINCE_UPDATED:
      case ConditionType.DAYS_SINCE_CLOSED:
        newCondition = {
          type: newType,
          days: 7,
          operator: ">",
          negate,
        } as TimeCondition;
        break;
      default:
        newCondition = {
          type: newType,
          negate,
        } as Condition;
    }
    
    onChange(newCondition);
  };

  const handleNegateChange = (value: boolean) => {
    setNegate(value);
    onChange({
      ...condition,
      negate: value,
    });
  };

  const renderConditionFields = () => {
    switch (conditionType) {
      case ConditionType.TITLE_CONTAINS:
      case ConditionType.BODY_CONTAINS:
      case ConditionType.COMMENT_CONTAINS:
        return (
          <TextMatchConditionFields
            condition={condition as TextMatchCondition}
            onChange={onChange}
          />
        );
      case ConditionType.TITLE_MATCHES_REGEX:
      case ConditionType.BODY_MATCHES_REGEX:
        return (
          <RegexMatchConditionFields
            condition={condition as RegexMatchCondition}
            onChange={onChange}
          />
        );
      case ConditionType.HAS_LABEL:
        return (
          <LabelConditionFields
            condition={condition as LabelCondition}
            onChange={onChange}
          />
        );
      case ConditionType.CREATED_BY:
      case ConditionType.ASSIGNED_TO:
      case ConditionType.MENTIONS_USER:
      case ConditionType.COMMENT_BY:
      case ConditionType.REVIEW_REQUESTED_FROM:
        return (
          <UserConditionFields
            condition={condition as UserCondition}
            onChange={onChange}
          />
        );
      case ConditionType.MODIFIED_FILES_MATCH:
        return (
          <FilePathConditionFields
            condition={condition as FilePathCondition}
            onChange={onChange}
          />
        );
      case ConditionType.BRANCH_MATCHES:
        return (
          <BranchConditionFields
            condition={condition as BranchCondition}
            onChange={onChange}
          />
        );
      case ConditionType.IS_DRAFT:
        return (
          <DraftConditionFields
            condition={condition as DraftCondition}
            onChange={onChange}
          />
        );
      case ConditionType.DAYS_SINCE_CREATED:
      case ConditionType.DAYS_SINCE_UPDATED:
      case ConditionType.DAYS_SINCE_CLOSED:
        return (
          <TimeConditionFields
            condition={condition as TimeCondition}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };

  // Filter condition types based on resource type
  const getConditionOptions = () => {
    const allOptions = [
      { key: ConditionType.TITLE_CONTAINS, label: "Title contains text" },
      { key: ConditionType.BODY_CONTAINS, label: "Body contains text" },
      { key: ConditionType.TITLE_MATCHES_REGEX, label: "Title matches regex" },
      { key: ConditionType.BODY_MATCHES_REGEX, label: "Body matches regex" },
      { key: ConditionType.HAS_LABEL, label: "Has label" },
      { key: ConditionType.CREATED_BY, label: "Created by user" },
      { key: ConditionType.ASSIGNED_TO, label: "Assigned to user" },
      { key: ConditionType.MENTIONS_USER, label: "Mentions user" },
      { key: ConditionType.COMMENT_CONTAINS, label: "Comment contains text" },
      { key: ConditionType.COMMENT_BY, label: "Comment by user" },
      { key: ConditionType.DAYS_SINCE_CREATED, label: "Days since created" },
      { key: ConditionType.DAYS_SINCE_UPDATED, label: "Days since updated" },
      { key: ConditionType.DAYS_SINCE_CLOSED, label: "Days since closed" },
    ];
    
    const prOnlyOptions = [
      { key: ConditionType.MODIFIED_FILES_MATCH, label: "Modified files match" },
      { key: ConditionType.BRANCH_MATCHES, label: "Branch matches" },
      { key: ConditionType.IS_DRAFT, label: "Is draft PR" },
      { key: ConditionType.REVIEW_REQUESTED_FROM, label: "Review requested from" },
      { key: ConditionType.REVIEW_STATE, label: "Review state" },
    ];
    
    if (resourceType === AutomationResourceType.PULL_REQUEST || resourceType === AutomationResourceType.BOTH) {
      return [...allOptions, ...prOnlyOptions];
    }
    
    return allOptions;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Condition Type"
          selectedKeys={[conditionType]}
          onChange={(e) => handleTypeChange(e.target.value as ConditionType)}
        >
          {getConditionOptions().map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
        
        <div className="flex items-center h-full pt-6">
          <Switch
            isSelected={negate}
            onValueChange={handleNegateChange}
          />
          <span className="ml-2">Negate condition (NOT)</span>
        </div>
      </div>
      
      {renderConditionFields()}
    </div>
  );
}

interface TextMatchConditionFieldsProps {
  condition: TextMatchCondition;
  onChange: (condition: Condition) => void;
}

function TextMatchConditionFields({ condition, onChange }: TextMatchConditionFieldsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Text to match"
        placeholder="Enter text to match"
        value={condition.value}
        onChange={(e) => onChange({
          ...condition,
          value: e.target.value,
        })}
      />
      
      <div className="flex items-center">
        <Switch
          isSelected={condition.caseSensitive}
          onValueChange={(value) => onChange({
            ...condition,
            caseSensitive: value,
          })}
        />
        <span className="ml-2">Case sensitive</span>
      </div>
    </div>
  );
}

interface RegexMatchConditionFieldsProps {
  condition: RegexMatchCondition;
  onChange: (condition: Condition) => void;
}

function RegexMatchConditionFields({ condition, onChange }: RegexMatchConditionFieldsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Regex pattern"
        placeholder="Enter regex pattern"
        value={condition.pattern}
        onChange={(e) => onChange({
          ...condition,
          pattern: e.target.value,
        })}
      />
      
      <Input
        label="Regex flags"
        placeholder="e.g., i for case-insensitive"
        value={condition.flags}
        onChange={(e) => onChange({
          ...condition,
          flags: e.target.value,
        })}
      />
    </div>
  );
}

interface LabelConditionFieldsProps {
  condition: LabelCondition;
  onChange: (condition: Condition) => void;
}

function LabelConditionFields({ condition, onChange }: LabelConditionFieldsProps) {
  return (
    <Input
      label="Label name"
      placeholder="Enter label name"
      value={condition.label}
      onChange={(e) => onChange({
        ...condition,
        label: e.target.value,
      })}
    />
  );
}

interface UserConditionFieldsProps {
  condition: UserCondition;
  onChange: (condition: Condition) => void;
}

function UserConditionFields({ condition, onChange }: UserConditionFieldsProps) {
  return (
    <Input
      label="Username"
      placeholder="Enter GitHub username"
      value={condition.username}
      onChange={(e) => onChange({
        ...condition,
        username: e.target.value,
      })}
    />
  );
}

interface FilePathConditionFieldsProps {
  condition: FilePathCondition;
  onChange: (condition: Condition) => void;
}

function FilePathConditionFields({ condition, onChange }: FilePathConditionFieldsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="File path pattern"
        placeholder="e.g., *.js or src/**/*.ts"
        value={condition.pattern}
        onChange={(e) => onChange({
          ...condition,
          pattern: e.target.value,
        })}
      />
      
      <div className="flex items-center">
        <Switch
          isSelected={condition.isRegex}
          onValueChange={(value) => onChange({
            ...condition,
            isRegex: value,
          })}
        />
        <span className="ml-2">Use regex pattern (instead of glob)</span>
      </div>
    </div>
  );
}

interface BranchConditionFieldsProps {
  condition: BranchCondition;
  onChange: (condition: Condition) => void;
}

function BranchConditionFields({ condition, onChange }: BranchConditionFieldsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Branch name pattern"
        placeholder="e.g., main or feature/*"
        value={condition.pattern}
        onChange={(e) => onChange({
          ...condition,
          pattern: e.target.value,
        })}
      />
      
      <div className="flex items-center">
        <Switch
          isSelected={condition.isRegex}
          onValueChange={(value) => onChange({
            ...condition,
            isRegex: value,
          })}
        />
        <span className="ml-2">Use regex pattern</span>
      </div>
    </div>
  );
}

interface DraftConditionFieldsProps {
  condition: DraftCondition;
  onChange: (condition: Condition) => void;
}

function DraftConditionFields({ condition, onChange }: DraftConditionFieldsProps) {
  return (
    <RadioGroup
      label="Draft status"
      value={condition.isDraft ? "draft" : "ready"}
      onValueChange={(value) => onChange({
        ...condition,
        isDraft: value === "draft",
      })}
    >
      <Radio value="draft">Is a draft PR</Radio>
      <Radio value="ready">Is ready for review</Radio>
    </RadioGroup>
  );
}

interface TimeConditionFieldsProps {
  condition: TimeCondition;
  onChange: (condition: Condition) => void;
}

function TimeConditionFields({ condition, onChange }: TimeConditionFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Select
        label="Operator"
        selectedKeys={[condition.operator]}
        onChange={(e) => onChange({
          ...condition,
          operator: e.target.value as ">" | ">=" | "=" | "<=" | "<",
        })}
      >
        <SelectItem key=">" value=">">Greater than</SelectItem>
        <SelectItem key=">=" value=">=">Greater than or equal</SelectItem>
        <SelectItem key="=" value="=">Equal to</SelectItem>
        <SelectItem key="<=" value="<=">Less than or equal</SelectItem>
        <SelectItem key="<" value="<">Less than</SelectItem>
      </Select>
      
      <Input
        type="number"
        label="Days"
        placeholder="Number of days"
        value={condition.days.toString()}
        onChange={(e) => onChange({
          ...condition,
          days: parseInt(e.target.value) || 0,
        })}
      />
    </div>
  );
}
