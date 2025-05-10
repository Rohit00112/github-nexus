/**
 * GraphQL queries for user-related operations
 */

/**
 * Query to get detailed information about the authenticated user (viewer)
 */
export const CURRENT_USER_QUERY = `
  query {
    viewer {
      login
      name
      avatarUrl
      bio
      company
      email
      location
      url
      websiteUrl
      twitterUsername
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          isPrivate
          updatedAt
        }
      }
      organizations(first: 10) {
        totalCount
        nodes {
          login
          name
          avatarUrl
          url
        }
      }
    }
  }
`;

/**
 * Query to get detailed information about a specific user
 */
export const USER_DETAILS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      company
      location
      url
      websiteUrl
      twitterUsername
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(first: 10, orderBy: {field: UPDATED_AT, direction: DESC}, privacy: PUBLIC) {
        totalCount
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          isPrivate
          updatedAt
        }
      }
      organizations(first: 10) {
        totalCount
        nodes {
          login
          name
          avatarUrl
          url
        }
      }
    }
  }
`;

/**
 * Query to get a user's contribution activity
 */
export const USER_CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      login
      name
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
        totalRepositoriesWithContributedIssues
        totalRepositoriesWithContributedPullRequests
        totalRepositoriesWithContributedPullRequestReviews
      }
    }
  }
`;

/**
 * Query to get a user's repositories with detailed information
 */
export const USER_REPOSITORIES_QUERY = `
  query($login: String!, $first: Int!, $after: String, $orderBy: RepositoryOrder!) {
    user(login: $login) {
      repositories(first: $first, after: $after, orderBy: $orderBy, privacy: PUBLIC) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          nameWithOwner
          description
          url
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
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
          issues(states: OPEN) {
            totalCount
          }
          pullRequests(states: OPEN) {
            totalCount
          }
          defaultBranchRef {
            name
          }
        }
      }
    }
  }
`;

/**
 * Query to get a user's organizations with detailed information
 */
export const USER_ORGANIZATIONS_QUERY = `
  query($login: String!, $first: Int!) {
    user(login: $login) {
      organizations(first: $first) {
        totalCount
        nodes {
          login
          name
          description
          avatarUrl
          url
          websiteUrl
          location
          email
          repositories {
            totalCount
          }
          membersWithRole {
            totalCount
          }
          teams {
            totalCount
          }
        }
      }
    }
  }
`;
