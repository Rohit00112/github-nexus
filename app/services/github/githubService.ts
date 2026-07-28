import { Octokit } from "octokit";
import { AuthCredentials, AuthMethod, AuthService } from "../auth/authService";
import {
  GET_USER_PROJECTS_BETA,
  GET_ORG_PROJECTS_BETA,
  GET_PROJECT_BETA,
  GET_ORG_PROJECT_BETA,
  GET_PROJECT_ITEMS,
  ADD_ITEM_TO_PROJECT,
  CREATE_DRAFT_ISSUE,
  UPDATE_PROJECT_ITEM_FIELD
} from "./queries/projectsQueries";
import {
  GET_REPOSITORY_WORKFLOWS,
  GET_WORKFLOW_RUNS,
  GET_WORKFLOW_RUN,
  TRIGGER_WORKFLOW,
  CANCEL_WORKFLOW_RUN,
  RERUN_WORKFLOW,
  GET_WORKFLOW_USAGE,
  GET_REPOSITORY_SECRETS,
  GET_REPOSITORY_ENVIRONMENTS
} from "./queries/actionsQueries";
import {
  GET_REPOSITORY_DISCUSSIONS,
  GET_DISCUSSION,
  GET_DISCUSSION_COMMENTS,
  GET_DISCUSSION_CATEGORIES,
  CREATE_DISCUSSION,
  ADD_DISCUSSION_COMMENT,
  ADD_DISCUSSION_REPLY,
  MARK_DISCUSSION_COMMENT_AS_ANSWER,
  UNMARK_DISCUSSION_COMMENT_AS_ANSWER,
  ADD_REACTION,
  REMOVE_REACTION,
  GET_TRENDING_DISCUSSIONS
} from "./queries/discussionsQueries";

export interface ClassicProject {
  id: number;
  name: string;
  body: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  creator: {
    login: string;
    avatar_url: string;
  };
  owner: { login: string };
  state: string;
  number_of_columns?: number;
  owner_url?: string;
  organization_url?: string;
}

export interface ClassicProjectColumn {
  id: number;
  name: string;
  cards_url: string;
  created_at: string;
  updated_at: string;
  project_url: string;
}

export interface ClassicProjectCard {
  id: number;
  note: string;
  created_at: string;
  updated_at: string;
  column_url: string;
  content_url?: string;
  creator?: {
    login: string;
    avatar_url: string;
  };
}

interface ContributionWeek {
  days: ContributionDay[];
  week: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubWorkflow {
  id: string;
  name: string;
  state: string;
  url: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

interface GitHubWorkflowRunJob {
  id: string;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string;
  completedAt: string | null;
  steps: {
    nodes: Array<{
      name: string;
      status: string;
      conclusion: string | null;
      number: number;
      startedAt: string;
      completedAt: string | null;
    }>;
  };
}

interface GitHubWorkflowRun {
  id: string;
  runNumber: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  conclusion: string | null;
  url: string;
  event: string;
  headBranch: string;
  headCommit: {
    message: string;
    committedDate: string;
    author: {
      name: string;
      email: string;
      avatarUrl: string;
    };
  };
  jobs: {
    nodes: GitHubWorkflowRunJob[];
  };
}

export interface GitHubUserEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    full_name: string;
    url: string;
  };
  payload: {
    commits?: Array<{ message: string; sha: string }>;
    head?: string;
    action?: string;
    issue?: { title: string; body?: string | null; html_url: string };
    pull_request?: { title: string; body?: string | null; html_url: string };
    release?: { tag_name: string; name: string; body?: string | null; html_url: string };
    forkee?: { full_name: string; html_url: string };
    comment?: { body: string; html_url: string };
    review?: { body?: string | null; html_url: string };
  };
  created_at: string;
}

export interface ProjectBetaSummary {
  id: string;
  title: string;
  number: number;
  shortDescription: string;
  url: string;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    login: string;
    avatarUrl: string;
  };
}

export interface ProjectBetaField {
  id: string;
  name: string;
  dataType: string;
  options?: Array<{ id: string; name: string; color: string }>;
}

export interface ProjectBeta extends ProjectBetaSummary {
  fields: { nodes: ProjectBetaField[] };
  views: { nodes: Array<{ id: string; name: string; layout: string }> };
}

export interface ProjectBetaItem {
  id: string;
  content?: {
    id: string;
    title: string;
    number: number;
    state: string;
    repository?: {
      name: string;
      owner: { login: string };
    };
  };
  fieldValues: {
    nodes: Array<{
      text?: string;
      date?: string;
      name?: string;
      field: { name: string };
    }>;
  };
}

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description?: string;
  isAnswerable: boolean;
}

export interface RepositoryDiscussion {
  id: string;
  number: number;
  title: string;
  body: string;
  bodyHTML?: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  author: { login: string; avatarUrl: string };
  category: DiscussionCategory;
  comments: { totalCount: number };
  labels?: { nodes: Array<{ id: string; name: string; color: string }> };
  answerChosenAt?: string | null;
}

