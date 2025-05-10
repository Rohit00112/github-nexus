"use client";

import { useEffect, useState } from "react";
import { useGitHub } from "../../context/GitHubContext";
import { REPOSITORY_DETAILS_QUERY, REPOSITORY_CONTRIBUTORS_QUERY } from "../../services/github/queries/repositoryQueries";
import LoadingSpinner from "../ui/LoadingSpinner";

interface GraphQLRepositoryInsightsProps {
  owner: string;
  repo: string;
}

interface RepositoryData {
  repository: {
    id: string;
    name: string;
    nameWithOwner: string;
    description: string;
    url: string;
    stargazerCount: number;
    forkCount: number;
    watchers: { totalCount: number };
    issues: { totalCount: number };
    pullRequests: { totalCount: number };
    defaultBranchRef: { name: string };
    primaryLanguage: { name: string; color: string } | null;
    languages: {
      totalCount: number;
      edges: Array<{
        size: number;
        node: {
          name: string;
          color: string;
        };
      }>;
    };
    isPrivate: boolean;
    isArchived: boolean;
    isFork: boolean;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    diskUsage: number;
    licenseInfo: {
      name: string;
      url: string;
    } | null;
  };
}

interface ContributorsData {
  repository: {
    id: string;
    name: string;
    collaborators: {
      totalCount: number;
      edges: Array<{
        permission: string;
        node: {
          login: string;
          name: string;
          avatarUrl: string;
          url: string;
          contributionsCollection: {
            totalCommitContributions: number;
            totalIssueContributions: number;
            totalPullRequestContributions: number;
            totalPullRequestReviewContributions: number;
            contributionCalendar: {
              totalContributions: number;
              weeks: Array<{
                contributionDays: Array<{
                  date: string;
                  contributionCount: number;
                }>;
              }>;
            };
          };
        };
      }>;
    };
  };
}

export default function GraphQLRepositoryInsights({ owner, repo }: GraphQLRepositoryInsightsProps) {
  const { graphqlService } = useGitHub();
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [contributorsData, setContributorsData] = useState<ContributorsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepositoryData() {
      if (!graphqlService) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch repository details using GraphQL
        const repoDetails = await graphqlService.query<RepositoryData>(
          REPOSITORY_DETAILS_QUERY,
          { owner, name: repo }
        );
        setRepoData(repoDetails);

        // Fetch contributors data using GraphQL
        const contributors = await graphqlService.query<ContributorsData>(
          REPOSITORY_CONTRIBUTORS_QUERY,
          { owner, name: repo, first: 10 }
        );
        setContributorsData(contributors);
      } catch (err) {
        console.error("Error fetching repository data with GraphQL:", err);
        setError("Failed to fetch repository data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepositoryData();
  }, [graphqlService, owner, repo]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
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

  if (!repoData) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No repository data available.
      </div>
    );
  }

  const { repository } = repoData;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Repository Insights (GraphQL)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repository Overview */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Overview</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {repository.nameWithOwner}</p>
              <p><span className="font-medium">Description:</span> {repository.description || "No description"}</p>
              <p><span className="font-medium">Default Branch:</span> {repository.defaultBranchRef?.name}</p>
              <p><span className="font-medium">Created:</span> {formatDate(repository.createdAt)}</p>
              <p><span className="font-medium">Last Updated:</span> {formatDate(repository.updatedAt)}</p>
              <p><span className="font-medium">Last Push:</span> {formatDate(repository.pushedAt)}</p>
              <p><span className="font-medium">Size:</span> {formatSize(repository.diskUsage * 1024)}</p>
              <p><span className="font-medium">License:</span> {repository.licenseInfo?.name || "None"}</p>
              <p>
                <span className="font-medium">Visibility:</span>{" "}
                <span className={repository.isPrivate ? "text-red-600" : "text-green-600"}>
                  {repository.isPrivate ? "Private" : "Public"}
                </span>
              </p>
              {repository.isArchived && (
                <p className="text-amber-600 font-medium">This repository is archived</p>
              )}
              {repository.isFork && (
                <p className="text-blue-600 font-medium">This repository is a fork</p>
              )}
            </div>
          </div>

          {/* Repository Stats */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {repository.stargazerCount.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Stars</div>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {repository.forkCount.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Forks</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {repository.watchers.totalCount.toLocaleString()}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Watchers</div>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {repository.issues.totalCount.toLocaleString()}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400">Open Issues</div>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg text-center col-span-2">
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {repository.pullRequests.totalCount.toLocaleString()}
                </div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">Open Pull Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        {repository.languages.edges.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Languages</h3>
            <div className="flex h-4 rounded-full overflow-hidden">
              {repository.languages.edges.map((edge, index) => {
                const percentage = (edge.size / repository.languages.edges.reduce((sum, e) => sum + e.size, 0)) * 100;
                return (
                  <div
                    key={index}
                    className="h-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: edge.node.color || "#ccc",
                    }}
                    title={`${edge.node.name}: ${percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {repository.languages.edges.map((edge, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: edge.node.color || "#ccc" }}
                  />
                  <span>{edge.node.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Contributors */}
        {contributorsData && contributorsData.repository.collaborators.edges.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Top Contributors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributorsData.repository.collaborators.edges.map((edge, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex items-center">
                  <img
                    src={edge.node.avatarUrl}
                    alt={edge.node.login}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium">{edge.node.name || edge.node.login}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {edge.node.contributionsCollection.totalCommitContributions} commits
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
