"use client";

import { useEffect, useState } from "react";
import { useGitHub } from "../../context/GitHubContext";

interface RepositoryStatsCardProps {
  owner: string;
  repo: string;
}

interface RepositoryStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  size: number;
  language: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  branches: number;
  tags: number;
  releases: number;
}

export default function RepositoryStatsCard({ owner, repo }: RepositoryStatsCardProps) {
  const { githubService } = useGitHub();
  const [stats, setStats] = useState<RepositoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepositoryStats() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch repository details
        const repoData = await githubService.getRepository(owner, repo);
        
        // Fetch branches, tags, and releases in parallel
        const [branches, tags, releases] = await Promise.all([
          githubService.getBranches(owner, repo),
          githubService.getTags(owner, repo),
          githubService.getReleases(owner, repo),
        ]);
        
        setStats({
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.subscribers_count,
          openIssues: repoData.open_issues_count,
          size: repoData.size,
          language: repoData.language,
          createdAt: repoData.created_at,
          updatedAt: repoData.updated_at,
          pushedAt: repoData.pushed_at,
          branches: branches.length,
          tags: tags.length,
          releases: releases.length,
        });
      } catch (err) {
        console.error("Error fetching repository stats:", err);
        setError("Failed to load repository statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRepositoryStats();
  }, [githubService, owner, repo]);

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

  if (!stats) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No repository statistics available.
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size
  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Repository Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.stars}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Stars</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.forks}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Forks</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{stats.watchers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Watchers</div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.openIssues}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Open Issues</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium mb-2">Repository Details</h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Primary Language:</span>
              <span className="font-medium">{stats.language || "Not specified"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Repository Size:</span>
              <span className="font-medium">{formatSize(stats.size)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="font-medium">{formatDate(stats.createdAt)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="font-medium">{formatDate(stats.updatedAt)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Push:</span>
              <span className="font-medium">{formatDate(stats.pushedAt)}</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-2">Version Control</h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Branches:</span>
              <span className="font-medium">{stats.branches}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tags:</span>
              <span className="font-medium">{stats.tags}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Releases:</span>
              <span className="font-medium">{stats.releases}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
