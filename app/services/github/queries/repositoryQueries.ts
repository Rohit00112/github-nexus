/**
 * GraphQL queries for repository-related operations
 */

/**
 * Query to get detailed information about a repository
 */
export const REPOSITORY_DETAILS_QUERY = `
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      nameWithOwner
      description
      url
      homepageUrl
      stargazerCount
      forkCount
      watchers {
        totalCount
      }
      issues(states: OPEN) {
        totalCount
      }
      pullRequests(states: OPEN) {
        totalCount
      }
      defaultBranchRef {
        name
      }
      primaryLanguage {
        name
        color
      }
      languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
        totalCount
        edges {
          size
          node {
            name
            color
          }
        }
      }
      isPrivate
      isArchived
      isFork
      createdAt
      updatedAt
      pushedAt
      diskUsage
      licenseInfo {
        name
        url
      }
    }
  }
`;

/**
 * Query to get repository contributors with their contributions
 */
export const REPOSITORY_CONTRIBUTORS_QUERY = `
  query($owner: String!, $name: String!, $first: Int!) {
    repository(owner: $owner, name: $name) {
      id
      name
      collaborators(first: $first) {
        totalCount
        edges {
          permission
          node {
            login
            name
            avatarUrl
            url
            contributionsCollection(
              from: "${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()}"
              to: "${new Date().toISOString()}"
            ) {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to get repository issues with detailed information
 */
export const REPOSITORY_ISSUES_QUERY = `
  query($owner: String!, $name: String!, $first: Int!, $states: [IssueState!], $after: String) {
    repository(owner: $owner, name: $name) {
      issues(first: $first, states: $states, after: $after, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          url
          state
          createdAt
          updatedAt
          author {
            login
            avatarUrl
            url
          }
          labels(first: 10) {
            nodes {
              id
              name
              color
              description
            }
          }
          assignees(first: 5) {
            nodes {
              login
              avatarUrl
              url
            }
          }
          comments {
            totalCount
          }
          reactions {
            totalCount
          }
          milestone {
            title
            dueOn
          }
        }
      }
    }
  }
`;

/**
 * Query to get repository pull requests with detailed information
 */
export const REPOSITORY_PULL_REQUESTS_QUERY = `
  query($owner: String!, $name: String!, $first: Int!, $states: [PullRequestState!], $after: String) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: $first, states: $states, after: $after, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          url
          state
          createdAt
          updatedAt
          author {
            login
            avatarUrl
            url
          }
          labels(first: 10) {
            nodes {
              id
              name
              color
              description
            }
          }
          assignees(first: 5) {
            nodes {
              login
              avatarUrl
              url
            }
          }
          reviewRequests(first: 5) {
            nodes {
              requestedReviewer {
                ... on User {
                  login
                  avatarUrl
                  url
                }
              }
            }
          }
          reviews(first: 10) {
            totalCount
            nodes {
              author {
                login
                avatarUrl
                url
              }
              state
              submittedAt
            }
          }
          comments {
            totalCount
          }
          commits(first: 1) {
            totalCount
            nodes {
              commit {
                statusCheckRollup {
                  state
                }
              }
            }
          }
          mergeable
          isDraft
          additions
          deletions
          changedFiles
        }
      }
    }
  }
`;
