"use client";

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
  MergeAction
} from "@/app/types/automation";

/**
 * Service for executing actions when rules match
 */
export class RuleActionService {
  private githubService: any;

  constructor(githubService: any) {
    this.githubService = githubService;
  }

  /**
   * Execute an action on a resource
   */
  async executeAction(action: Action, resource: any, owner: string, repo: string): Promise<void> {
    const issueNumber = resource.number;

    switch (action.type) {
      case ActionType.ADD_LABEL:
        await this.addLabel(action as LabelAction, owner, repo, issueNumber);
        break;
      case ActionType.REMOVE_LABEL:
        await this.removeLabel(action as LabelAction, owner, repo, issueNumber);
        break;
      case ActionType.ASSIGN_USER:
        await this.assignUser(action as AssignmentAction, owner, repo, issueNumber);
        break;
      case ActionType.UNASSIGN_USER:
        await this.unassignUser(action as AssignmentAction, owner, repo, issueNumber);
        break;
      case ActionType.ADD_COMMENT:
        await this.addComment(action as CommentAction, owner, repo, issueNumber);
        break;
      case ActionType.CLOSE:
        await this.closeIssue(action as StateAction, owner, repo, issueNumber);
        break;
      case ActionType.REOPEN:
        await this.reopenIssue(owner, repo, issueNumber);
        break;
      case ActionType.REQUEST_REVIEW:
        await this.requestReview(action as AssignmentAction, owner, repo, issueNumber);
        break;
      case ActionType.SET_MILESTONE:
        await this.setMilestone(action as MilestoneAction, owner, repo, issueNumber);
        break;
      case ActionType.REMOVE_MILESTONE:
        await this.removeMilestone(owner, repo, issueNumber);
        break;
      case ActionType.LOCK_CONVERSATION:
        await this.lockConversation(action as LockAction, owner, repo, issueNumber);
        break;
      case ActionType.UNLOCK_CONVERSATION:
        await this.unlockConversation(owner, repo, issueNumber);
        break;
      case ActionType.MARK_AS_DUPLICATE:
        await this.markAsDuplicate(action as DuplicateAction, owner, repo, issueNumber);
        break;
      case ActionType.CONVERT_TO_DRAFT:
        await this.convertToDraft(owner, repo, issueNumber);
        break;
      case ActionType.READY_FOR_REVIEW:
        await this.markReadyForReview(owner, repo, issueNumber);
        break;
      case ActionType.MERGE:
        await this.mergePullRequest(action as MergeAction, owner, repo, issueNumber);
        break;
      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }

  /**
   * Add a label to an issue or PR
   */
  private async addLabel(action: LabelAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [action.label],
    });
  }

  /**
   * Remove a label from an issue or PR
   */
  private async removeLabel(action: LabelAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    try {
      await this.githubService.octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: action.label,
      });
    } catch (error: any) {
      // Ignore 404 errors (label doesn't exist)
      if (error.status !== 404) {
        throw error;
      }
    }
  }

  /**
   * Assign a user to an issue or PR
   */
  private async assignUser(action: AssignmentAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.addAssignees({
      owner,
      repo,
      issue_number: issueNumber,
      assignees: [action.username],
    });
  }

  /**
   * Unassign a user from an issue or PR
   */
  private async unassignUser(action: AssignmentAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.removeAssignees({
      owner,
      repo,
      issue_number: issueNumber,
      assignees: [action.username],
    });
  }

  /**
   * Add a comment to an issue or PR
   */
  private async addComment(action: CommentAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: action.body,
    });
  }

  /**
   * Close an issue or PR
   */
  private async closeIssue(action: StateAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed',
      state_reason: action.reason || 'completed',
    });
  }

  /**
   * Reopen an issue or PR
   */
  private async reopenIssue(owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'open',
    });
  }

  /**
   * Request a review on a PR
   */
  private async requestReview(action: AssignmentAction, owner: string, repo: string, pullNumber: number): Promise<void> {
    await this.githubService.octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number: pullNumber,
      reviewers: [action.username],
    });
  }

  /**
   * Set a milestone on an issue or PR
   */
  private async setMilestone(action: MilestoneAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    if (!action.milestoneId) {
      throw new Error('Milestone ID is required');
    }

    await this.githubService.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      milestone: action.milestoneId,
    });
  }

  /**
   * Remove a milestone from an issue or PR
   */
  private async removeMilestone(owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      milestone: null,
    });
  }

  /**
   * Lock the conversation on an issue or PR
   */
  private async lockConversation(action: LockAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.lock({
      owner,
      repo,
      issue_number: issueNumber,
      lock_reason: action.reason,
    });
  }

  /**
   * Unlock the conversation on an issue or PR
   */
  private async unlockConversation(owner: string, repo: string, issueNumber: number): Promise<void> {
    await this.githubService.octokit.rest.issues.unlock({
      owner,
      repo,
      issue_number: issueNumber,
    });
  }

  /**
   * Mark an issue as a duplicate
   */
  private async markAsDuplicate(action: DuplicateAction, owner: string, repo: string, issueNumber: number): Promise<void> {
    // GitHub doesn't have a direct API for marking duplicates, so we add a comment and close the issue
    const body = `This issue is a duplicate of #${action.originalIssueNumber}`;
    
    await this.addComment({ type: ActionType.ADD_COMMENT, body }, owner, repo, issueNumber);
    await this.closeIssue({ type: ActionType.CLOSE, reason: 'not_planned' }, owner, repo, issueNumber);
  }

  /**
   * Convert a PR to draft
   */
  private async convertToDraft(owner: string, repo: string, pullNumber: number): Promise<void> {
    await this.githubService.octokit.rest.pulls.updateBranch({
      owner,
      repo,
      pull_number: pullNumber,
      draft: true,
    });
  }

  /**
   * Mark a PR as ready for review
   */
  private async markReadyForReview(owner: string, repo: string, pullNumber: number): Promise<void> {
    await this.githubService.octokit.rest.pulls.updateBranch({
      owner,
      repo,
      pull_number: pullNumber,
      draft: false,
    });
  }

  /**
   * Merge a PR
   */
  private async mergePullRequest(action: MergeAction, owner: string, repo: string, pullNumber: number): Promise<void> {
    await this.githubService.octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: pullNumber,
      merge_method: action.mergeMethod || 'merge',
      commit_title: action.commitTitle,
      commit_message: action.commitMessage,
    });
  }
}
