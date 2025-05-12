import { Octokit } from "octokit";
import { AuthCredentials, AuthMethod, AuthService } from "../auth/authService";

export class GitHubService {
  // Make octokit public so components can access it directly
  public octokit: Octokit;
  private authMethod: AuthMethod;

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
      files: options.files,
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
    } catch (error) {
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
    return data;
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
    const { data } = await this.octokit.rest.repos.getWeeklyCommitCount({
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
      ...options,
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

      const isReviewer = reviewRequests.reviewers?.some(reviewer => reviewer.login === user.login);

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

  async getUserContributions(username: string, from?: Date, to?: Date) {
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
  async getOrganizationProjects(org: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.projects.listForOrg({
      org,
      per_page: perPage,
      page,
      state: 'open',
    });
    return data;
  }

  async getUserProjects(username: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.projects.listForUser({
      username,
      per_page: perPage,
      page,
      state: 'open',
    });
    return data;
  }

  async getRepositoryProjects(owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.projects.listForRepo({
      owner,
      repo,
      per_page: perPage,
      page,
      state: 'open',
    });
    return data;
  }

  async getProject(project_id: number) {
    const { data } = await this.octokit.rest.projects.get({
      project_id,
    });
    return data;
  }

  async createProject(options: {
    owner: string;
    repo?: string;
    name: string;
    body?: string;
    org?: string;
  }) {
    if (options.org) {
      const { data } = await this.octokit.rest.projects.createForOrg({
        org: options.org,
        name: options.name,
        body: options.body,
      });
      return data;
    } else if (options.repo) {
      const { data } = await this.octokit.rest.projects.createForRepo({
        owner: options.owner,
        repo: options.repo,
        name: options.name,
        body: options.body,
      });
      return data;
    } else {
      const { data } = await this.octokit.rest.projects.createForAuthenticatedUser({
        name: options.name,
        body: options.body,
      });
      return data;
    }
  }

  async updateProject(project_id: number, options: {
    name?: string;
    body?: string;
    state?: 'open' | 'closed';
    organization_permission?: 'read' | 'write' | 'admin' | 'none';
    private?: boolean;
  }) {
    const { data } = await this.octokit.rest.projects.update({
      project_id,
      ...options,
    });
    return data;
  }

  async deleteProject(project_id: number) {
    const { data } = await this.octokit.rest.projects.delete({
      project_id,
    });
    return data;
  }

  async getProjectColumns(project_id: number) {
    const { data } = await this.octokit.rest.projects.listColumns({
      project_id,
    });
    return data;
  }

  async getProjectColumn(column_id: number) {
    const { data } = await this.octokit.rest.projects.getColumn({
      column_id,
    });
    return data;
  }

  async createProjectColumn(project_id: number, name: string) {
    const { data } = await this.octokit.rest.projects.createColumn({
      project_id,
      name,
    });
    return data;
  }

  async updateProjectColumn(column_id: number, name: string) {
    const { data } = await this.octokit.rest.projects.updateColumn({
      column_id,
      name,
    });
    return data;
  }

  async deleteProjectColumn(column_id: number) {
    const { data } = await this.octokit.rest.projects.deleteColumn({
      column_id,
    });
    return data;
  }

  async moveProjectColumn(column_id: number, position: 'first' | 'last' | 'after:' | string) {
    const { data } = await this.octokit.rest.projects.moveColumn({
      column_id,
      position,
    });
    return data;
  }

  async getColumnCards(column_id: number, page = 1, perPage = 100) {
    const { data } = await this.octokit.rest.projects.listCards({
      column_id,
      per_page: perPage,
      page,
    });
    return data;
  }

  async getCard(card_id: number) {
    const { data } = await this.octokit.rest.projects.getCard({
      card_id,
    });
    return data;
  }

  async createCard(column_id: number, options: {
    note?: string;
    content_id?: number;
    content_type?: 'Issue' | 'PullRequest';
  }) {
    const { data } = await this.octokit.rest.projects.createCard({
      column_id,
      ...options,
    });
    return data;
  }

  async updateCard(card_id: number, note: string) {
    const { data } = await this.octokit.rest.projects.updateCard({
      card_id,
      note,
    });
    return data;
  }

  async deleteCard(card_id: number) {
    const { data } = await this.octokit.rest.projects.deleteCard({
      card_id,
    });
    return data;
  }

  async moveCard(card_id: number, position: 'top' | 'bottom' | 'after:' | string, column_id?: number) {
    const { data } = await this.octokit.rest.projects.moveCard({
      card_id,
      position,
      column_id,
    });
    return data;
  }

  async getAllUserProjects() {
    const user = await this.getCurrentUser();
    return this.getUserProjects(user.login, 1, 100);
  }

  async getAllOrganizationProjects() {
    const orgs = await this.getUserOrganizations();
    let allProjects: any[] = [];

    for (const org of orgs) {
      const projects = await this.getOrganizationProjects(org.login, 1, 100);
      allProjects = [...allProjects, ...projects];
    }

    return allProjects;
  }

  async getAllRepositoryProjects() {
    const repos = await this.getUserRepositories();
    let allProjects: any[] = [];

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
}
