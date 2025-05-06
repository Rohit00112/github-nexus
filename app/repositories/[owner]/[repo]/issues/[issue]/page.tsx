"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MainLayout from "../../../../../components/layout/MainLayout";
import { useAuth } from "../../../../../hooks/useAuth";
import { useGitHub } from "../../../../../context/GitHubContext";
import { GitHubIssue, GitHubComment } from "../../../../../types/github";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";
import ReactMarkdown from 'react-markdown';

interface IssueDetailPageProps {
  params: {
    owner: string;
    repo: string;
    issue: string;
  };
}

export default function IssueDetailPage({ params }: IssueDetailPageProps) {
  // Access params safely
  const ownerName = Array.isArray(params.owner) ? params.owner[0] : params.owner;
  const repoName = Array.isArray(params.repo) ? params.repo[0] : params.repo;
  const issueNumber = Array.isArray(params.issue) ? params.issue[0] : params.issue;
  
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
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
    async function fetchIssueAndComments() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);
          
          const issueData = await githubService.getIssue(ownerName, repoName, parseInt(issueNumber));
          setIssue(issueData);
          
          const commentsData = await githubService.getIssueComments(ownerName, repoName, parseInt(issueNumber));
          setComments(commentsData);
        } catch (err) {
          console.error("Error fetching issue:", err);
          setError("Failed to fetch issue. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchIssueAndComments();
  }, [githubService, githubLoading, ownerName, repoName, issueNumber]);
  
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
      
      const comment = await githubService?.createIssueComment(
        ownerName,
        repoName,
        parseInt(issueNumber),
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
  
  const handleCloseIssue = async () => {
    if (!issue) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedIssue = await githubService?.updateIssue(
        ownerName,
        repoName,
        parseInt(issueNumber),
        { state: "closed" }
      );
      
      if (updatedIssue) {
        setIssue(updatedIssue);
      }
    } catch (err) {
      console.error("Error closing issue:", err);
      alert("Failed to close issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReopenIssue = async () => {
    if (!issue) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedIssue = await githubService?.updateIssue(
        ownerName,
        repoName,
        parseInt(issueNumber),
        { state: "open" }
      );
      
      if (updatedIssue) {
        setIssue(updatedIssue);
      }
    } catch (err) {
      console.error("Error reopening issue:", err);
      alert("Failed to reopen issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || githubLoading || isLoading) {
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
  
  if (!issue) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Issue not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The issue you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link 
            href="/issues"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Back to Issues
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
                {issue.title} <span className="text-gray-500">#{issue.number}</span>
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                issue.state === 'open' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {issue.state}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center mr-4">
                <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                  <Image
                    src={issue.user.avatar_url}
                    alt={issue.user.login}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span>{issue.user.login}</span>
              </div>
              <span>opened this issue on {formatDate(issue.created_at)}</span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{issue.body || 'No description provided.'}</ReactMarkdown>
            </div>
            
            {issue.labels.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels:</div>
                <div className="flex flex-wrap gap-2">
                  {issue.labels.map(label => (
                    <span 
                      key={label.id} 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `#${label.color}20`, 
                        color: `#${label.color}`,
                        border: `1px solid #${label.color}40`
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {issue.assignees.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignees:</div>
                <div className="flex flex-wrap gap-2">
                  {issue.assignees.map(assignee => (
                    <div key={assignee.id} className="flex items-center">
                      <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={assignee.avatar_url}
                          alt={assignee.login}
                          width={24}
                          height={24}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-sm">{assignee.login}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  {issue.state === 'open' ? (
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50"
                      onClick={handleCloseIssue}
                      disabled={isSubmitting}
                    >
                      Close issue
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50"
                      onClick={handleReopenIssue}
                      disabled={isSubmitting}
                    >
                      Reopen issue
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
      </div>
    </MainLayout>
  );
}
