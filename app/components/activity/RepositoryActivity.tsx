"use client";

import { FC, useState, useEffect } from 'react';
import { useGitHub } from '../../context/GitHubContext';
import { Card, CardBody, CardHeader, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Chip, Tabs, Tab } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { ActivityFilters } from './ActivityFilters';

interface RepositoryActivityProps {
  filters: ActivityFilters;
}

interface RepositoryStats {
  name: string;
  full_name: string;
  commits: number;
  pullRequests: number;
  issues: number;
  stars: number;
  forks: number;
  lastUpdated: string;
  url: string;
}

const RepositoryActivity: FC<RepositoryActivityProps> = ({ filters }) => {
  const { githubService } = useGitHub();
  const [repositories, setRepositories] = useState<RepositoryStats[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<RepositoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch repository data
  useEffect(() => {
    async function fetchRepositoryActivity() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user's repositories
        const user = await githubService.getCurrentUser();
        const repos = await githubService.getUserRepositories(user.login, 1, 100);
        
        // Get activity data for each repository
        const repoStats: RepositoryStats[] = [];
        
        for (const repo of repos) {
          try {
            // Get commit count
            const commitActivity = await githubService.getCommitActivity(repo.owner.login, repo.name);
            const commitCount = commitActivity.reduce((total: number, week: any) => total + week.total, 0);
            
            // Get pull request count
            const pullRequests = await githubService.getPullRequests(repo.owner.login, repo.name, 1, 1);
            const pullRequestCount = repo.open_issues_count; // This is an approximation
            
            // Get issue count (excluding PRs)
            const issueCount = repo.open_issues_count - pullRequestCount;
            
            repoStats.push({
              name: repo.name,
              full_name: repo.full_name,
              commits: commitCount,
              pullRequests: pullRequestCount,
              issues: issueCount,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              lastUpdated: repo.updated_at,
              url: repo.html_url
            });
          } catch (err) {
            console.error(`Error fetching activity for ${repo.full_name}:`, err);
          }
        }
        
        setRepositories(repoStats);
      } catch (err) {
        console.error("Error fetching repository activity:", err);
        setError("Failed to load repository activity. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRepositoryActivity();
  }, [githubService]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...repositories];
    
    // Filter by repository if specified
    if (filters.repositories.length > 0) {
      filtered = filtered.filter(repo => filters.repositories.includes(repo.full_name));
    }
    
    // Filter by time range
    if (filters.timeRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(repo => new Date(repo.lastUpdated) >= startDate);
    }
    
    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        // Repositories with recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(repo => new Date(repo.lastUpdated) >= thirtyDaysAgo);
      } else if (activeTab === 'starred') {
        // Repositories with stars
        filtered = filtered.filter(repo => repo.stars > 0);
      } else if (activeTab === 'forked') {
        // Repositories that are forks
        filtered = filtered.filter(repo => repo.forks > 0);
      }
    }
    
    // Sort repositories
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'commits':
          comparison = a.commits - b.commits;
          break;
        case 'pullRequests':
          comparison = a.pullRequests - b.pullRequests;
          break;
        case 'issues':
          comparison = a.issues - b.issues;
          break;
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'forks':
          comparison = a.forks - b.forks;
          break;
        case 'lastUpdated':
        default:
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredRepositories(filtered);
  }, [repositories, filters, sortBy, sortDirection, activeTab]);

  const handleSortChange = (key: string) => {
    if (key === sortBy) {
      // Toggle direction if same key
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new key and default to descending
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (filteredRepositories.length === 0) {
    return (
      <Card>
        <CardBody className="py-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No repositories found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {repositories.length > 0 
                ? "Try adjusting your filters to see more repositories." 
                : "You don't have any repositories yet."}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs 
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="light"
          size="md"
          aria-label="Repository tabs"
        >
          <Tab key="all" title="All Repositories" />
          <Tab key="active" title="Active" />
          <Tab key="starred" title="Starred" />
          <Tab key="forked" title="Forked" />
        </Tabs>
        
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="flat" 
              endContent={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              }
            >
              Sort by: {sortBy === 'lastUpdated' ? 'Last Updated' : 
                        sortBy === 'pullRequests' ? 'Pull Requests' : 
                        sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              {sortDirection === 'asc' ? ' ↑' : ' ↓'}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Sort options"
            onAction={(key) => handleSortChange(key as string)}
          >
            <DropdownItem key="lastUpdated">Last Updated</DropdownItem>
            <DropdownItem key="name">Name</DropdownItem>
            <DropdownItem key="commits">Commits</DropdownItem>
            <DropdownItem key="pullRequests">Pull Requests</DropdownItem>
            <DropdownItem key="issues">Issues</DropdownItem>
            <DropdownItem key="stars">Stars</DropdownItem>
            <DropdownItem key="forks">Forks</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRepositories.map((repo) => (
          <Card key={repo.full_name} className="bg-white dark:bg-gray-800 shadow-sm">
            <CardBody className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <Link href={repo.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {repo.name}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {repo.full_name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Chip size="sm" color="primary" variant="flat">
                      <span className="font-semibold">{repo.commits}</span> commits
                    </Chip>
                    <Chip size="sm" color="secondary" variant="flat">
                      <span className="font-semibold">{repo.pullRequests}</span> PRs
                    </Chip>
                    <Chip size="sm" color="warning" variant="flat">
                      <span className="font-semibold">{repo.issues}</span> issues
                    </Chip>
                    <Chip size="sm" color="success" variant="flat">
                      <span className="font-semibold">{repo.stars}</span> stars
                    </Chip>
                    <Chip size="sm" color="default" variant="flat">
                      <span className="font-semibold">{repo.forks}</span> forks
                    </Chip>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(repo.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RepositoryActivity;
