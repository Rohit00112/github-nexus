"use client";

import Link from "next/link";
import { useState } from "react";
import { useGitHub } from "../../context/GitHubContext";

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    body: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    creator: {
      login: string;
      avatar_url: string;
    };
    state: string;
    number_of_columns?: number;
    owner_url?: string;
  };
  onDelete?: (projectId: number) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(false);
  const [columns, setColumns] = useState<number | null>(project.number_of_columns || null);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch columns count if not provided
  const fetchColumnsCount = async () => {
    if (columns !== null || !githubService) return;
    
    try {
      setIsLoading(true);
      const projectColumns = await githubService.getProjectColumns(project.id);
      setColumns(projectColumns.length);
    } catch (error) {
      console.error("Error fetching project columns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!githubService || !onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
      try {
        setIsLoading(true);
        await githubService.deleteProject(project.id);
        onDelete(project.id);
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      onMouseEnter={fetchColumnsCount}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {project.name}
          </Link>
          <div className="flex space-x-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                title="Delete this project"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <a
              href={project.html_url}
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
          {project.creator && (
            <>
              <img src={project.creator.avatar_url} alt={project.creator.login} className="w-5 h-5 rounded-full mr-2" />
              <span>{project.creator.login}</span>
              <span className="mx-2">•</span>
            </>
          )}
          <span>Created: {formatDate(project.created_at)}</span>
          {project.updated_at !== project.created_at && (
            <>
              <span className="mx-2">•</span>
              <span>Updated: {formatDate(project.updated_at)}</span>
            </>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
          <span className={`px-2 py-1 rounded ${
            project.state === "open" 
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          }`}>
            {project.state}
          </span>
          {columns !== null && (
            <span className="ml-2">{columns} {columns === 1 ? "column" : "columns"}</span>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        {project.body ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {project.body}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
            No description provided.
          </p>
        )}
      </div>
    </div>
  );
}
