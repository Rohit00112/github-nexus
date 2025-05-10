import { Octokit } from "octokit";

/**
 * GitHub GraphQL API Service
 * 
 * This service provides methods to interact with GitHub's GraphQL API.
 * It complements the REST API service by providing more efficient data fetching
 * with reduced network requests through GraphQL queries.
 */
export class GitHubGraphQLService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  /**
   * Execute a GraphQL query against the GitHub API
   * 
   * @param query The GraphQL query string
   * @param variables Variables to be used in the query
   * @returns The query result data
   */
  async query<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.octokit.graphql<T>(query, variables);
      return response;
    } catch (error) {
      console.error("GraphQL query error:", error);
      throw error;
    }
  }

  /**
   * Get detailed information about the authenticated user
   * 
   * @returns User information including repositories, organizations, and other details
   */
  async getCurrentUser() {
    const query = `
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

    return this.query(query);
  }

  /**
   * Get detailed repository information
   * 
   * @param owner Repository owner (user or organization)
   * @param name Repository name
   * @returns Detailed repository information
   */
  async getRepository(owner: string, name: string) {
    const query = `
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

    return this.query(query, { owner, name });
  }

  /**
   * Search for repositories with various filters
   * 
   * @param searchQuery The search query string
   * @param first Number of repositories to return
   * @param after Cursor for pagination
   * @returns Search results with repository information
   */
  async searchRepositories(searchQuery: string, first: number = 10, after: string | null = null) {
    const query = `
      query($searchQuery: String!, $first: Int!, $after: String) {
        search(query: $searchQuery, type: REPOSITORY, first: $first, after: $after) {
          repositoryCount
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              ... on Repository {
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
                owner {
                  login
                  avatarUrl
                  url
                }
                isPrivate
                updatedAt
              }
            }
          }
        }
      }
    `;

    return this.query(query, { searchQuery, first, after });
  }
}
