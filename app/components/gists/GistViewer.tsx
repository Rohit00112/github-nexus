"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";

interface GistFile {
  filename: string;
  language: string;
  raw_url: string;
  size: number;
  type: string;
  content?: string;
}

interface GistOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface Gist {
  id: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner: GistOwner;
  html_url: string;
  comments: number;
}

interface GistComment {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

interface GistViewerProps {
  gistId: string;
}

export default function GistViewer({ gistId }: GistViewerProps) {
  const { githubService } = useGitHub();
  const [gist, setGist] = useState<Gist | null>(null);
  const [comments, setComments] = useState<GistComment[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch gist data
  useEffect(() => {
    async function fetchGist() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const gistData = await githubService.getGist(gistId);
        setGist(gistData);
        
        // Set the first file as active by default
        const fileNames = Object.keys(gistData.files);
        if (fileNames.length > 0 && !activeFile) {
          setActiveFile(fileNames[0]);
        }
        
        // Check if gist is starred
        const starred = await githubService.isGistStarred(gistId);
        setIsStarred(starred);
        
        // Fetch comments
        const commentsData = await githubService.getGistComments(gistId);
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching gist:", err);
        setError("Failed to load gist. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchGist();
  }, [githubService, gistId, activeFile]);

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

  // Toggle star status
  const toggleStar = async () => {
    if (!githubService) return;
    
    try {
      if (isStarred) {
        await githubService.unstarGist(gistId);
        setIsStarred(false);
      } else {
        await githubService.starGist(gistId);
        setIsStarred(true);
      }
    } catch (error) {
      console.error("Error toggling star status:", error);
    }
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubService || !newComment.trim()) return;
    
    try {
      setIsSubmittingComment(true);
      
      const comment = await githubService.createGistComment(gistId, newComment);
      setComments([...comments, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!githubService) return;
    
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await githubService.deleteGistComment(gistId, commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (err) {
        console.error("Error deleting comment:", err);
        alert("Failed to delete comment. Please try again.");
      }
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

  if (!gist) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        Gist not found.
      </div>
    );
  }

  const fileNames = Object.keys(gist.files);
  const currentFile = activeFile ? gist.files[activeFile] : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-xl font-semibold">
            {gist.description || `Gist:${gist.id.substring(0, 7)}`}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleStar}
              className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
              title={isStarred ? "Unstar this gist" : "Star this gist"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isStarred ? "text-yellow-500 fill-current" : ""}`} viewBox="0 0 20 20" fill={isStarred ? "currentColor" : "none"} stroke="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <a
              href={gist.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              title="View on GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <img src={gist.owner.avatar_url} alt={gist.owner.login} className="w-5 h-5 rounded-full mr-2" />
          <a href={gist.owner.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {gist.owner.login}
          </a>
          <span className="mx-2">•</span>
          <span>Created: {formatDate(gist.created_at)}</span>
          {gist.updated_at !== gist.created_at && (
            <>
              <span className="mx-2">•</span>
              <span>Updated: {formatDate(gist.updated_at)}</span>
            </>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
          <span className={`px-2 py-1 rounded ${gist.public ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"}`}>
            {gist.public ? "Public" : "Secret"}
          </span>
          <span className="ml-2">{fileNames.length} {fileNames.length === 1 ? "file" : "files"}</span>
        </div>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {fileNames.map(fileName => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeFile === fileName
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>
      </div>
      
      {currentFile && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentFile.filename}</span>
              {currentFile.language && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {currentFile.language}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{currentFile.size} bytes</span>
          </div>
          <pre className="text-sm overflow-x-auto p-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <code>{currentFile.content || "Content not loaded"}</code>
          </pre>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
        
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Leave a comment"
            rows={3}
            required
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
        
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <img src={comment.user.avatar_url} alt={comment.user.login} className="w-6 h-6 rounded-full mr-2" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{comment.user.login}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                      {comment.updated_at !== comment.created_at && " (edited)"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    title="Delete comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.body}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
