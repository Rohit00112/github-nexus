// GitHub Repository Type
export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string | null;
    spdx_id?: string | null;
    node_id?: string;
    html_url?: string;
  } | null;
  topics: string[] | undefined;
  default_branch: string;
  visibility: string;
}

// GitHub User Type
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  name: string;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// GitHub Issue Type
export interface GitHubIssue {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  assignees: {
    login: string;
    id: number;
    avatar_url: string;
  }[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments: number;
}

// GitHub Comment Type
export interface GitHubComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

// GitHub Pull Request Type
export interface GitHubPullRequest {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  head: {
    ref: string;
    sha: string;
    repo: {
      id: number;
      name: string;
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      id: number;
      name: string;
      full_name: string;
    };
  };
}

// GitHub Notification Type
export interface GitHubNotification {
  id: string;
  repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      gravatar_id: string;
      url: string;
      html_url: string;
      type: string;
    };
    html_url: string;
    description: string | null;
    url: string;
  };
  subject: {
    title: string;
    url: string | null;
    latest_comment_url: string | null;
    type: string;
  };
  reason: string;
  unread: boolean;
  updated_at: string;
  last_read_at: string | null;
  url: string;
  thread_id: number;
}
