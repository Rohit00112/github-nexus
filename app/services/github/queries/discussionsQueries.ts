/**
 * GraphQL queries for GitHub Discussions
 */

// Query to get repository discussions
export const GET_REPOSITORY_DISCUSSIONS = `
  query GetRepositoryDiscussions($owner: String!, $name: String!, $first: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
        nodes {
          id
          number
          title
          body
          createdAt
          updatedAt
          url
          author {
            login
            avatarUrl
          }
          category {
            id
            name
            emoji
            description
          }
          comments(first: 0) {
            totalCount
          }
          labels(first: 10) {
            nodes {
              id
              name
              color
            }
          }
          answerChosenAt
          answerChosenBy {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

// Query to get a single discussion
export const GET_DISCUSSION = `
  query GetDiscussion($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        id
        number
        title
        body
        bodyHTML
        createdAt
        updatedAt
        url
        author {
          login
          avatarUrl
        }
        category {
          id
          name
          emoji
          description
        }
        labels(first: 10) {
          nodes {
            id
            name
            color
          }
        }
        answerChosenAt
        answerChosenBy {
          login
          avatarUrl
        }
      }
    }
  }
`;

// Query to get discussion comments
export const GET_DISCUSSION_COMMENTS = `
  query GetDiscussionComments($owner: String!, $name: String!, $number: Int!, $first: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        comments(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
          nodes {
            id
            body
            bodyHTML
            createdAt
            updatedAt
            author {
              login
              avatarUrl
            }
            isAnswer
            reactionGroups {
              content
              users {
                totalCount
              }
            }
            replies(first: 3) {
              totalCount
              nodes {
                id
                body
                author {
                  login
                  avatarUrl
                }
                createdAt
              }
            }
          }
        }
      }
    }
  }
`;

// Query to get discussion categories
export const GET_DISCUSSION_CATEGORIES = `
  query GetDiscussionCategories($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussionCategories(first: 20) {
        nodes {
          id
          name
          emoji
          description
          isAnswerable
        }
      }
    }
  }
`;

// Mutation to create a discussion
export const CREATE_DISCUSSION = `
  mutation CreateDiscussion($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) {
      discussion {
        id
        number
        url
      }
    }
  }
`;

// Mutation to add a discussion comment
export const ADD_DISCUSSION_COMMENT = `
  mutation AddDiscussionComment($input: AddDiscussionCommentInput!) {
    addDiscussionComment(input: $input) {
      comment {
        id
        body
        createdAt
        author {
          login
          avatarUrl
        }
      }
    }
  }
`;

// Mutation to add a discussion reply
export const ADD_DISCUSSION_REPLY = `
  mutation AddDiscussionReply($input: AddDiscussionReplyInput!) {
    addDiscussionReply(input: $input) {
      reply {
        id
        body
        createdAt
        author {
          login
          avatarUrl
        }
      }
    }
  }
`;

// Mutation to mark a comment as an answer
export const MARK_DISCUSSION_COMMENT_AS_ANSWER = `
  mutation MarkDiscussionCommentAsAnswer($input: MarkDiscussionCommentAsAnswerInput!) {
    markDiscussionCommentAsAnswer(input: $input) {
      discussion {
        id
        answerChosenAt
        answerChosenBy {
          login
        }
      }
    }
  }
`;

// Mutation to unmark a comment as an answer
export const UNMARK_DISCUSSION_COMMENT_AS_ANSWER = `
  mutation UnmarkDiscussionCommentAsAnswer($input: UnmarkDiscussionCommentAsAnswerInput!) {
    unmarkDiscussionCommentAsAnswer(input: $input) {
      discussion {
        id
        answerChosenAt
        answerChosenBy {
          login
        }
      }
    }
  }
`;

// Mutation to add a reaction to a discussion comment
export const ADD_REACTION = `
  mutation AddReaction($input: AddReactionInput!) {
    addReaction(input: $input) {
      reaction {
        content
      }
    }
  }
`;

// Mutation to remove a reaction from a discussion comment
export const REMOVE_REACTION = `
  mutation RemoveReaction($input: RemoveReactionInput!) {
    removeReaction(input: $input) {
      reaction {
        content
      }
    }
  }
`;

// Query to get trending discussions
export const GET_TRENDING_DISCUSSIONS = `
  query GetTrendingDiscussions($owner: String!, $name: String!, $since: DateTime!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          id
          number
          title
          createdAt
          author {
            login
            avatarUrl
          }
          comments(first: 0) {
            totalCount
          }
          category {
            name
            emoji
          }
        }
      }
    }
  }
`;
