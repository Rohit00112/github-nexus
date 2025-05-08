"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGitHub } from "../../context/GitHubContext";

interface ReviewDetailsProps {
  owner: string;
  repo: string;
  pullNumber: number;
}

interface PullRequest {
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
  };
  mergeable: boolean;
  mergeable_state: string;
  draft: boolean;
}

interface Review {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  state: string;
  submitted_at: string;
  commit_id: string;
}

interface ReviewComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  body: string;
  created_at: string;
  path: string;
  position: number;
  line: number;
  commit_id: string;
}

interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export default function ReviewDetails({ owner, repo, pullNumber }: ReviewDetailsProps) {
  const { githubService } = useGitHub();
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [files, setFiles] = useState<PullRequestFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewType, setReviewType] = useState<"APPROVE" | "REQUEST_CHANGES" | "COMMENT">("COMMENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPullRequestDetails() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch pull request details, reviews, comments, and files in parallel
        const [prData, reviewsData, commentsData, filesData] = await Promise.all([
          githubService.getPullRequest(owner, repo, pullNumber),
          githubService.getPullRequestReviews(owner, repo, pullNumber),
          githubService.getPullRequestReviewComments(owner, repo, pullNumber),
          githubService.getPullRequestFiles(owner, repo, pullNumber),
        ]);
        
        setPullRequest(prData);
        setReviews(reviewsData);
        setReviewComments(commentsData);
        setFiles(filesData);
      } catch (err) {
        console.error("Error fetching pull request details:", err);
        setError("Failed to load pull request details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPullRequestDetails();
  }, [githubService, owner, repo, pullNumber]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get review state label and color
  const getReviewStateLabel = (state: string) => {
    switch (state) {
      case "APPROVED":
        return {
          label: "Approved",
          bgColor: "bg-green-100 dark:bg-green-900",
          textColor: "text-green-800 dark:text-green-200",
        };
      case "CHANGES_REQUESTED":
        return {
          label: "Changes requested",
          bgColor: "bg-red-100 dark:bg-red-900",
          textColor: "text-red-800 dark:text-red-200",
        };
      case "COMMENTED":
        return {
          label: "Commented",
          bgColor: "bg-blue-100 dark:bg-blue-900",
          textColor: "text-blue-800 dark:text-blue-200",
        };
      case "DISMISSED":
        return {
          label: "Dismissed",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-800 dark:text-gray-200",
        };
      case "PENDING":
        return {
          label: "Pending",
          bgColor: "bg-yellow-100 dark:bg-yellow-900",
          textColor: "text-yellow-800 dark:text-yellow-200",
        };
      default:
        return {
          label: state,
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-800 dark:text-gray-200",
        };
    }
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubService || !reviewBody.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      await githubService.createPullRequestReview(owner, repo, pullNumber, {
        body: reviewBody,
        event: reviewType,
      });
      
      // Refresh reviews
      const updatedReviews = await githubService.getPullRequestReviews(owner, repo, pullNumber);
      setReviews(updatedReviews);
      
      // Clear form
      setReviewBody("");
      setReviewType("COMMENT");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!pullRequest) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        Pull request not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{pullRequest.title}</h1>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                pullRequest.state === "open"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              }`}>
                {pullRequest.state}
              </span>
              <span className="mx-2">•</span>
              <span>
                <Image
                  src={pullRequest.user.avatar_url}
                  alt={pullRequest.user.login}
                  width={20}
                  height={20}
                  className="inline-block rounded-full mr-1"
                />
                {pullRequest.user.login} created this pull request on {formatDate(pullRequest.created_at)}
              </span>
            </div>
          </div>
          <a
            href={pullRequest.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            View on GitHub
          </a>
        </div>
        
        <div className="prose dark:prose-invert max-w-none mb-6">
          {pullRequest.body ? (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              {pullRequest.body}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 italic">
              No description provided.
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            <span>{pullRequest.head.ref}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>{pullRequest.base.ref}</span>
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span>{files.length} files changed</span>
            <span className="mx-1">•</span>
            <span className="text-green-600 dark:text-green-400">+{files.reduce((sum, file) => sum + file.additions, 0)}</span>
            <span className="mx-1">•</span>
            <span className="text-red-600 dark:text-red-400">-{files.reduce((sum, file) => sum + file.deletions, 0)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Submit Your Review</h2>
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label htmlFor="review-body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Comments
            </label>
            <textarea
              id="review-body"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Write your review comments here..."
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Decision
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="review-type"
                  value="COMMENT"
                  checked={reviewType === "COMMENT"}
                  onChange={() => setReviewType("COMMENT")}
                />
                <span className="ml-2">Comment only</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-green-600"
                  name="review-type"
                  value="APPROVE"
                  checked={reviewType === "APPROVE"}
                  onChange={() => setReviewType("APPROVE")}
                />
                <span className="ml-2">Approve</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-red-600"
                  name="review-type"
                  value="REQUEST_CHANGES"
                  checked={reviewType === "REQUEST_CHANGES"}
                  onChange={() => setReviewType("REQUEST_CHANGES")}
                />
                <span className="ml-2">Request changes</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !reviewBody.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const { label, bgColor, textColor } = getReviewStateLabel(review.state);
              
              return (
                <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <Image
                      src={review.user.avatar_url}
                      alt={review.user.login}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{review.user.login}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                          {label}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.submitted_at)}
                        </span>
                      </div>
                      
                      {review.body && (
                        <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {review.body}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
