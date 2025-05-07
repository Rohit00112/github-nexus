import { Octokit } from "octokit";

export class GitHubService {
  // Make octokit public so components can access it directly
  public octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
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
}
