/**
 * GraphQL queries for GitHub Actions
 */

// Query to get workflows for a repository
export const GET_REPOSITORY_WORKFLOWS = `
  query GetRepositoryWorkflows($owner: String!, $name: String!, $first: Int!) {
    repository(owner: $owner, name: $name) {
      workflows(first: $first) {
        nodes {
          id
          name
          state
          url
          path
          createdAt
          updatedAt
        }
        totalCount
      }
    }
  }
`;

// Query to get workflow runs for a repository
export const GET_WORKFLOW_RUNS = `
  query GetWorkflowRuns($owner: String!, $name: String!, $workflowId: ID!, $first: Int!) {
    node(id: $workflowId) {
      ... on Workflow {
        id
        name
        runs(first: $first) {
          nodes {
            id
            runNumber
            createdAt
            updatedAt
            status
            conclusion
            url
            event
            headBranch
            headCommit {
              message
              committedDate
              author {
                name
                email
                avatarUrl
              }
            }
          }
        }
      }
    }
  }
`;

// Query to get a specific workflow run
export const GET_WORKFLOW_RUN = `
  query GetWorkflowRun($runId: ID!) {
    node(id: $runId) {
      ... on WorkflowRun {
        id
        runNumber
        createdAt
        updatedAt
        status
        conclusion
        url
        event
        headBranch
        headCommit {
          message
          committedDate
          author {
            name
            email
            avatarUrl
          }
        }
        jobs(first: 10) {
          nodes {
            id
            name
            status
            conclusion
            startedAt
            completedAt
            steps(first: 20) {
              nodes {
                name
                status
                conclusion
                number
                startedAt
                completedAt
              }
            }
          }
        }
      }
    }
  }
`;

// Mutation to trigger a workflow
export const TRIGGER_WORKFLOW = `
  mutation TriggerWorkflow($input: CreateWorkflowDispatchInput!) {
    createWorkflowDispatch(input: $input) {
      clientMutationId
    }
  }
`;

// Mutation to cancel a workflow run
export const CANCEL_WORKFLOW_RUN = `
  mutation CancelWorkflowRun($input: CancelWorkflowRunInput!) {
    cancelWorkflowRun(input: $input) {
      clientMutationId
    }
  }
`;

// Mutation to re-run a workflow
export const RERUN_WORKFLOW = `
  mutation RerunWorkflow($input: RerunWorkflowInput!) {
    rerunWorkflow(input: $input) {
      clientMutationId
    }
  }
`;

// Query to get workflow usage for a repository
export const GET_WORKFLOW_USAGE = `
  query GetWorkflowUsage($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      actions {
        workflows(first: 10) {
          nodes {
            id
            name
            state
          }
        }
      }
    }
  }
`;

// Query to get repository secrets
export const GET_REPOSITORY_SECRETS = `
  query GetRepositorySecrets($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      secrets(first: 100) {
        nodes {
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;

// Query to get repository environments
export const GET_REPOSITORY_ENVIRONMENTS = `
  query GetRepositoryEnvironments($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      name
      environments(first: 10) {
        nodes {
          id
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;
