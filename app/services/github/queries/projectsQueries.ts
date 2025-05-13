/**
 * GraphQL queries for GitHub Projects (beta)
 */

// Query to get a list of projects (beta) for the authenticated user
export const GET_USER_PROJECTS_BETA = `
  query GetUserProjectsBeta($login: String!, $first: Int!) {
    user(login: $login) {
      projectsV2(first: $first) {
        nodes {
          id
          title
          number
          shortDescription
          url
          closed
          createdAt
          updatedAt
          creator {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

// Query to get a list of projects (beta) for an organization
export const GET_ORG_PROJECTS_BETA = `
  query GetOrgProjectsBeta($org: String!, $first: Int!) {
    organization(login: $org) {
      projectsV2(first: $first) {
        nodes {
          id
          title
          number
          shortDescription
          url
          closed
          createdAt
          updatedAt
          creator {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

// Query to get a single project (beta) by number
export const GET_PROJECT_BETA = `
  query GetProjectBeta($owner: String!, $number: Int!) {
    user(login: $owner) {
      projectV2(number: $number) {
        id
        title
        number
        shortDescription
        url
        closed
        createdAt
        updatedAt
        creator {
          login
          avatarUrl
        }
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2IterationField {
              id
              name
              dataType
              configuration {
                iterations {
                  startDate
                  endDate
                }
                duration
                completedIterations
              }
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                color
              }
            }
          }
        }
        views(first: 10) {
          nodes {
            id
            name
            layout
          }
        }
      }
    }
  }
`;

// Query to get a single organization project (beta) by number
export const GET_ORG_PROJECT_BETA = `
  query GetOrgProjectBeta($org: String!, $number: Int!) {
    organization(login: $org) {
      projectV2(number: $number) {
        id
        title
        number
        shortDescription
        url
        closed
        createdAt
        updatedAt
        creator {
          login
          avatarUrl
        }
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2IterationField {
              id
              name
              dataType
              configuration {
                iterations {
                  startDate
                  endDate
                }
                duration
                completedIterations
              }
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                color
              }
            }
          }
        }
        views(first: 10) {
          nodes {
            id
            name
            layout
          }
        }
      }
    }
  }
`;

// Query to get project items (cards)
export const GET_PROJECT_ITEMS = `
  query GetProjectItems($projectId: ID!, $first: Int!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: $first) {
          nodes {
            id
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on Issue {
                id
                title
                number
                state
                repository {
                  name
                  owner {
                    login
                  }
                }
              }
              ... on PullRequest {
                id
                title
                number
                state
                repository {
                  name
                  owner {
                    login
                  }
                }
              }
              ... on DraftIssue {
                id
                title
                body
              }
            }
          }
        }
      }
    }
  }
`;

// Mutation to add an item (issue or PR) to a project
export const ADD_ITEM_TO_PROJECT = `
  mutation AddItemToProject($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: {
      projectId: $projectId,
      contentId: $contentId
    }) {
      item {
        id
      }
    }
  }
`;

// Mutation to create a draft issue in a project
export const CREATE_DRAFT_ISSUE = `
  mutation CreateDraftIssue($projectId: ID!, $title: String!, $body: String) {
    addProjectV2DraftIssue(input: {
      projectId: $projectId,
      title: $title,
      body: $body
    }) {
      projectItem {
        id
      }
    }
  }
`;

// Mutation to update a project field value
export const UPDATE_PROJECT_ITEM_FIELD = `
  mutation UpdateProjectItemField($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId,
      itemId: $itemId,
      fieldId: $fieldId,
      value: $value
    }) {
      projectV2Item {
        id
      }
    }
  }
`;
