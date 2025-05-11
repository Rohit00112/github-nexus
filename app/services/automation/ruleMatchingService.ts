"use client";

import { 
  Condition, 
  ConditionGroup, 
  ConditionOperator, 
  ConditionType,
  TextMatchCondition,
  RegexMatchCondition,
  LabelCondition,
  UserCondition,
  FilePathCondition,
  BranchCondition,
  RepositoryCondition,
  DraftCondition,
  ReviewStateCondition,
  TimeCondition
} from "@/app/types/automation";

/**
 * Service for evaluating if issues/PRs match rule conditions
 */
export class RuleMatchingService {
  /**
   * Evaluate a condition group against a resource
   */
  evaluateConditionGroup(group: ConditionGroup, resource: any): boolean {
    if (group.operator === ConditionOperator.AND) {
      // All conditions must be true
      return group.conditions.every(condition => {
        if ('operator' in condition) {
          // This is a nested condition group
          return this.evaluateConditionGroup(condition as ConditionGroup, resource);
        } else {
          // This is a single condition
          return this.evaluateCondition(condition as Condition, resource);
        }
      });
    } else {
      // At least one condition must be true
      return group.conditions.some(condition => {
        if ('operator' in condition) {
          // This is a nested condition group
          return this.evaluateConditionGroup(condition as ConditionGroup, resource);
        } else {
          // This is a single condition
          return this.evaluateCondition(condition as Condition, resource);
        }
      });
    }
  }

  /**
   * Evaluate a single condition against a resource
   */
  evaluateCondition(condition: Condition, resource: any): boolean {
    let result = false;

    switch (condition.type) {
      case ConditionType.TITLE_CONTAINS:
        result = this.evaluateTextMatch(condition as TextMatchCondition, resource.title);
        break;
      case ConditionType.BODY_CONTAINS:
        result = resource.body ? this.evaluateTextMatch(condition as TextMatchCondition, resource.body) : false;
        break;
      case ConditionType.TITLE_MATCHES_REGEX:
        result = this.evaluateRegexMatch(condition as RegexMatchCondition, resource.title);
        break;
      case ConditionType.BODY_MATCHES_REGEX:
        result = resource.body ? this.evaluateRegexMatch(condition as RegexMatchCondition, resource.body) : false;
        break;
      case ConditionType.HAS_LABEL:
        result = this.evaluateLabelMatch(condition as LabelCondition, resource.labels);
        break;
      case ConditionType.CREATED_BY:
        result = this.evaluateUserMatch(condition as UserCondition, resource.user?.login);
        break;
      case ConditionType.ASSIGNED_TO:
        result = this.evaluateAssigneeMatch(condition as UserCondition, resource.assignees);
        break;
      case ConditionType.MENTIONS_USER:
        const mentionRegex = new RegExp(`@${(condition as UserCondition).username}\\b`, 'i');
        result = mentionRegex.test(resource.body || '');
        break;
      case ConditionType.MODIFIED_FILES_MATCH:
        result = this.evaluateFilePathMatch(condition as FilePathCondition, resource.files || []);
        break;
      case ConditionType.BRANCH_MATCHES:
        result = this.evaluateBranchMatch(condition as BranchCondition, resource.head?.ref);
        break;
      case ConditionType.REPOSITORY_MATCHES:
        result = this.evaluateRepositoryMatch(condition as RepositoryCondition, resource.base?.repo);
        break;
      case ConditionType.IS_DRAFT:
        result = resource.draft === (condition as DraftCondition).isDraft;
        break;
      case ConditionType.REVIEW_REQUESTED_FROM:
        result = this.evaluateReviewRequestMatch(condition as UserCondition, resource.requested_reviewers || []);
        break;
      case ConditionType.REVIEW_STATE:
        result = this.evaluateReviewStateMatch(condition as ReviewStateCondition, resource.reviews || []);
        break;
      case ConditionType.COMMENT_CONTAINS:
        // This would require fetching comments separately
        console.warn('Comment contains condition requires comment data to be provided');
        result = false;
        break;
      case ConditionType.COMMENT_BY:
        // This would require fetching comments separately
        console.warn('Comment by condition requires comment data to be provided');
        result = false;
        break;
      case ConditionType.DAYS_SINCE_CREATED:
        result = this.evaluateTimeCondition(condition as TimeCondition, resource.created_at);
        break;
      case ConditionType.DAYS_SINCE_UPDATED:
        result = this.evaluateTimeCondition(condition as TimeCondition, resource.updated_at);
        break;
      case ConditionType.DAYS_SINCE_CLOSED:
        result = resource.closed_at ? this.evaluateTimeCondition(condition as TimeCondition, resource.closed_at) : false;
        break;
      default:
        console.warn(`Unsupported condition type: ${condition.type}`);
        result = false;
    }

    // Apply negation if specified
    return condition.negate ? !result : result;
  }

