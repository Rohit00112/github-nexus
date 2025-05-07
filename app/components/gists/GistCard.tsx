"use client";

import Link from "next/link";
import { useState } from "react";
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

export interface Gist {
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

interface GistCardProps {
  gist: Gist;
  onDelete?: (gistId: string) => void;
}

export default function GistCard({ gist, onDelete }: GistCardProps) {
  const { githubService } = useGitHub();
  const [isStarred, setIsStarred] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the first file for preview
  const fileNames = Object.keys(gist.files);
  const firstFileName = fileNames[0];
  const firstFile = gist.files[firstFileName];
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if gist is starred
  const checkIfStarred = async () => {
    if (!githubService || isStarred !== null) return;
    
    try {
      setIsLoading(true);
      const starred = await githubService.isGistStarred(gist.id);
      setIsStarred(starred);
    } catch (error) {
      console.error("Error checking if gist is starred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle star status
  const toggleStar = async () => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      
      if (isStarred) {
        await githubService.unstarGist(gist.id);
        setIsStarred(false);
      } else {
        await githubService.starGist(gist.id);
        setIsStarred(true);
      }
    } catch (error) {
      console.error("Error toggling star status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!githubService || !onDelete) return;
    
    if (window.confirm("Are you sure you want to delete this gist?")) {
      try {
        setIsLoading(true);
        await githubService.deleteGist(gist.id);
        onDelete(gist.id);
      } catch (error) {
        console.error("Error deleting gist:", error);
        alert("Failed to delete gist. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      onMouseEnter={checkIfStarred}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/gists/${gist.id}`} className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {gist.description || `Gist:${gist.id.substring(0, 7)}`}
          </Link>
          <div className="flex space-x-2">
            {isStarred !== null && (
              <button
                onClick={toggleStar}
                disabled={isLoading}
                className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                title={isStarred ? "Unstar this gist" : "Star this gist"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isStarred ? "text-yellow-500 fill-current" : ""}`} viewBox="0 0 20 20" fill={isStarred ? "currentColor" : "none"} stroke="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                title="Delete this gist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <img src={gist.owner.avatar_url} alt={gist.owner.login} className="w-5 h-5 rounded-full mr-2" />
          <span>{gist.owner.login}</span>
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
          {gist.comments > 0 && (
            <span className="ml-2">{gist.comments} {gist.comments === 1 ? "comment" : "comments"}</span>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{firstFileName}</span>
            {firstFile.language && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {firstFile.language}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{firstFile.size} bytes</span>
        </div>
        <pre className="text-sm overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <code>{firstFile.content ? firstFile.content.slice(0, 200) + (firstFile.content.length > 200 ? "..." : "") : "Content not loaded"}</code>
        </pre>
      </div>
    </div>
  );
}
