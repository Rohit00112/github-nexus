/**
 * Types for the workflow automation feature
 */

/**
 * Types of resources that can be automated
 */
export enum AutomationResourceType {
  ISSUE = 'issue',
  PULL_REQUEST = 'pull_request',
  BOTH = 'both'
}

/**
 * Types of conditions that can be used in automation rules
 */
export enum ConditionType {
  TITLE_CONTAINS = 'title_contains',
  BODY_CONTAINS = 'body_contains',
  TITLE_MATCHES_REGEX = 'title_matches_regex',
  BODY_MATCHES_REGEX = 'body_matches_regex',
  HAS_LABEL = 'has_label',
  CREATED_BY = 'created_by',
  ASSIGNED_TO = 'assigned_to',
  MENTIONS_USER = 'mentions_user',
  MODIFIED_FILES_MATCH = 'modified_files_match', // PR only
  BRANCH_MATCHES = 'branch_matches', // PR only
  REPOSITORY_MATCHES = 'repository_matches',
  IS_DRAFT = 'is_draft', // PR only
  REVIEW_REQUESTED_FROM = 'review_requested_from', // PR only
  REVIEW_STATE = 'review_state', // PR only
  COMMENT_CONTAINS = 'comment_contains',
  COMMENT_BY = 'comment_by',
  DAYS_SINCE_CREATED = 'days_since_created',
  DAYS_SINCE_UPDATED = 'days_since_updated',
  DAYS_SINCE_CLOSED = 'days_since_closed',
}

/**
 * Types of actions that can be performed by automation rules
 */
export enum ActionType {
  ADD_LABEL = 'add_label',
  REMOVE_LABEL = 'remove_label',
  ASSIGN_USER = 'assign_user',
  UNASSIGN_USER = 'unassign_user',
  ADD_COMMENT = 'add_comment',
  CLOSE = 'close',
  REOPEN = 'reopen',
  REQUEST_REVIEW = 'request_review', // PR only
  SET_MILESTONE = 'set_milestone',
  REMOVE_MILESTONE = 'remove_milestone',
  LOCK_CONVERSATION = 'lock_conversation',
  UNLOCK_CONVERSATION = 'unlock_conversation',
  MARK_AS_DUPLICATE = 'mark_as_duplicate',
  CONVERT_TO_DRAFT = 'convert_to_draft', // PR only
  READY_FOR_REVIEW = 'ready_for_review', // PR only
  MERGE = 'merge', // PR only - requires careful permissions
}

/**
 * Operators for combining conditions
 */
export enum ConditionOperator {
  AND = 'and',
  OR = 'or',
}

/**
 * Base interface for a condition
 */
export interface BaseCondition {
  type: ConditionType;
  negate?: boolean; // If true, the condition is negated (NOT)
}

/**
 * Condition for text matching
 */
export interface TextMatchCondition extends BaseCondition {
  type: ConditionType.TITLE_CONTAINS | ConditionType.BODY_CONTAINS | ConditionType.COMMENT_CONTAINS;
  value: string;
  caseSensitive?: boolean;
}

/**
 * Condition for regex matching
 */
export interface RegexMatchCondition extends BaseCondition {
  type: ConditionType.TITLE_MATCHES_REGEX | ConditionType.BODY_MATCHES_REGEX;
  pattern: string;
  flags?: string; // Regex flags like 'i' for case-insensitive
}

/**
 * Condition for label checking
 */
export interface LabelCondition extends BaseCondition {
  type: ConditionType.HAS_LABEL;
  label: string;
}

/**
 * Condition for user checking
 */
export interface UserCondition extends BaseCondition {
  type: ConditionType.CREATED_BY | ConditionType.ASSIGNED_TO | ConditionType.MENTIONS_USER | 
        ConditionType.COMMENT_BY | ConditionType.REVIEW_REQUESTED_FROM;
  username: string;
}

/**
 * Condition for file path matching
 */
export interface FilePathCondition extends BaseCondition {
  type: ConditionType.MODIFIED_FILES_MATCH;
  pattern: string; // Can be a glob pattern or regex
  isRegex?: boolean;
}

/**
 * Condition for branch name matching
 */
export interface BranchCondition extends BaseCondition {
  type: ConditionType.BRANCH_MATCHES;
  pattern: string;
  isRegex?: boolean;
}

