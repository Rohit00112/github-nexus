"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../hooks/useAuth";
import { useGitHub } from "../../../context/GitHubContext";
import { GitHubRepository } from "../../../types/github";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import FileExplorer from "../../../components/repository/FileExplorer";
import ActivityFeed from "../../../components/repository/ActivityFeed";
import Contributors from "../../../components/repository/Contributors";
import RepositoryProjects from "../../../components/repository/RepositoryProjects";

interface RepositoryDetailPageProps {
  params: {
    owner: string;
    repo: string;
  };
}

export default function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  // Access params safely
  const ownerName = Array.isArray(params.owner) ? params.owner[0] : params.owner;
  const repoName = Array.isArray(params.repo) ? params.repo[0] : params.repo;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();

  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "issues" | "pull-requests" | "discussions" | "actions" | "projects" | "automation" | "insights" | "analytics">("code");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchRepository() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);

          const repoData = await githubService.getRepository(ownerName, repoName);
          // Use type assertion to handle potential type mismatches
          setRepository(repoData as unknown as GitHubRepository);
        } catch (err) {
          console.error("Error fetching repository:", err);
          setError("Failed to fetch repository. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchRepository();
  }, [githubService, githubLoading, ownerName, repoName]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || githubLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        ) : repository ? (
          <>
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <Link href={`/repositories/${repository.owner.login}`} className="hover:underline">
                  {repository.owner.login}
                </Link>
                <span className="mx-1">/</span>
                <span className="font-semibold text-gray-900 dark:text-white">{repository.name}</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                  {repository.private ? 'Private' : 'Public'}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-2">{repository.name}</h1>

              {repository.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {repository.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {repository.topics && repository.topics.length > 0 && repository.topics.map(topic => (
                  <span
                    key={topic}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{repository.stargazers_count} stars</span>
                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{repository.forks_count} forks</span>
                </div>

                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{repository.open_issues_count} issues</span>
                </div>

                <div className="flex items-center">
                  <span>Updated on {formatDate(repository.updated_at)}</span>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'code'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('code')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Code
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'issues'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('issues')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Issues
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'pull-requests'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('pull-requests')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Pull Requests
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'discussions'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('discussions')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  Discussions
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'actions'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('actions')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Actions
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('projects')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
                    <path d="M7 7h6v2H7V7zm0 4h6v2H7v-2z" />
                  </svg>
                  Projects
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'automation'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('automation')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Automation
                </button>
                <button
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'insights'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('insights')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Insights
                </button>
                <Link
                  href={`/repositories/${ownerName}/${repoName}/insights`}
                  className={`py-4 px-6 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Analytics
                </Link>
              </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {activeTab === 'code' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Repository Files</h3>
                    <a
                      href={repository.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      View on GitHub
                    </a>
                  </div>
                  <FileExplorer owner={ownerName} repo={repoName} />
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Issues</h3>
                    <Link
                      href={`/issues?repo=${ownerName}/${repoName}`}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All Issues
                    </Link>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium">Open Issues</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {repository.open_issues_count} open issues
                        </p>
                      </div>
                      <Link
                        href={`/issues/new?repo=${ownerName}/${repoName}`}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                      >
                        New Issue
                      </Link>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Issues list is being loaded from the Issues page. Click "View All Issues" to see them.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pull-requests' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Pull Requests</h3>
                    <Link
                      href={`/pull-requests?repo=${ownerName}/${repoName}`}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All Pull Requests
                    </Link>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium">Open Pull Requests</h4>
                      </div>
                      <a
                        href={`${repository.html_url}/compare`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                      >
                        New Pull Request
                      </a>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Pull requests list is being loaded from the Pull Requests page. Click "View All Pull Requests" to see them.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'discussions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Discussions</h3>
                    <Link
                      href={`/repositories/${ownerName}/${repoName}/discussions`}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All Discussions
                    </Link>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">GitHub Discussions</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Collaborate with your community using GitHub Discussions.
                      </p>
                      <Link
                        href={`/repositories/${ownerName}/${repoName}/discussions`}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                      >
                        View Discussions
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">GitHub Actions</h3>
                    <Link
                      href={`/repositories/${ownerName}/${repoName}/actions`}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All Workflows
                    </Link>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">GitHub Actions</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Automate your workflow with GitHub Actions.
                      </p>
                      <Link
                        href={`/repositories/${ownerName}/${repoName}/actions`}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                      >
                        View Workflows
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Repository Projects</h3>
                    <a
                      href={`https://github.com/${ownerName}/${repoName}/projects`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      View on GitHub
                    </a>
                  </div>

                  <RepositoryProjects owner={ownerName} repo={repoName} />
                </div>
              )}

              {activeTab === 'automation' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Repository Automation</h3>
                    <Link
                      href={`/repositories/${ownerName}/${repoName}/automation`}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Manage Automation Rules
                    </Link>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium">Workflow Automation</h4>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                          Create custom automation rules to streamline your workflow. Automatically assign issues, add labels, post comments, and more based on specific triggers.
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Automate issue and pull request management</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Create custom rules with flexible conditions</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Save time with automated workflows</span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <Link
                            href={`/repositories/${ownerName}/${repoName}/automation`}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                          >
                            Set Up Automation
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">Contributors</h3>
                  </div>

                  <Contributors owner={ownerName} repo={repoName} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">Repository not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The repository you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              href="/repositories"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-block"
            >
              Back to Repositories
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
