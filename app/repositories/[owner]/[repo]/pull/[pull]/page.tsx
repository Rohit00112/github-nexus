"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MainLayout from "../../../../../components/layout/MainLayout";
import { useAuth } from "../../../../../hooks/useAuth";
import { useGitHub } from "../../../../../context/GitHubContext";
import { useAutomation } from "../../../../../context/AutomationContext";
import { GitHubPullRequest, GitHubComment } from "../../../../../types/github";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";
import ReactMarkdown from 'react-markdown';
import RuleExecutor from "../../../../../components/automation/RuleExecutor";

interface PullRequestDetailPageProps {
  params: {
    owner: string;
    repo: string;
    pull: string;
  };
}

export default function PullRequestDetailPage({ params }: PullRequestDetailPageProps) {
  // Access params safely
  const ownerName = Array.isArray(params.owner) ? params.owner[0] : params.owner;
  const repoName = Array.isArray(params.repo) ? params.repo[0] : params.repo;
  const pullNumber = Array.isArray(params.pull) ? params.pull[0] : params.pull;

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const { rules, isLoading: automationLoading } = useAutomation();

  const [pullRequest, setPullRequest] = useState<GitHubPullRequest | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchPullRequestAndComments() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);

          const prData = await githubService.getPullRequest(ownerName, repoName, parseInt(pullNumber));
          setPullRequest(prData);

          const commentsData = await githubService.getPullRequestComments(ownerName, repoName, parseInt(pullNumber));
          setComments(commentsData);
        } catch (err) {
          console.error("Error fetching pull request:", err);
          setError("Failed to fetch pull request. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchPullRequestAndComments();
  }, [githubService, githubLoading, ownerName, repoName, pullNumber]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);

      const comment = await githubService?.createPullRequestComment(
        ownerName,
        repoName,
        parseInt(pullNumber),
        newComment
      );

      if (comment) {
        setComments([...comments, comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("Failed to create comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMergePullRequest = async () => {
    if (!pullRequest) return;

    try {
      setIsSubmitting(true);

      const merged = await githubService?.mergePullRequest(
        ownerName,
        repoName,
        parseInt(pullNumber),
        `Merge pull request #${pullNumber} from ${pullRequest.head.ref}`,
        "merge"
      );

      if (merged) {
        // Refresh the pull request data
        const prData = await githubService?.getPullRequest(ownerName, repoName, parseInt(pullNumber));
        if (prData) {
          setPullRequest(prData);
        }
      }
    } catch (err) {
      console.error("Error merging pull request:", err);
      alert("Failed to merge pull request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePullRequest = async () => {
    if (!pullRequest) return;

    try {
      setIsSubmitting(true);

      const updatedPR = await githubService?.updatePullRequest(
        ownerName,
        repoName,
        parseInt(pullNumber),
        { state: "closed" }
      );

      if (updatedPR) {
        setPullRequest(updatedPR);
      }
    } catch (err) {
      console.error("Error closing pull request:", err);
      alert("Failed to close pull request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenPullRequest = async () => {
    if (!pullRequest) return;

    try {
      setIsSubmitting(true);

      const updatedPR = await githubService?.updatePullRequest(
        ownerName,
        repoName,
        parseInt(pullNumber),
        { state: "open" }
      );

      if (updatedPR) {
        setPullRequest(updatedPR);
      }
    } catch (err) {
      console.error("Error reopening pull request:", err);
      alert("Failed to reopen pull request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get state label
  const getStateLabel = () => {
    if (!pullRequest) return "";

    if (pullRequest.draft) {
      return "Draft";
    }

    if (pullRequest.state === "closed") {
      if (pullRequest.merged) {
        return "Merged";
      }
      return "Closed";
    }

    return "Open";
  };

  // Get state color
  const getStateColor = () => {
    if (!pullRequest) return "";

    if (pullRequest.draft) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }

    if (pullRequest.state === "closed") {
      if (pullRequest.merged) {
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      }
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }

    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  if (authLoading || githubLoading || automationLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
          {error}
        </div>
      </MainLayout>
    );
  }

  if (!pullRequest) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Pull request not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The pull request you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/pull-requests"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Back to Pull Requests
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-6">
        <div className="mb-6">
          <Link
            href={`/repositories/${ownerName}/${repoName}`}
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to {ownerName}/{repoName}
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {pullRequest.title} <span className="text-gray-500">#{pullRequest.number}</span>
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor()}`}>
                {getStateLabel()}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center mr-4">
                <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                  <Image
                    src={pullRequest.user.avatar_url}
                    alt={pullRequest.user.login}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span>{pullRequest.user.login}</span>
              </div>
              <span>opened this pull request on {formatDate(pullRequest.created_at)}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{pullRequest.body || 'No description provided.'}</ReactMarkdown>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium">{getStateLabel()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Commits:</span>
                    <span className="font-medium">{pullRequest.commits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Changed files:</span>
                    <span className="font-medium">{pullRequest.changed_files}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Additions:</span>
                    <span className="font-medium text-green-600">+{pullRequest.additions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deletions:</span>
                    <span className="font-medium text-red-600">-{pullRequest.deletions}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branches</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Base:</span>
                    <span className="font-medium">{pullRequest.base.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Head:</span>
                    <span className="font-medium">{pullRequest.head.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mergeable:</span>
                    <span className="font-medium">
                      {pullRequest.mergeable === null ? 'Unknown' :
                       pullRequest.mergeable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {comments.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {comments.map(comment => (
                <div key={comment.id} className="p-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center mr-4">
                      <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={comment.user.avatar_url}
                          alt={comment.user.login}
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span>{comment.user.login}</span>
                    </div>
                    <span>commented on {formatDate(comment.created_at)}</span>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{comment.body}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleSubmitComment}>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between">
                <div>
                  {pullRequest.state === 'open' ? (
                    <>
                      {!pullRequest.draft && pullRequest.mergeable && (
                        <button
                          type="button"
                          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50"
                          onClick={handleMergePullRequest}
                          disabled={isSubmitting}
                        >
                          Merge pull request
                        </button>
                      )}
                      <button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50"
                        onClick={handleClosePullRequest}
                        disabled={isSubmitting}
                      >
                        Close pull request
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50"
                      onClick={handleReopenPullRequest}
                      disabled={isSubmitting || pullRequest.merged}
                    >
                      Reopen pull request
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Automation Rules Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <RuleExecutor
              owner={ownerName}
              repo={repoName}
              pullNumber={parseInt(pullNumber)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
