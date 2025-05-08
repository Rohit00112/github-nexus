"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../../../components/layout/MainLayout";
import ReviewDetails from "../../../../components/code-review/ReviewDetails";
import FileChanges from "../../../../components/code-review/FileChanges";
import { useGitHub } from "../../../../context/GitHubContext";

export default function PullRequestReviewPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const pullNumber = parseInt(params.pullNumber as string, 10);
  
  const { githubService } = useGitHub();
  const [activeTab, setActiveTab] = useState<"conversation" | "files">("conversation");
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const filesData = await githubService.getPullRequestFiles(owner, repo, pullNumber);
        setFiles(filesData);
      } catch (err) {
        console.error("Error fetching pull request files:", err);
        setError("Failed to load pull request files. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFiles();
  }, [githubService, owner, repo, pullNumber]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link href="/code-review" className="hover:text-blue-600 dark:hover:text-blue-400">
              Code Review
            </Link>
            <span>/</span>
            <Link href={`/repositories/${owner}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {owner}
            </Link>
            <span>/</span>
            <Link href={`/repositories/${owner}/${repo}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {repo}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-200">Pull Request #{pullNumber}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("conversation")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "conversation"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Conversation
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Files Changed ({files.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "conversation" && (
          <ReviewDetails owner={owner} repo={repo} pullNumber={pullNumber} />
        )}

        {activeTab === "files" && (
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
                {error}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Files Changed</h2>
                <FileChanges files={files} />
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
