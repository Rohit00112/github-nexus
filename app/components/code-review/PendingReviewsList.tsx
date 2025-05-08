"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGitHub } from "../../context/GitHubContext";

interface PendingReviewsListProps {
  owner?: string;
  repo?: string;
  limit?: number;
}

interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  requested_at: string;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
}

export default function PendingReviewsList({ owner, repo, limit = 5 }: PendingReviewsListProps) {
  const { githubService } = useGitHub();
  const [pendingReviews, setPendingReviews] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPendingReviews() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        let reviews: PullRequest[] = [];
        
        if (owner && repo) {
          // Fetch pending reviews for a specific repository
          reviews = await githubService.getPendingReviews(owner, repo, 1, limit);
        } else {
          // Fetch pending reviews across all repositories
          const user = await githubService.getCurrentUser();
          const repos = await githubService.getUserRepositories(user.login, 1, 100);
          
          for (const repository of repos) {
            const repoReviews = await githubService.getPendingReviews(
              repository.owner.login,
              repository.name,
              1,
              limit
            );
            
            reviews = [...reviews, ...repoReviews];
            
            // Limit the total number of reviews
            if (reviews.length >= limit) {
              reviews = reviews.slice(0, limit);
              break;
            }
          }
        }
        
        // Sort by requested date (newest first)
        reviews.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
        
        setPendingReviews(reviews);
      } catch (err) {
        console.error("Error fetching pending reviews:", err);
        setError("Failed to load pending reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPendingReviews();
  }, [githubService, owner, repo, limit]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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

  if (pendingReviews.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No pending reviews</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have any pull requests waiting for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {pendingReviews.map((pr) => (
          <li key={`${pr.html_url}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <Link href={`/code-review/${pr.html_url.split('/').slice(3, 5).join('/')}/${pr.number}`} className="block p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <Image
                    src={pr.user.avatar_url}
                    alt={pr.user.login}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {pr.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {pr.user.login} wants your review on {pr.head.ref} → {pr.base.ref}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Review requested {formatDate(pr.requested_at)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!owner && !repo && (
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right">
          <Link href="/code-review" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            View all pending reviews →
          </Link>
        </div>
      )}
    </div>
  );
}
