/**
 * GraphQL queries for organization-related operations
 */

/**
 * Query to get detailed information about an organization
 */
export const ORGANIZATION_DETAILS_QUERY = `
  query($login: String!) {
    organization(login: $login) {
      login
      name
      description
      avatarUrl
      url
      websiteUrl
      location
      email
      twitterUsername
      isVerified
      repositories {
        totalCount
      }
      membersWithRole {
        totalCount
      }
      teams {
        totalCount
      }
      projectsV2 {
        totalCount
      }
    }
  }
`;

/**
 * Query to get an organization's repositories with detailed information
 */
export const ORGANIZATION_REPOSITORIES_QUERY = `
  query($login: String!, $first: Int!, $after: String, $orderBy: RepositoryOrder!) {
    organization(login: $login) {
      repositories(first: $first, after: $after, orderBy: $orderBy) {
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
 * Query to get an organization's members with detailed information
 */
export const ORGANIZATION_MEMBERS_QUERY = `
  query($login: String!, $first: Int!, $after: String) {
    organization(login: $login) {
      membersWithRole(first: $first, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          role
          node {
            login
            name
            avatarUrl
            url
            bio
            company
            location
            contributionsCollection {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to get an organization's teams with detailed information
 */
export const ORGANIZATION_TEAMS_QUERY = `
  query($login: String!, $first: Int!, $after: String) {
    organization(login: $login) {
      teams(first: $first, after: $after, orderBy: {field: NAME, direction: ASC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          slug
          description
          privacy
          url
          repositories {
            totalCount
          }
          members {
            totalCount
          }
          parentTeam {
            name
            slug
          }
          childTeams {
            totalCount
          }
        }
      }
    }
  }
`;

/**
 * Query to get detailed information about a specific team
 */
export const TEAM_DETAILS_QUERY = `
  query($org: String!, $team: String!) {
    organization(login: $org) {
      team(slug: $team) {
        id
        name
        slug
        description
        privacy
        url
        createdAt
        updatedAt
        repositories(first: 10) {
          totalCount
          nodes {
            name
            nameWithOwner
            description
            url
            primaryLanguage {
              name
              color
            }
          }
        }
        members(first: 20) {
          totalCount
          nodes {
            login
            name
            avatarUrl
            url
          }
        }
        parentTeam {
          name
          slug
          url
        }
        childTeams(first: 10) {
          totalCount
          nodes {
            name
            slug
            description
            url
          }
        }
      }
    }
  }
`;

/**
 * Query to get an organization's projects with detailed information
 */
export const ORGANIZATION_PROJECTS_QUERY = `
  query($login: String!, $first: Int!, $after: String) {
    organization(login: $login) {
      projectsV2(first: $first, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          shortDescription
          url
          closed
          createdAt
          updatedAt
          creator {
            login
            avatarUrl
            url
          }
          number
          items(first: 10) {
            totalCount
          }
          fields(first: 20) {
            totalCount
            nodes {
              ... on ProjectV2FieldCommon {
                name
                dataType
              }
            }
          }
        }
      }
    }
  }
`;
