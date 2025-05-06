import { Octokit } from "octokit";

export class GitHubService {
  private octokit: Octokit;

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

  // Workflows methods
  async getWorkflows(owner: string, repo: string, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.actions.listRepoWorkflows({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return data.workflows;
  }

  async getWorkflow(owner: string, repo: string, workflow_id: number) {
    const { data } = await this.octokit.rest.actions.getWorkflow({
      owner,
      repo,
      workflow_id,
    });
    return data;
  }

  async getWorkflowRuns(owner: string, repo: string, workflow_id: number, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id,
      per_page: perPage,
      page,
    });
    return data.workflow_runs;
  }

  async getWorkflowRun(owner: string, repo: string, run_id: number) {
    const { data } = await this.octokit.rest.actions.getWorkflowRun({
      owner,
      repo,
      run_id,
    });
    return data;
  }

  async getWorkflowRunJobs(owner: string, repo: string, run_id: number, page = 1, perPage = 10) {
    const { data } = await this.octokit.rest.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id,
      per_page: perPage,
      page,
    });
    return data.jobs;
  }

  async rerunWorkflow(owner: string, repo: string, run_id: number) {
    const { data } = await this.octokit.rest.actions.reRunWorkflow({
      owner,
      repo,
      run_id,
    });
    return data;
  }

  async cancelWorkflowRun(owner: string, repo: string, run_id: number) {
    const { data } = await this.octokit.rest.actions.cancelWorkflowRun({
      owner,
      repo,
      run_id,
    });
    return data;
  }

  async triggerWorkflow(owner: string, repo: string, workflow_id: number, ref: string, inputs?: Record<string, string>) {
    const { data } = await this.octokit.rest.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id,
      ref,
      inputs,
    });
    return data;
  }

  // Organizations methods
  async getUserOrganizations() {
    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
    return data;
  }
}