/**
 * Condition for repository matching
 */
export interface RepositoryCondition extends BaseCondition {
  type: ConditionType.REPOSITORY_MATCHES;
  owner: string;
  name: string;
}

/**
 * Condition for draft PR status
 */
export interface DraftCondition extends BaseCondition {
  type: ConditionType.IS_DRAFT;
  isDraft: boolean;
}

/**
 * Condition for review state
 */
export interface ReviewStateCondition extends BaseCondition {
  type: ConditionType.REVIEW_STATE;
  state: 'approved' | 'changes_requested' | 'commented' | 'dismissed' | 'pending';
}

/**
 * Condition for time-based checks
 */
export interface TimeCondition extends BaseCondition {
  type: ConditionType.DAYS_SINCE_CREATED | ConditionType.DAYS_SINCE_UPDATED | ConditionType.DAYS_SINCE_CLOSED;
  days: number;
  operator: '>' | '>=' | '=' | '<=' | '<';
}

/**
 * Group of conditions with an operator
 */
export interface ConditionGroup {
  operator: ConditionOperator;
  conditions: (Condition | ConditionGroup)[];
}

/**
 * Union type for all condition types
 */
export type Condition = 
  | TextMatchCondition
  | RegexMatchCondition
  | LabelCondition
  | UserCondition
  | FilePathCondition
  | BranchCondition
  | RepositoryCondition
  | DraftCondition
  | ReviewStateCondition
  | TimeCondition;

/**
 * Base interface for an action
 */
export interface BaseAction {
  type: ActionType;
}

/**
 * Action for label management
 */
export interface LabelAction extends BaseAction {
  type: ActionType.ADD_LABEL | ActionType.REMOVE_LABEL;
  label: string;
}

/**
 * Action for user assignment
 */
export interface AssignmentAction extends BaseAction {
  type: ActionType.ASSIGN_USER | ActionType.UNASSIGN_USER | ActionType.REQUEST_REVIEW;
  username: string;
}

/**
 * Action for adding a comment
 */
export interface CommentAction extends BaseAction {
  type: ActionType.ADD_COMMENT;
  body: string;
  includeConditionSummary?: boolean;
}

/**
 * Action for closing or reopening
 */
export interface StateAction extends BaseAction {
  type: ActionType.CLOSE | ActionType.REOPEN | ActionType.CONVERT_TO_DRAFT | ActionType.READY_FOR_REVIEW;
  reason?: string; // Optional reason for closing
}

/**
 * Action for milestone management
 */
export interface MilestoneAction extends BaseAction {
  type: ActionType.SET_MILESTONE | ActionType.REMOVE_MILESTONE;
  milestoneId?: number; // Only for SET_MILESTONE
}

/**
 * Action for conversation locking
 */
export interface LockAction extends BaseAction {
  type: ActionType.LOCK_CONVERSATION | ActionType.UNLOCK_CONVERSATION;
  reason?: 'off-topic' | 'too heated' | 'resolved' | 'spam'; // Only for LOCK_CONVERSATION
}

/**
 * Action for marking as duplicate
 */
export interface DuplicateAction extends BaseAction {
  type: ActionType.MARK_AS_DUPLICATE;
  originalIssueNumber: number;
}

/**
 * Action for merging a PR
 */
export interface MergeAction extends BaseAction {
  type: ActionType.MERGE;
  mergeMethod?: 'merge' | 'squash' | 'rebase';
  commitTitle?: string;
  commitMessage?: string;
}

/**
 * Union type for all action types
 */
export type Action = 
  | LabelAction
  | AssignmentAction
  | CommentAction
  | StateAction
  | MilestoneAction
  | LockAction
  | DuplicateAction
  | MergeAction;

/**
 * Complete automation rule
 */
export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  resourceType: AutomationResourceType;
  conditions: ConditionGroup;
  actions: Action[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  runOrder?: number; // For controlling the order of rule execution
  repositories?: string[]; // List of repositories this rule applies to (owner/name format)
}

/**
 * Rule execution result
 */
export interface RuleExecutionResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  actionsExecuted: {
    type: ActionType;
    success: boolean;
    message?: string;
  }[];
  timestamp: string;
}
