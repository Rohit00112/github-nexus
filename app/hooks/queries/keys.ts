/**
 * Query key factory. Every cache key in the app is built here so invalidation
 * targets are unambiguous — `qk.repos.all` invalidates every repository query,
 * `qk.repos.detail(o, r)` invalidates exactly one.
 */
export const qk = {
  user: {
    current: ["user", "current"] as const,
    organizations: ["user", "organizations"] as const,
    contributions: (login: string, year: number) =>
      ["user", "contributions", login, year] as const,
  },
  repos: {
    all: ["repos"] as const,
    list: (login: string, page: number) => ["repos", "list", login, page] as const,
    detail: (owner: string, repo: string) => ["repos", "detail", owner, repo] as const,
    languages: (owner: string, repo: string) => ["repos", "languages", owner, repo] as const,
    branches: (owner: string, repo: string) => ["repos", "branches", owner, repo] as const,
    contributors: (owner: string, repo: string) => ["repos", "contributors", owner, repo] as const,
    releases: (owner: string, repo: string) => ["repos", "releases", owner, repo] as const,
    search: (query: string, page: number) => ["repos", "search", query, page] as const,
  },
  issues: {
    all: ["issues"] as const,
    forRepo: (owner: string, repo: string, page: number) =>
      ["issues", "repo", owner, repo, page] as const,
    detail: (owner: string, repo: string, number: number) =>
      ["issues", "detail", owner, repo, number] as const,
    comments: (owner: string, repo: string, number: number) =>
      ["issues", "comments", owner, repo, number] as const,
    forUser: (login: string, role: string, state: string, query: string, page: number) =>
      ["issues", "user", login, role, state, query, page] as const,
  },
  pulls: {
    all: ["pulls"] as const,
    forRepo: (owner: string, repo: string, page: number) =>
      ["pulls", "repo", owner, repo, page] as const,
    detail: (owner: string, repo: string, number: number) =>
      ["pulls", "detail", owner, repo, number] as const,
    files: (owner: string, repo: string, number: number) =>
      ["pulls", "files", owner, repo, number] as const,
    reviews: (owner: string, repo: string, number: number) =>
      ["pulls", "reviews", owner, repo, number] as const,
    comments: (owner: string, repo: string, number: number) =>
      ["pulls", "comments", owner, repo, number] as const,
    forUser: (login: string, role: string, state: string, query: string, page: number) =>
      ["pulls", "user", login, role, state, query, page] as const,
    pendingReviews: (owner: string, repo: string, page: number) =>
      ["pulls", "pending-reviews", owner, repo, page] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (all: boolean, participating: boolean) =>
      ["notifications", "list", all, participating] as const,
  },
  activity: {
    all: ["activity"] as const,
    events: (login: string, page: number) => ["activity", "events", login, page] as const,
  },
  gists: {
    all: ["gists"] as const,
    list: (scope: string, page: number) => ["gists", "list", scope, page] as const,
    detail: (id: string) => ["gists", "detail", id] as const,
    comments: (id: string) => ["gists", "comments", id] as const,
    starred: (id: string) => ["gists", "starred", id] as const,
  },
  projects: {
    all: ["projects"] as const,
    beta: ["projects", "beta"] as const,
    betaDetail: (owner: string, number: number) => ["projects", "beta", owner, number] as const,
    betaItems: (projectId: string) => ["projects", "beta-items", projectId] as const,
  },
  team: {
    all: ["team"] as const,
    orgTeams: (org: string) => ["team", "org-teams", org] as const,
    detail: (org: string, slug: string) => ["team", "detail", org, slug] as const,
    members: (org: string, slug: string) => ["team", "members", org, slug] as const,
    repositories: (org: string, slug: string) => ["team", "repos", org, slug] as const,
    orgMembers: (org: string) => ["team", "org-members", org] as const,
    contributions: (org: string, slug: string) => ["team", "contributions", org, slug] as const,
  },
  actions: {
    all: ["actions"] as const,
    workflows: (owner: string, repo: string) => ["actions", "workflows", owner, repo] as const,
    runs: (owner: string, repo: string, workflowId: string) =>
      ["actions", "runs", owner, repo, workflowId] as const,
    run: (runId: string) => ["actions", "run", runId] as const,
    jobs: (owner: string, repo: string, runId: number) =>
      ["actions", "jobs", owner, repo, runId] as const,
  },
  insights: {
    commitActivity: (owner: string, repo: string) => ["insights", "commits", owner, repo] as const,
    codeFrequency: (owner: string, repo: string) => ["insights", "code-freq", owner, repo] as const,
    contributors: (owner: string, repo: string) => ["insights", "contributors", owner, repo] as const,
    punchCard: (owner: string, repo: string) => ["insights", "punch-card", owner, repo] as const,
  },
  discussions: {
    all: ["discussions"] as const,
    list: (owner: string, repo: string) => ["discussions", "list", owner, repo] as const,
    detail: (owner: string, repo: string, number: number) =>
      ["discussions", "detail", owner, repo, number] as const,
    comments: (owner: string, repo: string, number: number) =>
      ["discussions", "comments", owner, repo, number] as const,
    categories: (owner: string, repo: string) => ["discussions", "categories", owner, repo] as const,
  },
  search: {
    palette: (query: string) => ["search", "palette", query] as const,
    global: (query: string, type: string, page: number) =>
      ["search", "global", query, type, page] as const,
  },
} as const;
