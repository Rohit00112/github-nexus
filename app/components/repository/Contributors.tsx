"use client";

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ContributorsProps {
  owner: string;
  repo: string;
}

interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

const Contributors: FC<ContributorsProps> = ({ owner, repo }) => {
  const { githubService } = useGitHub();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Fetch repository contributors
  useEffect(() => {
    async function fetchContributors() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await githubService.octokit.rest.repos.listContributors({
          owner,
          repo,
          per_page: 100
        });
        
        setContributors(response.data as Contributor[]);
      } catch (err) {
        console.error("Error fetching repository contributors:", err);
        setError("Failed to load repository contributors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContributors();
  }, [githubService, owner, repo]);

  // Get displayed contributors (limited or all)
  const displayedContributors = showAll 
    ? contributors 
    : contributors.slice(0, 10);

  // Calculate total contributions
  const totalContributions = contributors.reduce(
    (sum, contributor) => sum + contributor.contributions, 
    0
  );

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Contributors ({contributors.length})
        </h3>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner size="medium" />
          </div>
        ) : contributors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Total Contributors
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contributors.length}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Total Contributions
                </h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalContributions.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {displayedContributors.map(contributor => {
                // Calculate contribution percentage
                const contributionPercentage = Math.round(
                  (contributor.contributions / totalContributions) * 100
                );
                
                return (
                  <div 
                    key={contributor.id} 
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 mr-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <a 
                            href={contributor.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {contributor.login}
                          </a>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {contributor.contributions.toLocaleString()} contribution{contributor.contributions !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 w-full sm:w-32">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                                style={{ width: `${contributionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {contributionPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {contributors.length > 10 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  {showAll ? 'Show Less' : `Show All (${contributors.length})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No contributors found for this repository.
          </div>
        )}
      </div>
    </div>
  );
};

export default Contributors;
