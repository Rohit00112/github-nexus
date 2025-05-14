"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Spinner,
  Chip,
  Divider,
  Textarea,
  Avatar,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FaceSmileIcon,
  HeartIcon,
  RocketLaunchIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import ReactMarkdown from 'react-markdown';

interface DiscussionDetailProps {
  owner: string;
  repo: string;
  discussionNumber: number;
}

export default function DiscussionDetail({ owner, repo, discussionNumber }: DiscussionDetailProps) {
  const { githubService } = useGitHub();
  const [discussion, setDiscussion] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Fetch discussion details
  useEffect(() => {
    async function fetchDiscussionDetails() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get discussion
        const discussionData = await githubService.getDiscussion(owner, repo, discussionNumber);
        setDiscussion(discussionData);
        
        // Get comments
        await fetchComments();
      } catch (err) {
        console.error("Error fetching discussion:", err);
        setError("Failed to fetch discussion. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDiscussionDetails();
  }, [githubService, owner, repo, discussionNumber]);

  // Fetch comments when page changes
  useEffect(() => {
    if (discussion) {
      fetchComments();
    }
  }, [page]);

  // Fetch comments
  async function fetchComments() {
    if (!githubService) return;
    
    try {
      setIsLoadingComments(true);
      
      const commentsData = await githubService.getDiscussionComments(
        owner,
        repo,
        discussionNumber,
        itemsPerPage,
        page > 1 ? endCursor : undefined
      );
      
      setComments(commentsData.nodes);
      setTotalComments(commentsData.totalCount);
      setHasNextPage(commentsData.pageInfo.hasNextPage);
      setEndCursor(commentsData.pageInfo.endCursor);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!githubService || !discussion || !commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      await githubService.addDiscussionComment({
        discussionId: discussion.id,
        body: commentText
      });
      
      // Reset form and refresh comments
      setCommentText("");
      setPage(1);
      setEndCursor(null);
      await fetchComments();
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle mark as answer
  const handleMarkAsAnswer = async (commentId: string) => {
    if (!githubService || !discussion) return;
    
    try {
      await githubService.markDiscussionCommentAsAnswer({
        commentId
      });
      
      // Refresh discussion and comments
      const discussionData = await githubService.getDiscussion(owner, repo, discussionNumber);
      setDiscussion(discussionData);
      await fetchComments();
    } catch (err) {
      console.error("Error marking as answer:", err);
      alert("Failed to mark as answer. Please try again.");
    }
  };

  // Handle unmark as answer
  const handleUnmarkAsAnswer = async (commentId: string) => {
    if (!githubService || !discussion) return;
    
    try {
      await githubService.unmarkDiscussionCommentAsAnswer({
        commentId
      });
      
      // Refresh discussion and comments
      const discussionData = await githubService.getDiscussion(owner, repo, discussionNumber);
      setDiscussion(discussionData);
      await fetchComments();
    } catch (err) {
      console.error("Error unmarking as answer:", err);
      alert("Failed to unmark as answer. Please try again.");
    }
  };

  // Handle add reaction
  const handleAddReaction = async (subjectId: string, content: string) => {
    if (!githubService) return;
    
    try {
      await githubService.addReaction({
        subjectId,
        content: content as any
      });
      
      // Refresh comments
      await fetchComments();
    } catch (err) {
      console.error("Error adding reaction:", err);
      alert("Failed to add reaction. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error || "Discussion not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-visible">
        <CardHeader className="flex flex-col items-start gap-2 pb-0">
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="flat" color="primary">
              {discussion.category.emoji} {discussion.category.name}
            </Chip>
            {discussion.answerChosenAt && (
              <Chip size="sm" variant="flat" color="success" startContent={<CheckCircleIcon className="h-3 w-3" />}>
                Answered
              </Chip>
            )}
          </div>
          <h1 className="text-2xl font-bold">{discussion.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Avatar src={discussion.author.avatarUrl} size="sm" className="mr-2" />
              {discussion.author.login}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatDate(discussion.createdAt)}
            </div>
          </div>
        </CardHeader>
        <CardBody className="py-4">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{discussion.body}</ReactMarkdown>
          </div>
        </CardBody>
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              startContent={<HandThumbUpIcon className="h-4 w-4" />}
              onPress={() => handleAddReaction(discussion.id, "THUMBS_UP")}
            >
              Like
            </Button>
            <Button
              size="sm"
              variant="light"
              startContent={<FaceSmileIcon className="h-4 w-4" />}
              onPress={() => handleAddReaction(discussion.id, "LAUGH")}
            >
              Laugh
            </Button>
            <Button
              size="sm"
              variant="light"
              startContent={<HeartIcon className="h-4 w-4" />}
              onPress={() => handleAddReaction(discussion.id, "HEART")}
            >
              Heart
            </Button>
          </div>
          <Button
            as="a"
            href={discussion.url}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="flat"
          >
            View on GitHub
          </Button>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Comments ({totalComments})
        </h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            onPress={() => {
              setPage(1);
              setEndCursor(null);
              fetchComments();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoadingComments && page === 1 ? (
        <div className="flex justify-center items-center h-32">
          <Spinner size="md" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className={comment.isAnswer ? "border-2 border-green-500" : ""}>
              <CardHeader className="flex justify-between items-start pb-0">
                <div className="flex items-center gap-2">
                  <Avatar src={comment.author.avatarUrl} size="sm" />
                  <div>
                    <div className="font-medium">{comment.author.login}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {comment.isAnswer && (
                    <Chip color="success" size="sm" startContent={<CheckCircleIcon className="h-3 w-3" />}>
                      Answer
                    </Chip>
                  )}
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Comment actions">
                      {discussion.category.isAnswerable && (
                        comment.isAnswer ? (
                          <DropdownItem
                            key="unmark-answer"
                            startContent={<CheckCircleIcon className="h-4 w-4" />}
                            onPress={() => handleUnmarkAsAnswer(comment.id)}
                          >
                            Unmark as answer
                          </DropdownItem>
                        ) : (
                          <DropdownItem
                            key="mark-answer"
                            startContent={<CheckCircleIcon className="h-4 w-4" />}
                            onPress={() => handleMarkAsAnswer(comment.id)}
                          >
                            Mark as answer
                          </DropdownItem>
                        )
                      )}
                      <DropdownItem
                        key="copy-link"
                        startContent={<LinkIcon className="h-4 w-4" />}
                      >
                        Copy link
                      </DropdownItem>
                      <DropdownItem
                        key="report"
                        startContent={<FlagIcon className="h-4 w-4" />}
                        className="text-danger"
                      >
                        Report
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardHeader>
              <CardBody className="py-4">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{comment.body}</ReactMarkdown>
                </div>
              </CardBody>
              <CardFooter className="flex justify-between items-center pt-0">
                <div className="flex items-center gap-2">
                  {comment.reactionGroups.map((reaction: any) => (
                    reaction.users.totalCount > 0 && (
                      <Chip key={reaction.content} size="sm" variant="flat">
                        {getReactionEmoji(reaction.content)} {reaction.users.totalCount}
                      </Chip>
                    )
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    startContent={<HandThumbUpIcon className="h-4 w-4" />}
                    onPress={() => handleAddReaction(comment.id, "THUMBS_UP")}
                  >
                    Like
                  </Button>
                </div>
              </CardFooter>
              
              {comment.replies.totalCount > 0 && (
                <div className="px-6 pb-4">
                  <Divider className="my-2" />
                  <div className="text-sm font-medium mb-2">
                    Replies ({comment.replies.totalCount})
                  </div>
                  <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    {comment.replies.nodes.map((reply: any) => (
                      <div key={reply.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar src={reply.author.avatarUrl} size="sm" />
                          <div className="font-medium">{reply.author.login}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(reply.createdAt)}
                          </div>
                        </div>
                        <div className="pl-8">
                          <ReactMarkdown>{reply.body}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {comment.replies.totalCount > 3 && (
                      <Button
                        size="sm"
                        variant="light"
                        className="ml-8"
                        as="a"
                        href={`${discussion.url}#discussioncomment-${comment.id.split('_')[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View all replies
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
          
          {totalComments > itemsPerPage && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={Math.ceil(totalComments / itemsPerPage)}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardBody className="py-6">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Add a comment</h3>
        </CardHeader>
        <CardBody>
          <Textarea
            placeholder="Write your comment here... (Markdown supported)"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            minRows={4}
          />
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            startContent={<PaperAirplaneIcon className="h-4 w-4" />}
            onPress={handleSubmitComment}
            isLoading={isSubmitting}
            isDisabled={!commentText.trim()}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper function to get reaction emoji
function getReactionEmoji(content: string) {
  switch (content) {
    case 'THUMBS_UP': return '👍';
    case 'THUMBS_DOWN': return '👎';
    case 'LAUGH': return '😄';
    case 'HOORAY': return '🎉';
    case 'CONFUSED': return '😕';
    case 'HEART': return '❤️';
    case 'ROCKET': return '🚀';
    case 'EYES': return '👀';
    default: return '👍';
  }
}
