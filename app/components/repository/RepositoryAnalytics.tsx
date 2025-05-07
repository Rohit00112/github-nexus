"use client";

import { FC, useState, useEffect } from 'react';
import { useGitHub } from '../../context/GitHubContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RepositoryAnalyticsProps {
  owner: string;
  repo: string;
}

interface AnalyticsData {
  commitCount: number;
  contributorCount: number;
  issueCount: number;
  prCount: number;
  starCount: number;
  forkCount: number;
  // These would be arrays of data points in a real implementation
  commitFrequency: { date: string; count: number }[];
  issueResolutionTime: number;
}

const RepositoryAnalytics: FC<RepositoryAnalyticsProps> = ({ owner, repo }) => {
  const { githubService } = useGitHub();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        
        // In a real implementation, we would make multiple API calls to gather this data
        // For now, we'll use placeholder data
        
        // Get basic repository info
        const repoData = await githubService.getRepository(owner, repo);
        
        // Generate some random data for demonstration
        const mockCommitFrequency = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10)
          };
        }).reverse();
        
        setAnalyticsData({
          commitCount: Math.floor(Math.random() * 1000),
          contributorCount: Math.floor(Math.random() * 50),
          issueCount: repoData.open_issues_count,
          prCount: Math.floor(Math.random() * 100),
          starCount: repoData.stargazers_count,
          forkCount: repoData.forks_count,
          commitFrequency: mockCommitFrequency,
          issueResolutionTime: Math.floor(Math.random() * 72) + 24, // hours
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load repository analytics. Please try again later.");
        setIsLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [githubService, owner, repo]);

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded">
        <p>No analytics data available for this repository.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Repository Analytics</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <span className="block text-2xl font-bold">{analyticsData.commitCount}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Commits</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <span className="block text-2xl font-bold">{analyticsData.contributorCount}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Contributors</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <span className="block text-2xl font-bold">{analyticsData.issueCount}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Open Issues</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <span className="block text-2xl font-bold">{analyticsData.prCount}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Pull Requests</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <span className="block text-2xl font-bold">{analyticsData.starCount}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Stars</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
          <span className="block text-2xl font-bold">{analyticsData.forkCount}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Forks</span>
        </div>
      </div>
      
      {/* Commit Frequency Chart (Simple Version) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Commit Frequency (Last 7 Days)</h3>
        <div className="h-40 flex items-end space-x-2">
          {analyticsData.commitFrequency.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-500 w-full rounded-t-sm" 
                style={{ 
                  height: `${(day.count / Math.max(...analyticsData.commitFrequency.map(d => d.count))) * 100}%`,
                  minHeight: '4px'
                }}
              ></div>
              <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">{day.date.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Average Issue Resolution Time:</span>
            <span className="font-medium">{analyticsData.issueResolutionTime} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Commit Velocity:</span>
            <span className="font-medium">{(analyticsData.commitCount / 30).toFixed(1)} commits/day</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryAnalytics;