export interface DiscussionComment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  author: { login: string; avatarUrl: string };
  isAnswer: boolean;
  reactionGroups: Array<{ content: string; users: { totalCount: number } }>;
  replies: {
    totalCount: number;
    nodes: Array<{
      id: string;
      body: string;
      createdAt: string;
      author: { login: string; avatarUrl: string };
    }>;
  };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export class GitHubService {
  // Make octokit public so components can access it directly
  public octokit: Octokit;
  private authMethod: AuthMethod;
  private graphql<T extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    return (this.octokit.graphql as unknown as (
      query: string,
      variables?: Record<string, unknown>
    ) => Promise<T>)(query, variables);
  }

  private classicProjectsUnavailable(): never {
    throw new Error("GitHub Projects (classic) is no longer available. Use Projects v2 instead.");
  }

  constructor(accessTokenOrCredentials: string | AuthCredentials) {
    if (typeof accessTokenOrCredentials === 'string') {
      // Legacy constructor with just an access token (OAuth)
      this.octokit = new Octokit({
        auth: accessTokenOrCredentials,
      });
      this.authMethod = AuthMethod.OAUTH;
    } else {
      // New constructor with auth credentials
      this.octokit = AuthService.createOctokit(accessTokenOrCredentials);
      this.authMethod = accessTokenOrCredentials.method;
    }
  }

  /**
   * Get the authentication method used by this service
   */
  getAuthMethod(): AuthMethod {
    return this.authMethod;
  }

  // User methods
  async getCurrentUser() {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data;
  }

  async updateUser(options: Parameters<Octokit["rest"]["users"]["updateAuthenticated"]>[0]) {
    const { data } = await this.octokit.rest.users.updateAuthenticated(options);
    return data;
  }

  // Repository methods
  async getUserRepositories(username: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.repos.listForUser({
      username,
      per_page: perPage,
      page,
      sort: "updated",
    });
    return data;
  }

  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  }

  async createRepository(options: {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
  }) {
    const { data } = await this.octokit.rest.repos.createForAuthenticatedUser(options);
    return data;
  }

  async searchRepositories(options: {
    query: string;
    sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) {
    const { data } = await this.octokit.rest.search.repos({
      q: options.query,
      sort: options.sort,
      order: options.order,
      per_page: options.per_page || 10,
      page: options.page || 1
    });
    return data;
  }

  async getLanguages(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.listLanguages({
      owner,
      repo
    });
    return data;
  }

  async getTopics(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getAllTopics({
      owner,
      repo
    });
    return data.names;
  }

  // Issues methods
  async getIssues(owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      per_page: perPage,
      page,
      state: "all",
    });
    return data;
  }

  async getIssue(owner: string, repo: string, issue_number: number) {
    const { data } = await this.octokit.rest.issues.get({
      owner,
      repo,
      issue_number,
    });
    return data;
  }

  async getIssueComments(owner: string, repo: string, issue_number: number, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number,
      per_page: perPage,
      page,
    });
    return data;
  }

  async createIssueComment(owner: string, repo: string, issue_number: number, body: string) {
    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });
    return data;
  }

  async updateIssue(owner: string, repo: string, issue_number: number, options: {
    title?: string;
    body?: string;
    state?: "open" | "closed";
    assignees?: string[];
    labels?: string[];
  }) {
    const { data } = await this.octokit.rest.issues.update({
      owner,
      repo,
      issue_number,
      ...options,
    });
    return data;
  }

  async createIssue(owner: string, repo: string, options: {
    title: string;
    body?: string;
    assignees?: string[];
    labels?: string[];
  }) {
    const { data } = await this.octokit.rest.issues.create({
      owner,
      repo,
      ...options,
    });
    return data;
  }

  // Pull requests methods
  async getPullRequests(owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      per_page: perPage,
      page,
      state: "all",
    });
    return data;
  }

  async getPullRequest(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });
    return data;
  }

  async getPullRequestComments(owner: string, repo: string, pull_number: number, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
      per_page: perPage,
      page,
    });
    return data;
  }

  async createPullRequestComment(owner: string, repo: string, pull_number: number, body: string) {
    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body,
    });
    return data;
  }

  async updatePullRequest(owner: string, repo: string, pull_number: number, options: {
    title?: string;
    body?: string;
    state?: "open" | "closed";
    base?: string;
  }) {
    const { data } = await this.octokit.rest.pulls.update({
      owner,
      repo,
      pull_number,
      ...options,
    });
    return data;
  }

  async mergePullRequest(owner: string, repo: string, pull_number: number, commit_message?: string, merge_method: "merge" | "squash" | "rebase" = "merge") {
    const { data } = await this.octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number,
      commit_message,
      merge_method,
    });
    return data;
  }

  async createPullRequest(owner: string, repo: string, options: {
    title: string;
    body?: string;
    head: string;
    base: string;
    draft?: boolean;
  }) {
    const { data } = await this.octokit.rest.pulls.create({
      owner,
      repo,
      ...options,
    });
    return data;
  }

  // Workflows methods
  async getWorkflows(owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.actions.listRepoWorkflows({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return data;
  }

  // Organizations methods
  async getUserOrganizations() {
    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
    return data;
  }

  // Notifications methods
  async getNotifications(options?: {
    all?: boolean;
    participating?: boolean;
    since?: string;
    before?: string;
    per_page?: number;
    page?: number;
  }) {
    const { data } = await this.octokit.rest.activity.listNotificationsForAuthenticatedUser({
      ...options
    });
    return data;
  }

  // User activity methods
  async getUserEvents(username: string, perPage = 30, page = 1) {
    const { data } = await this.octokit.rest.activity.listPublicEventsForUser({
      username,
      per_page: perPage,
      page,
    });
    return data as unknown as GitHubUserEvent[];
  }

  async getRepositoryNotifications(owner: string, repo: string, options?: {
    all?: boolean;
    participating?: boolean;
    since?: string;
    before?: string;
    per_page?: number;
    page?: number;
  }) {
    const { data } = await this.octokit.rest.activity.listRepoNotificationsForAuthenticatedUser({
      owner,
      repo,
      ...options
    });
    return data;
  }

  async markNotificationAsRead(threadId: number) {
    const { data } = await this.octokit.rest.activity.markThreadAsRead({
      thread_id: threadId
    });
    return data;
  }

  async markAllNotificationsAsRead(options?: {
    last_read_at?: string;
  }) {
    const { data } = await this.octokit.rest.activity.markNotificationsAsRead({
      ...options
    });
    return data;
  }

  async markRepositoryNotificationsAsRead(owner: string, repo: string, options?: {
    last_read_at?: string;
  }) {
    const { data } = await this.octokit.rest.activity.markRepoNotificationsAsRead({
      owner,
      repo,
      ...options
    });
    return data;
  }

  // Gists methods
  async getGists(page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.gists.list({
      per_page: perPage,
      page,
    });
    return data;
  }

  async getStarredGists(page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.gists.listStarred({
      per_page: perPage,
      page,
    });
    return data;
  }

  async getPublicGists(page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.gists.listPublic({
      per_page: perPage,
      page,
    });
    return data;
  }

  async getGist(gistId: string) {
    const { data } = await this.octokit.rest.gists.get({
      gist_id: gistId,
    });
    return data;
  }

  async createGist(options: {
    description?: string;
    files: Record<string, { content: string }>;
    public?: boolean;
  }) {
    const { data } = await this.octokit.rest.gists.create({
      description: options.description,
      files: options.files,
      public: options.public,
    });
    return data;
  }

  async updateGist(gistId: string, options: {
    description?: string;
    files: Record<string, { content: string } | null>;
  }) {
    const { data } = await this.octokit.rest.gists.update({
      gist_id: gistId,
      description: options.description,
      files: options.files as unknown as { [key: string]: { content?: string; filename?: string | null } },
    });
    return data;
  }

  async deleteGist(gistId: string) {
    const { data } = await this.octokit.rest.gists.delete({
      gist_id: gistId,
    });
    return data;
  }

  async starGist(gistId: string) {
    const { data } = await this.octokit.rest.gists.star({
      gist_id: gistId,
    });
    return data;
  }

  async unstarGist(gistId: string) {
    const { data } = await this.octokit.rest.gists.unstar({
      gist_id: gistId,
    });
    return data;
  }

  async isGistStarred(gistId: string) {
    try {
      await this.octokit.rest.gists.checkIsStarred({
        gist_id: gistId,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getGistComments(gistId: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.gists.listComments({
      gist_id: gistId,
      per_page: perPage,
      page,
    });
    return data;
  }

  async createGistComment(gistId: string, body: string) {
    const { data } = await this.octokit.rest.gists.createComment({
      gist_id: gistId,
      body,
    });
    return data;
  }

  async deleteGistComment(gistId: string, commentId: number) {
    const { data } = await this.octokit.rest.gists.deleteComment({
      gist_id: gistId,
      comment_id: commentId,
    });
    return data;
  }

  // Repository Insights methods
  async getCommitActivity(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getCommitActivityStats({
      owner,
      repo,
    });
    return Array.isArray(data) ? data : [];
  }

  async getCodeFrequency(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getCodeFrequencyStats({
      owner,
      repo,
    });
    return data;
  }

  async getParticipation(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getParticipationStats({
      owner,
      repo,
    });
    return data;
  }

  // Get user contribution calendar (for heatmap)
  async getUserContributionCalendar(username: string, year: number) {
    // This is a simplified implementation since GitHub's API doesn't directly provide this data
    // In a real app, you would use GitHub's GraphQL API to get the actual contribution calendar

    // For now, we'll generate mock data based on commit activity from repositories
    try {
      // Get user's repositories
      const repos = await this.getUserRepositories(username, 1, 10);

      // Generate a full year of empty data
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      // Create weeks array
      const weeks: ContributionWeek[] = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // Create a week
        const week: ContributionWeek = { days: [], week: 0 };

        // Add days for this week (Sunday to Saturday)
        for (let i = 0; i < 7; i++) {
          if (currentDate <= endDate) {
            week.days.push({
              date: currentDate.toISOString().split('T')[0],
              count: 0,
              level: 0
            });

            // Move to next day
            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        weeks.push(week);
      }

      // Fill in commit data from repositories
      for (const repo of repos.slice(0, 5)) { // Limit to 5 repos for performance
        try {
          // Get commit activity
          const commitActivity = await this.getCommitActivity(repo.owner.login, repo.name);

          // Process each week
          commitActivity.forEach((week: { week: number; days: number[] }) => {
            const weekTimestamp = week.week * 1000; // Convert to milliseconds
            const weekDate = new Date(weekTimestamp);

            // Skip if not in the target year
            if (weekDate.getFullYear() !== year) return;

            // Process each day in the week
            week.days.forEach((count: number, dayIndex: number) => {
              // Calculate the date for this day
              const dayDate = new Date(weekTimestamp);
              dayDate.setDate(dayDate.getDate() + dayIndex);

              // Skip if not in the target year
              if (dayDate.getFullYear() !== year) return;

              // Find the corresponding day in our data structure
              const dateString = dayDate.toISOString().split('T')[0];

              // Find the week and day
              for (const weekData of weeks) {
                const dayData = weekData.days.find((d: ContributionDay) => d.date === dateString);
                if (dayData) {
                  dayData.count += count;

                  // Set level based on count
                  if (count === 0) dayData.level = 0;
                  else if (count <= 2) dayData.level = 1;
                  else if (count <= 5) dayData.level = 2;
                  else if (count <= 10) dayData.level = 3;
                  else dayData.level = 4;

                  break;
                }
              }
            });
          });
        } catch (err) {
          console.error(`Error fetching commit activity for ${repo.full_name}:`, err);
        }
      }

      return { weeks };
    } catch (err) {
      console.error("Error generating contribution calendar:", err);
      throw err;
    }
  }

  // Get repository contributors
  async getRepositoryContributors(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 100
    });
    return data;
  }

  async getPunchCard(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getPunchCardStats({
      owner,
      repo,
    });
    return data;
  }

  async getContributorsStats(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getContributorsStats({
      owner,
      repo,
    });
    return data;
  }

  async getWeeklyCommitCount(owner: string, repo: string) {
    const { data } = await this.octokit.rest.repos.getParticipationStats({
      owner,
      repo,
    });
    return data;
  }

  async getReleases(owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getBranches(owner: string, repo: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getTags(owner: string, repo: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getContributors(owner: string, repo: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return data;
  }

  // Code Review methods
  async getPullRequestReviews(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number,
    });
    return data;
  }

  async getPullRequestReviewComments(owner: string, repo: string, pull_number: number, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number,
      per_page: perPage,
      page,
    });
    return data;
  }

  async createPullRequestReview(owner: string, repo: string, pull_number: number, options: {
    commit_id?: string;
    body?: string;
    event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
    comments?: Array<{
      path: string;
      position: number;
      body: string;
    }>;
  }) {
    const { data } = await this.octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number,
      ...options,
    });
    return data;
  }

  async submitPullRequestReview(owner: string, repo: string, pull_number: number, review_id: number, options: {
    body?: string;
    event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
  }) {
    const { data } = await this.octokit.rest.pulls.submitReview({
      owner,
      repo,
      pull_number,
      review_id,
      ...options,
    });
    return data;
  }

  async dismissPullRequestReview(owner: string, repo: string, pull_number: number, review_id: number, message: string) {
    const { data } = await this.octokit.rest.pulls.dismissReview({
      owner,
      repo,
      pull_number,
      review_id,
      message,
    });
    return data;
  }

  async getPullRequestReviewRequests(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.rest.pulls.listRequestedReviewers({
      owner,
      repo,
      pull_number,
    });
    return data;
  }

  async requestPullRequestReviewers(owner: string, repo: string, pull_number: number, options: {
    reviewers?: string[];
    team_reviewers?: string[];
  }) {
    const { data } = await this.octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number,
      ...options,
    });
    return data;
  }

  async removePullRequestReviewers(owner: string, repo: string, pull_number: number, options: {
    reviewers?: string[];
    team_reviewers?: string[];
  }) {
    const { data } = await this.octokit.rest.pulls.removeRequestedReviewers({
      owner,
      repo,
      pull_number,
      reviewers: options.reviewers ?? [],
      team_reviewers: options.team_reviewers,
    });
    return data;
  }

  async getPullRequestFiles(owner: string, repo: string, pull_number: number) {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number,
    });
    return data;
  }

  async getPendingReviews(owner: string, repo: string, page = 1, perPage = 10) {
    // Get open pull requests
    const pullRequests = await this.getPullRequests(owner, repo, page, perPage);

    // Filter to only include PRs where the authenticated user is a requested reviewer
    const pendingReviews = [];

    for (const pr of pullRequests) {
      if (pr.state !== 'open') continue;

      const reviewRequests = await this.getPullRequestReviewRequests(owner, repo, pr.number);
      const user = await this.getCurrentUser();

      const reviewData = reviewRequests as { reviewers?: Array<{ login: string }>; users?: Array<{ login: string }> };
      const isReviewer = reviewData.reviewers?.some((reviewer) => reviewer.login === user.login) ?? reviewData.users?.some((u) => u.login === user.login);

      if (isReviewer) {
        pendingReviews.push({
          ...pr,
          requested_at: pr.created_at, // GitHub API doesn't provide when the review was requested
        });
      }
    }

    return pendingReviews;
  }

  // Team Collaboration methods
  async getOrganizationTeams(org: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.teams.list({
      org,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getTeam(org: string, team_slug: string) {
    const { data } = await this.octokit.rest.teams.getByName({
      org,
      team_slug,
    });
    return data;
  }

  async getTeamMembers(org: string, team_slug: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.teams.listMembersInOrg({
      org,
      team_slug,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getTeamRepositories(org: string, team_slug: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.teams.listReposInOrg({
      org,
      team_slug,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getUserContributions(username: string, _from?: Date, _to?: Date) {
    // GitHub API doesn't provide a direct endpoint for user contributions
    // We'll use a combination of endpoints to gather this data

    // Get user's repositories
    const repos = await this.octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      sort: "updated",
    });

    const contributions = {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      reviews: 0,
      repositories: repos.data.length,
    };

    // For each repository, get the user's contributions
    // Limit to 5 most recently updated repos to avoid rate limiting
    const recentRepos = repos.data.slice(0, 5);

    for (const repo of recentRepos) {
      // Get commits by user
      try {
        const commits = await this.octokit.rest.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: username,
          per_page: 100,
        });
        contributions.commits += commits.data.length;
      } catch (error) {
        console.error(`Error fetching commits for ${repo.full_name}:`, error);
      }

      // Get pull requests by user
      try {
        const pulls = await this.octokit.rest.pulls.list({
          owner: repo.owner.login,
          repo: repo.name,
          state: "all",
          per_page: 100,
        });
        const userPulls = pulls.data.filter(pr => pr.user?.login === username);
        contributions.pullRequests += userPulls.length;
      } catch (error) {
        console.error(`Error fetching pull requests for ${repo.full_name}:`, error);
      }

      // Get issues by user
      try {
        const issues = await this.octokit.rest.issues.listForRepo({
          owner: repo.owner.login,
          repo: repo.name,
          creator: username,
          state: "all",
          per_page: 100,
        });
        // Filter out pull requests (GitHub API returns PRs as issues)
        const actualIssues = issues.data.filter(issue => !issue.pull_request);
        contributions.issues += actualIssues.length;
      } catch (error) {
        console.error(`Error fetching issues for ${repo.full_name}:`, error);
      }
    }

    return contributions;
  }

  async getTeamContributions(org: string, team_slug: string) {
    // Get team members
    const members = await this.getTeamMembers(org, team_slug);

    // Get team repositories
    const repositories = await this.getTeamRepositories(org, team_slug);

    // Get contributions for each member
    const memberContributions = await Promise.all(
      members.map(async (member) => {
        const contributions = await this.getUserContributions(member.login);
        return {
          member,
          contributions,
        };
      })
    );

    // Calculate team totals
    const teamTotals = memberContributions.reduce(
      (totals, { contributions }) => {
        totals.commits += contributions.commits;
        totals.pullRequests += contributions.pullRequests;
        totals.issues += contributions.issues;
        totals.reviews += contributions.reviews;
        return totals;
      },
      { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
    );

    return {
      members: memberContributions,
      repositories: repositories.length,
      totals: teamTotals,
    };
  }

  async getOrganizationMembers(org: string, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.orgs.listMembers({
      org,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getTeamDiscussions(org: string, team_slug: string, page = 1, perPage = 30) {
    const { data } = await this.octokit.rest.teams.listDiscussionsInOrg({
      org,
      team_slug,
      per_page: perPage,
      page,
    });
    return data;
  }

  // GitHub Projects methods
  async getOrganizationProjects(_org: string, _page = 1, _perPage = 10): Promise<ClassicProject[]> {
    return [];
  }

  async getUserProjects(_username: string, _page = 1, _perPage = 10): Promise<ClassicProject[]> {
    return [];
  }

  async getRepositoryProjects(_owner: string, _repo: string, _page = 1, _perPage = 10): Promise<ClassicProject[]> {
    return [];
  }

  async getProject(_project_id: number): Promise<ClassicProject> {
    return this.classicProjectsUnavailable();
  }

  async createProject(options: {
    owner: string;
    repo?: string;
    name: string;
    body?: string;
    org?: string;
  }) {
    void options;
    return this.classicProjectsUnavailable();
  }

  async updateProject(project_id: number, options: {
    name?: string;
    body?: string;
    state?: 'open' | 'closed';
    organization_permission?: 'read' | 'write' | 'admin' | 'none';
    private?: boolean;
  }) {
    void project_id;
    void options;
    return this.classicProjectsUnavailable();
  }

  async deleteProject(project_id: number) {
    void project_id;
    return this.classicProjectsUnavailable();
  }

  async getProjectColumns(project_id: number): Promise<ClassicProjectColumn[]> {
    void project_id;
    return [];
  }

  async getProjectColumn(column_id: number) {
    void column_id;
    return this.classicProjectsUnavailable();
  }

  async createProjectColumn(project_id: number, name: string) {
    void project_id;
    void name;
    return this.classicProjectsUnavailable();
  }

  async updateProjectColumn(column_id: number, name: string) {
    void column_id;
    void name;
    return this.classicProjectsUnavailable();
  }

  async deleteProjectColumn(column_id: number) {
    void column_id;
    return this.classicProjectsUnavailable();
  }

  async moveProjectColumn(column_id: number, position: 'first' | 'last' | 'after:' | string) {
    void column_id;
    void position;
    return this.classicProjectsUnavailable();
  }

  async getColumnCards(column_id: number, page = 1, perPage = 100): Promise<ClassicProjectCard[]> {
    void column_id;
    void page;
    void perPage;
    return [];
  }

  async getProjectColumnCards(column_id: number, page = 1, perPage = 100) {
    return this.getColumnCards(column_id, page, perPage);
  }

  async getCard(card_id: number) {
    void card_id;
    return this.classicProjectsUnavailable();
  }

  async createCard(column_id: number, options: {
    note?: string;
    content_id?: number;
    content_type?: 'Issue' | 'PullRequest';
  }) {
    void column_id;
    void options;
    return this.classicProjectsUnavailable();
  }

  async updateCard(card_id: number, note: string) {
    void card_id;
    void note;
    return this.classicProjectsUnavailable();
  }

  async deleteCard(card_id: number) {
    void card_id;
    return this.classicProjectsUnavailable();
  }

  async moveCard(card_id: number, position: 'top' | 'bottom' | 'after:' | string, column_id?: number) {
    void card_id;
    void position;
    void column_id;
    return this.classicProjectsUnavailable();
  }

  async getAllUserProjects() {
    const user = await this.getCurrentUser();
    return this.getUserProjects(user.login, 1, 100);
  }

  async getAllOrganizationProjects() {
    const orgs = await this.getUserOrganizations();
    let allProjects: ClassicProject[] = [];

    for (const org of orgs) {
      const projects = await this.getOrganizationProjects(org.login, 1, 100);
      allProjects = [...allProjects, ...projects];
    }

    return allProjects;
  }

  async getAllRepositoryProjects() {
    const repos = await this.getUserRepositories("");
    let allProjects: ClassicProject[] = [];

    for (const repo of repos) {
      const projects = await this.getRepositoryProjects(repo.owner.login, repo.name, 1, 100);
      allProjects = [...allProjects, ...projects];
    }

    return allProjects;
  }

  /**
   * Search for issues in a repository
   * @param query The search query
   * @param owner The repository owner
   * @param repo The repository name
   * @param page The page number
   * @param perPage The number of results per page
   */
  async searchIssues(query: string, owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      per_page: perPage,
      page,
      state: "all",
    });

    // Filter issues based on the query
    const lowerQuery = query.toLowerCase();
    return data.filter(issue =>
      issue.title.toLowerCase().includes(lowerQuery) ||
      (issue.body && issue.body.toLowerCase().includes(lowerQuery))
    );
  }

  // GitHub Projects (beta) methods
  async getUserProjectsBeta(username: string, first = 20) {
    const { user } = await this.graphql<{ user: { projectsV2: { nodes: ProjectBetaSummary[] } } }>(GET_USER_PROJECTS_BETA, {
      login: username,
      first
    });
    return user.projectsV2.nodes;
  }

  async getOrgProjectsBeta(org: string, first = 20) {
    const { organization } = await this.graphql<{ organization: { projectsV2: { nodes: ProjectBetaSummary[] } } }>(GET_ORG_PROJECTS_BETA, {
      org,
      first
    });
    return organization.projectsV2.nodes;
  }

  async getAllUserProjectsBeta() {
    const user = await this.getCurrentUser();
    return this.getUserProjectsBeta(user.login);
  }

  async getAllOrgProjectsBeta() {
    const orgs = await this.getUserOrganizations();
    let allProjects: ProjectBetaSummary[] = [];

    for (const org of orgs) {
      const projects = await this.getOrgProjectsBeta(org.login);
      allProjects = [...allProjects, ...projects];
    }

    return allProjects;
  }

  async getProjectBeta(owner: string, number: number) {
    try {
      // Try to get as user project first
      const { user } = await this.graphql<{ user: { projectV2: ProjectBeta } }>(GET_PROJECT_BETA, {
        owner,
        number
      });
      return user.projectV2;
    } catch {
      // If not found, try as org project
      const { organization } = await this.graphql<{ organization: { projectV2: ProjectBeta } }>(GET_ORG_PROJECT_BETA, {
        org: owner,
        number
      });
      return organization.projectV2;
    }
  }

  async getProjectItems(projectId: string, first = 100) {
    const { node } = await this.graphql<{ node: { items: { nodes: ProjectBetaItem[] } } }>(GET_PROJECT_ITEMS, {
      projectId,
      first
    });
    return node.items.nodes;
  }

  async addItemToProject(projectId: string, contentId: string) {
    const result = await this.graphql<{ addProjectV2ItemById: { item: Record<string, unknown> } }>(ADD_ITEM_TO_PROJECT, {
      projectId,
      contentId
    });
    return result.addProjectV2ItemById.item;
  }

  async createDraftIssue(projectId: string, title: string, body?: string) {
    const result = await this.graphql<{ addProjectV2DraftIssue: { projectItem: Record<string, unknown> } }>(CREATE_DRAFT_ISSUE, {
      projectId,
      title,
      body
    });
    return result.addProjectV2DraftIssue.projectItem;
  }

  async updateProjectItemField(projectId: string, itemId: string, fieldId: string, value: string) {
    const result = await this.graphql<{ updateProjectV2ItemFieldValue: { projectV2Item: Record<string, unknown> } }>(UPDATE_PROJECT_ITEM_FIELD, {
      projectId,
      itemId,
      fieldId,
      value
    });
    return result.updateProjectV2ItemFieldValue.projectV2Item;
  }

  // GitHub Actions methods
  async getRepositoryWorkflows(owner: string, repo: string, first = 100) {
    const { repository } = await this.graphql<{ repository: { workflows: { nodes: GitHubWorkflow[] } } }>(GET_REPOSITORY_WORKFLOWS, {
      owner,
      name: repo,
      first
    });
    return repository.workflows.nodes;
  }

  async getWorkflowRuns(owner: string, repo: string, workflowId: string, first = 20) {
    const { node } = await this.graphql<{ node: { runs: { nodes: Array<Omit<GitHubWorkflowRun, "jobs">> } } }>(GET_WORKFLOW_RUNS, {
      owner,
      name: repo,
      workflowId,
      first
    });
    return node.runs.nodes;
  }

  async getWorkflowRun(runId: string) {
    const { node } = await this.graphql<{ node: GitHubWorkflowRun }>(GET_WORKFLOW_RUN, {
      runId
    });
    return node;
  }

  async triggerWorkflow(owner: string, repo: string, workflowId: string, ref: string, inputs: Record<string, string> = {}) {
    const result = await this.graphql<{ createWorkflowDispatch: Record<string, unknown> }>(TRIGGER_WORKFLOW, {
      input: {
        workflowId,
        ref,
        inputs
      }
    });
    return result.createWorkflowDispatch;
  }

  async cancelWorkflowRun(runId: string) {
    const result = await this.graphql<{ cancelWorkflowRun: Record<string, unknown> }>(CANCEL_WORKFLOW_RUN, {
      input: {
        runId
      }
    });
    return result.cancelWorkflowRun;
  }

  async rerunWorkflow(runId: string) {
    const result = await this.graphql<{ rerunWorkflow: Record<string, unknown> }>(RERUN_WORKFLOW, {
      input: {
        runId
      }
    });
    return result.rerunWorkflow;
  }

  async getWorkflowUsage(owner: string, repo: string) {
    const { repository } = await this.graphql<{ repository: { actions: { workflows: { nodes: unknown[] } } } }>(GET_WORKFLOW_USAGE, {
      owner,
      name: repo
    });
    return repository.actions.workflows.nodes;
  }

  async getRepositorySecrets(owner: string, repo: string) {
    const { repository } = await this.graphql<{ repository: { secrets: { nodes: unknown[] } } }>(GET_REPOSITORY_SECRETS, {
      owner,
      name: repo
    });
    return repository.secrets.nodes;
  }

  async getRepositoryEnvironments(owner: string, repo: string) {
    const { repository } = await this.graphql<{ repository: { environments: { nodes: unknown[] } } }>(GET_REPOSITORY_ENVIRONMENTS, {
      owner,
      name: repo
    });
    return repository.environments.nodes;
  }

  // REST API methods for GitHub Actions
  async getWorkflowRunLogs(owner: string, repo: string, runId: number) {
    const response = await this.octokit.rest.actions.downloadWorkflowRunLogs({
      owner,
      repo,
      run_id: runId
    });
    return response.url;
  }

  async getWorkflowRunJobs(owner: string, repo: string, runId: number) {
    const { data } = await this.octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId
    });
    return data.jobs;
  }

  async createOrUpdateRepositorySecret(owner: string, repo: string, secretName: string, secretValue: string) {
    // First, get the public key for the repository
    const { data: publicKeyData } = await this.octokit.rest.actions.getRepoPublicKey({
      owner,
      repo
    });

    // Use the sodium-plus library to encrypt the secret
    // This is a simplified version - in a real app, you'd need to properly encrypt the secret
    // using the public key and sodium-plus or similar library
    const encryptedValue = Buffer.from(secretValue).toString('base64');

    // Create or update the secret
    const { data } = await this.octokit.rest.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: publicKeyData.key_id
    });

    return data;
  }

  // GitHub Discussions methods
  async getRepositoryDiscussions(owner: string, repo: string, first = 20, after?: string) {
    const { repository } = await this.graphql<{ repository: { discussions: {
      nodes: RepositoryDiscussion[];
      totalCount: number;
      pageInfo: PageInfo;
    } } }>(GET_REPOSITORY_DISCUSSIONS, {
      owner,
      name: repo,
      first,
      after
    });
    return repository.discussions;
  }

  async getDiscussion(owner: string, repo: string, number: number) {
    const { repository } = await this.graphql<{ repository: { discussion: RepositoryDiscussion } }>(GET_DISCUSSION, {
      owner,
      name: repo,
      number
    });
    return repository.discussion;
  }

  async getDiscussionComments(owner: string, repo: string, number: number, first = 20, after?: string) {
    const { repository } = await this.graphql<{ repository: { discussion: { comments: {
      nodes: DiscussionComment[];
      totalCount: number;
      pageInfo: PageInfo;
    } } } }>(GET_DISCUSSION_COMMENTS, {
      owner,
      name: repo,
      number,
      first,
      after
    });
    return repository.discussion.comments;
  }

  async getDiscussionCategories(owner: string, repo: string) {
    const { repository } = await this.graphql<{ repository: { discussionCategories: { nodes: DiscussionCategory[] } } }>(GET_DISCUSSION_CATEGORIES, {
      owner,
      name: repo
    });
    return repository.discussionCategories.nodes;
  }

  async createDiscussion(input: {
    repositoryId: string;
    categoryId: string;
    title: string;
    body: string;
  }) {
    const result = await this.graphql<{ createDiscussion: { discussion: { id: string; number: number; url: string } } }>(CREATE_DISCUSSION, {
      input
    });
    return result.createDiscussion.discussion;
  }

  async addDiscussionComment(input: {
    discussionId: string;
    body: string;
  }) {
    const result = await this.graphql<{ addDiscussionComment: { comment: Record<string, unknown> } }>(ADD_DISCUSSION_COMMENT, {
      input
    });
    return result.addDiscussionComment.comment;
  }

  async addDiscussionReply(input: {
    commentId: string;
    body: string;
  }) {
    const result = await this.graphql<{ addDiscussionReply: { reply: Record<string, unknown> } }>(ADD_DISCUSSION_REPLY, {
      input
    });
    return result.addDiscussionReply.reply;
  }

  async markDiscussionCommentAsAnswer(input: {
    commentId: string;
  }) {
    const result = await this.graphql<{ markDiscussionCommentAsAnswer: { discussion: Record<string, unknown> } }>(MARK_DISCUSSION_COMMENT_AS_ANSWER, {
      input
    });
    return result.markDiscussionCommentAsAnswer.discussion;
  }

  async unmarkDiscussionCommentAsAnswer(input: {
    commentId: string;
  }) {
    const result = await this.graphql<{ unmarkDiscussionCommentAsAnswer: { discussion: Record<string, unknown> } }>(UNMARK_DISCUSSION_COMMENT_AS_ANSWER, {
      input
    });
    return result.unmarkDiscussionCommentAsAnswer.discussion;
  }

  async addReaction(input: {
    subjectId: string;
    content: 'THUMBS_UP' | 'THUMBS_DOWN' | 'LAUGH' | 'HOORAY' | 'CONFUSED' | 'HEART' | 'ROCKET' | 'EYES';
  }) {
    const result = await this.graphql<{ addReaction: { reaction: Record<string, unknown> } }>(ADD_REACTION, {
      input
    });
    return result.addReaction.reaction;
  }

  async removeReaction(input: {
    subjectId: string;
    content: 'THUMBS_UP' | 'THUMBS_DOWN' | 'LAUGH' | 'HOORAY' | 'CONFUSED' | 'HEART' | 'ROCKET' | 'EYES';
  }) {
    const result = await this.graphql<{ removeReaction: { reaction: Record<string, unknown> } }>(REMOVE_REACTION, {
      input
    });
    return result.removeReaction.reaction;
  }

  async getTrendingDiscussions(owner: string, repo: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { repository } = await this.graphql<{ repository: { discussions: { nodes: unknown[] } } }>(GET_TRENDING_DISCUSSIONS, {
      owner,
      name: repo,
      since: since.toISOString()
    });
    return repository.discussions.nodes;
  }

  async getRepositoryIdByName(owner: string, repo: string) {
    const { repository } = await this.graphql<{ repository: { id: string } }>(`
      query GetRepositoryId($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `, {
      owner,
      name: repo
    });
    return repository.id;
  }
}