  /**
   * Evaluate a text match condition
   */
  private evaluateTextMatch(condition: TextMatchCondition, text: string): boolean {
    if (!text) return false;
    
    if (condition.caseSensitive) {
      return text.includes(condition.value);
    } else {
      return text.toLowerCase().includes(condition.value.toLowerCase());
    }
  }

  /**
   * Evaluate a regex match condition
   */
  private evaluateRegexMatch(condition: RegexMatchCondition, text: string): boolean {
    if (!text) return false;
    
    try {
      const regex = new RegExp(condition.pattern, condition.flags);
      return regex.test(text);
    } catch (error) {
      console.error('Invalid regex pattern:', error);
      return false;
    }
  }

  /**
   * Evaluate a label match condition
   */
  private evaluateLabelMatch(condition: LabelCondition, labels: any[]): boolean {
    if (!labels || !Array.isArray(labels)) return false;
    
    return labels.some(label => label.name === condition.label);
  }

  /**
   * Evaluate a user match condition
   */
  private evaluateUserMatch(condition: UserCondition, username: string): boolean {
    if (!username) return false;
    
    return username === condition.username;
  }

  /**
   * Evaluate an assignee match condition
   */
  private evaluateAssigneeMatch(condition: UserCondition, assignees: any[]): boolean {
    if (!assignees || !Array.isArray(assignees)) return false;
    
    return assignees.some(assignee => assignee.login === condition.username);
  }

  /**
   * Evaluate a file path match condition
   */
  private evaluateFilePathMatch(condition: FilePathCondition, files: any[]): boolean {
    if (!files || !Array.isArray(files)) return false;
    
    if (condition.isRegex) {
      try {
        const regex = new RegExp(condition.pattern);
        return files.some(file => regex.test(file.filename));
      } catch (error) {
        console.error('Invalid regex pattern for file path:', error);
        return false;
      }
    } else {
      // Simple glob pattern matching (very basic implementation)
      const pattern = condition.pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      
      try {
        const regex = new RegExp(`^${pattern}$`);
        return files.some(file => regex.test(file.filename));
      } catch (error) {
        console.error('Invalid glob pattern for file path:', error);
        return false;
      }
    }
  }

  /**
   * Evaluate a branch match condition
   */
  private evaluateBranchMatch(condition: BranchCondition, branchName: string): boolean {
    if (!branchName) return false;
    
    if (condition.isRegex) {
      try {
        const regex = new RegExp(condition.pattern);
        return regex.test(branchName);
      } catch (error) {
        console.error('Invalid regex pattern for branch:', error);
        return false;
      }
    } else {
      return branchName === condition.pattern;
    }
  }

  /**
   * Evaluate a repository match condition
   */
  private evaluateRepositoryMatch(condition: RepositoryCondition, repo: any): boolean {
    if (!repo) return false;
    
    return repo.owner.login === condition.owner && repo.name === condition.name;
  }

  /**
   * Evaluate a review request match condition
   */
  private evaluateReviewRequestMatch(condition: UserCondition, requestedReviewers: any[]): boolean {
    if (!requestedReviewers || !Array.isArray(requestedReviewers)) return false;
    
    return requestedReviewers.some(reviewer => reviewer.login === condition.username);
  }

  /**
   * Evaluate a review state match condition
   */
  private evaluateReviewStateMatch(condition: ReviewStateCondition, reviews: any[]): boolean {
    if (!reviews || !Array.isArray(reviews)) return false;
    
    // Find the latest review from each reviewer
    const latestReviews = new Map();
    for (const review of reviews) {
      const reviewer = review.user.login;
      const existingReview = latestReviews.get(reviewer);
      
      if (!existingReview || new Date(review.submitted_at) > new Date(existingReview.submitted_at)) {
        latestReviews.set(reviewer, review);
      }
    }
    
    // Check if any of the latest reviews match the desired state
    return Array.from(latestReviews.values()).some(review => review.state.toLowerCase() === condition.state);
  }

  /**
   * Evaluate a time-based condition
   */
  private evaluateTimeCondition(condition: TimeCondition, dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (condition.operator) {
      case '>':
        return diffDays > condition.days;
      case '>=':
        return diffDays >= condition.days;
      case '=':
        return diffDays === condition.days;
      case '<=':
        return diffDays <= condition.days;
      case '<':
        return diffDays < condition.days;
      default:
        return false;
    }
  }
}
