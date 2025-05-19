"use client";

import { FC, useState, useEffect } from 'react';
import { useGitHub } from '../../context/GitHubContext';
import { Card, CardBody, CardHeader, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Progress } from '@nextui-org/react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { ActivityFilters } from './ActivityFilters';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ContributionsAnalysisProps {
  filters: ActivityFilters;
}

interface ContributionData {
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  repositories: number;
  contributionsByRepo: {
    [key: string]: {
      commits: number;
      pullRequests: number;
      issues: number;
      reviews: number;
    };
  };
  contributionsByMonth: {
    [key: string]: {
      commits: number;
      pullRequests: number;
      issues: number;
      reviews: number;
    };
  };
  totalContributions: number;
}

const ContributionsAnalysis: FC<ContributionsAnalysisProps> = ({ filters }) => {
  const { githubService } = useGitHub();
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'doughnut' | 'bar'>('doughnut');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('year');

  // Fetch contribution data
  useEffect(() => {
    async function fetchContributionData() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user data
        const user = await githubService.getCurrentUser();
        
        // Get user's repositories
        const repos = await githubService.getUserRepositories(user.login, 1, 100);
        
        // Initialize contribution data
        const data: ContributionData = {
          commits: 0,
          pullRequests: 0,
          issues: 0,
          reviews: 0,
          repositories: repos.length,
          contributionsByRepo: {},
          contributionsByMonth: {},
          totalContributions: 0
        };
        
        // Initialize months for the past year
        const now = new Date();
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          data.contributionsByMonth[monthKey] = {
            commits: 0,
            pullRequests: 0,
            issues: 0,
            reviews: 0
          };
        }
        
        // Apply repository filters
        let filteredRepos = repos;
        if (filters.repositories.length > 0) {
          filteredRepos = repos.filter(repo => filters.repositories.includes(repo.full_name));
        }
        
        // Get contribution data for each repository
        for (const repo of filteredRepos.slice(0, 10)) { // Limit to 10 repos to avoid rate limiting
          try {
            // Initialize repo data
            data.contributionsByRepo[repo.full_name] = {
              commits: 0,
              pullRequests: 0,
              issues: 0,
              reviews: 0
            };
            
            // Get commits
            const commits = await githubService.octokit.rest.repos.listCommits({
              owner: repo.owner.login,
              repo: repo.name,
              author: user.login,
              per_page: 100
            });
            
            data.contributionsByRepo[repo.full_name].commits = commits.data.length;
            data.commits += commits.data.length;
            
            // Update monthly data
            for (const commit of commits.data) {
              const date = new Date(commit.commit.author?.date || commit.commit.committer?.date || '');
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              if (data.contributionsByMonth[monthKey]) {
                data.contributionsByMonth[monthKey].commits++;
              }
            }
            
            // Get pull requests
            const pullRequests = await githubService.octokit.rest.pulls.list({
              owner: repo.owner.login,
              repo: repo.name,
              state: 'all',
              per_page: 100
            });
            
            const userPRs = pullRequests.data.filter(pr => pr.user?.login === user.login);
            data.contributionsByRepo[repo.full_name].pullRequests = userPRs.length;
            data.pullRequests += userPRs.length;
            
            // Update monthly data
            for (const pr of userPRs) {
              const date = new Date(pr.created_at);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              if (data.contributionsByMonth[monthKey]) {
                data.contributionsByMonth[monthKey].pullRequests++;
              }
            }
            
            // Get issues
            const issues = await githubService.octokit.rest.issues.listForRepo({
              owner: repo.owner.login,
              repo: repo.name,
              creator: user.login,
              state: 'all',
              per_page: 100
            });
            
            // Filter out pull requests (GitHub API returns PRs as issues)
            const actualIssues = issues.data.filter(issue => !issue.pull_request);
            data.contributionsByRepo[repo.full_name].issues = actualIssues.length;
            data.issues += actualIssues.length;
            
            // Update monthly data
            for (const issue of actualIssues) {
              const date = new Date(issue.created_at);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              if (data.contributionsByMonth[monthKey]) {
                data.contributionsByMonth[monthKey].issues++;
              }
            }
            
            // Get reviews (approximation)
            data.contributionsByRepo[repo.full_name].reviews = Math.floor(userPRs.length * 0.5); // Rough estimate
            data.reviews += data.contributionsByRepo[repo.full_name].reviews;
          } catch (err) {
            console.error(`Error fetching contributions for ${repo.full_name}:`, err);
          }
        }
        
        // Calculate total contributions
        data.totalContributions = data.commits + data.pullRequests + data.issues + data.reviews;
        
        setContributionData(data);
      } catch (err) {
        console.error("Error fetching contribution data:", err);
        setError("Failed to load contribution data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContributionData();
  }, [githubService, filters]);

  // Prepare chart data
  const getContributionTypeChartData = () => {
    if (!contributionData) return null;
    
    const data = {
      labels: ['Commits', 'Pull Requests', 'Issues', 'Reviews'],
      datasets: [
        {
          data: [
            contributionData.commits,
            contributionData.pullRequests,
            contributionData.issues,
            contributionData.reviews
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return data;
  };

  const getContributionsByRepoChartData = () => {
    if (!contributionData) return null;
    
    // Get top 5 repositories by total contributions
    const repoEntries = Object.entries(contributionData.contributionsByRepo);
    const topRepos = repoEntries
      .map(([name, counts]) => ({
        name,
        total: counts.commits + counts.pullRequests + counts.issues + counts.reviews
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    const data = {
      labels: topRepos.map(repo => repo.name.split('/')[1]), // Just show repo name, not owner
      datasets: [
        {
          label: 'Commits',
          data: topRepos.map(repo => contributionData.contributionsByRepo[repo.name].commits),
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        },
        {
          label: 'Pull Requests',
          data: topRepos.map(repo => contributionData.contributionsByRepo[repo.name].pullRequests),
          backgroundColor: 'rgba(153, 102, 255, 0.7)'
        },
        {
          label: 'Issues',
          data: topRepos.map(repo => contributionData.contributionsByRepo[repo.name].issues),
          backgroundColor: 'rgba(255, 206, 86, 0.7)'
        },
        {
          label: 'Reviews',
          data: topRepos.map(repo => contributionData.contributionsByRepo[repo.name].reviews),
          backgroundColor: 'rgba(75, 192, 192, 0.7)'
        }
      ]
    };
    
    return data;
  };

  const getContributionsByMonthChartData = () => {
    if (!contributionData) return null;
    
    // Filter months based on time range
    const now = new Date();
    const monthsToShow = timeRange === 'month' ? 1 : timeRange === 'quarter' ? 3 : 12;
    
    // Get the months in chronological order
    const monthEntries = Object.entries(contributionData.contributionsByMonth)
      .filter(([monthKey]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1);
        const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
        return monthsAgo < monthsToShow;
      })
      .sort(([a], [b]) => a.localeCompare(b));
    
    const monthLabels = monthEntries.map(([monthKey]) => {
      const [year, month] = monthKey.split('-').map(Number);
      return new Date(year, month - 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    });
    
    const data = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Commits',
          data: monthEntries.map(([monthKey]) => contributionData.contributionsByMonth[monthKey].commits),
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        },
        {
          label: 'Pull Requests',
          data: monthEntries.map(([monthKey]) => contributionData.contributionsByMonth[monthKey].pullRequests),
          backgroundColor: 'rgba(153, 102, 255, 0.7)'
        },
        {
          label: 'Issues',
          data: monthEntries.map(([monthKey]) => contributionData.contributionsByMonth[monthKey].issues),
          backgroundColor: 'rgba(255, 206, 86, 0.7)'
        },
        {
          label: 'Reviews',
          data: monthEntries.map(([monthKey]) => contributionData.contributionsByMonth[monthKey].reviews),
          backgroundColor: 'rgba(75, 192, 192, 0.7)'
        }
      ]
    };
    
    return data;
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

  if (!contributionData) {
    return (
      <Card>
        <CardBody className="py-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No contribution data available</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We couldn't find any contribution data for your account.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contribution Summary */}
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Contribution Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Contribution Types</span>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button size="sm" variant="light">
                        {chartType === 'doughnut' ? 'Doughnut' : chartType === 'pie' ? 'Pie' : 'Bar'}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      aria-label="Chart Type"
                      onAction={(key) => setChartType(key as 'pie' | 'doughnut' | 'bar')}
                    >
                      <DropdownItem key="doughnut">Doughnut</DropdownItem>
                      <DropdownItem key="pie">Pie</DropdownItem>
                      <DropdownItem key="bar">Bar</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {contributionData.totalContributions}
                </span>
              </div>
              <div className="h-64 flex items-center justify-center">
                {chartType === 'pie' && <Pie data={getContributionTypeChartData() as any} />}
                {chartType === 'doughnut' && <Doughnut data={getContributionTypeChartData() as any} />}
                {chartType === 'bar' && <Bar data={getContributionTypeChartData() as any} />}
              </div>
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Commits</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {contributionData.commits} ({Math.round(contributionData.commits / contributionData.totalContributions * 100)}%)
                    </span>
                  </div>
                  <Progress 
                    value={contributionData.commits} 
                    maxValue={contributionData.totalContributions} 
                    color="primary"
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Pull Requests</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {contributionData.pullRequests} ({Math.round(contributionData.pullRequests / contributionData.totalContributions * 100)}%)
                    </span>
                  </div>
                  <Progress 
                    value={contributionData.pullRequests} 
                    maxValue={contributionData.totalContributions} 
                    color="secondary"
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Issues</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {contributionData.issues} ({Math.round(contributionData.issues / contributionData.totalContributions * 100)}%)
                    </span>
                  </div>
                  <Progress 
                    value={contributionData.issues} 
                    maxValue={contributionData.totalContributions} 
                    color="warning"
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Reviews</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {contributionData.reviews} ({Math.round(contributionData.reviews / contributionData.totalContributions * 100)}%)
                    </span>
                  </div>
                  <Progress 
                    value={contributionData.reviews} 
                    maxValue={contributionData.totalContributions} 
                    color="success"
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Contributions by Repository */}
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Top Repositories</h3>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <Bar 
              data={getContributionsByRepoChartData() as any}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true
                  }
                }
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Contributions by Month */}
      <Card>
        <CardHeader className="pb-0 flex justify-between">
          <h3 className="text-lg font-semibold">Contribution Timeline</h3>
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="flat">
                {timeRange === 'month' ? 'Last Month' : timeRange === 'quarter' ? 'Last Quarter' : 'Last Year'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Time Range"
              onAction={(key) => setTimeRange(key as 'month' | 'quarter' | 'year')}
            >
              <DropdownItem key="month">Last Month</DropdownItem>
              <DropdownItem key="quarter">Last Quarter</DropdownItem>
              <DropdownItem key="year">Last Year</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>
        <CardBody>
          <div className="h-80">
            <Bar 
              data={getContributionsByMonthChartData() as any}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true
                  }
                }
              }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ContributionsAnalysis;
