"use client";

import { FC, useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useGitHub } from '../../context/GitHubContext';
import { animateChartData } from '../../utils/animations';
import LoadingSpinner from '../ui/LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ContributionChartProps {
  chartType?: 'bar' | 'pie';
  metric?: 'commits' | 'pullRequests' | 'issues' | 'reviews';
  limit?: number;
  animationDelay?: number;
}

interface ContributionData {
  user: {
    login: string;
    avatar_url: string;
  };
  contributions: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
  };
}

const ContributionChart: FC<ContributionChartProps> = ({
  chartType = 'bar',
  metric = 'commits',
  limit = 10,
  animationDelay = 0
}) => {
  const { githubService } = useGitHub();
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

  const fetchContributions = async () => {
    if (!githubService) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's repositories
      const user = await githubService.getCurrentUser();
      const repos = await githubService.getUserRepositories(user.login, 1, 10);

      // Create a map to store contribution data
      const contributionsMap = new Map<string, ContributionData>();

      // Add current user to the map with default values
      contributionsMap.set(user.login, {
        user: {
          login: user.login,
          avatar_url: user.avatar_url
        },
        contributions: {
          commits: 0,
          pullRequests: 0,
          issues: 0,
          reviews: 0
        }
      });

      // Add some sample data for demonstration if no repos are found
      if (repos.length === 0) {
        // Add sample contributors
        const sampleContributors = [
          { login: user.login, avatar_url: user.avatar_url, commits: 42, prs: 12, issues: 8, reviews: 15 },
          { login: 'octocat', avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4', commits: 28, prs: 8, issues: 5, reviews: 10 },
          { login: 'github-actions', avatar_url: 'https://avatars.githubusercontent.com/u/44036562?v=4', commits: 15, prs: 0, issues: 0, reviews: 0 },
          { login: 'dependabot', avatar_url: 'https://avatars.githubusercontent.com/u/27347476?v=4', commits: 8, prs: 18, issues: 2, reviews: 0 }
        ];

        sampleContributors.forEach(contributor => {
          contributionsMap.set(contributor.login, {
            user: {
              login: contributor.login,
              avatar_url: contributor.avatar_url
            },
            contributions: {
              commits: contributor.commits,
              pullRequests: contributor.prs,
              issues: contributor.issues,
              reviews: contributor.reviews
            }
          });
        });
      } else {
        // Process real repository data
        await Promise.all(
          repos.map(async (repo: any) => {
            try {
              // Get repository contributors
              const repoContributors = await githubService.getRepositoryContributors(repo.owner.login, repo.name);

              repoContributors.forEach((contributor: any) => {
                const login = contributor.login;

                if (!contributionsMap.has(login)) {
                  contributionsMap.set(login, {
                    user: {
                      login,
                      avatar_url: contributor.avatar_url
                    },
                    contributions: {
                      commits: 0,
                      pullRequests: 0,
                      issues: 0,
                      reviews: 0
                    }
                  });
                }

                const userData = contributionsMap.get(login)!;
                userData.contributions.commits += contributor.contributions;
                contributionsMap.set(login, userData);
              });

              // Get pull requests
              const pulls = await githubService.getPullRequests(repo.owner.login, repo.name, 1, 100);

              pulls.forEach((pr: any) => {
                if (!pr.user) return;
                const login = pr.user.login;

                if (!contributionsMap.has(login)) {
                  contributionsMap.set(login, {
                    user: {
                      login,
                      avatar_url: pr.user.avatar_url
                    },
                    contributions: {
                      commits: 0,
                      pullRequests: 0,
                      issues: 0,
                      reviews: 0
                    }
                  });
                }

                const userData = contributionsMap.get(login)!;
                userData.contributions.pullRequests += 1;
                contributionsMap.set(login, userData);
              });

              // Get issues
              const issues = await githubService.getIssues(repo.owner.login, repo.name, 1, 100);

              issues.forEach((issue: any) => {
                // Skip pull requests (they are also returned as issues)
                if (issue.pull_request || !issue.user) return;

                const login = issue.user.login;

                if (!contributionsMap.has(login)) {
                  contributionsMap.set(login, {
                    user: {
                      login,
                      avatar_url: issue.user.avatar_url
                    },
                    contributions: {
                      commits: 0,
                      pullRequests: 0,
                      issues: 0,
                      reviews: 0
                    }
                  });
                }

                const userData = contributionsMap.get(login)!;
                userData.contributions.issues += 1;
                contributionsMap.set(login, userData);
              });
            } catch (err) {
              console.error(`Error fetching data for ${repo.full_name}:`, err);
            }
          })
        );
      }

      // Convert map to array and sort by selected metric
      const contributionsArray = Array.from(contributionsMap.values())
        .sort((a, b) => b.contributions[metric] - a.contributions[metric])
        .slice(0, limit);

      setContributions(contributionsArray);
    } catch (err) {
      console.error("Error fetching contributions:", err);
      setError("Failed to load contribution data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [githubService, metric, limit]);

  // Animate chart when data is loaded
  useEffect(() => {
    if (!isLoading && contributions.length > 0 && chartRef.current) {
      setTimeout(() => {
        animateChartData(chartRef.current);
      }, animationDelay);
    }
  }, [isLoading, contributions, animationDelay]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md flex items-center justify-between">
          <div>{error}</div>
          <button
            onClick={() => fetchContributions()}
            className="px-3 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md text-sm hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>

        {/* Show sample data even when there's an error */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Here's what the contribution chart would look like with sample data:</p>

          <div className="flex flex-col space-y-4 max-w-md mx-auto">
            {[
              { name: 'You', count: 42, color: 'bg-blue-500' },
              { name: 'octocat', count: 28, color: 'bg-purple-500' },
              { name: 'github-actions', count: 15, color: 'bg-green-500' },
              { name: 'dependabot', count: 8, color: 'bg-yellow-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-medium">{item.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {item.count} commits
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${item.color}`}
                      style={{ width: `${Math.min(100, (item.count / 42) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mb-4">No contribution data available</p>
          <button
            onClick={() => fetchContributions()}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const labels = contributions.map(item => item.user.login);
  const data = contributions.map(item => item.contributions[metric]);

  // If no data, add a placeholder
  if (labels.length === 0) {
    labels.push('No data');
    data.push(0);
  }

  // Generate colors for each contributor
  const generateColors = (count: number) => {
    const colors = [];
    const baseHues = [210, 330, 120, 25, 270, 180, 60, 0, 310, 160]; // Predefined hues for better color distribution

    for (let i = 0; i < count; i++) {
      // Use predefined hues for first 10 items, then use golden angle for the rest
      const hue = i < baseHues.length
        ? baseHues[i]
        : (i * 137.5) % 360; // Golden angle approximation

      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  const backgroundColor = generateColors(Math.max(1, labels.length));

  const chartData = {
    labels,
    datasets: [
      {
        label: metric === "commits"
          ? "Commits"
          : metric === "pullRequests"
          ? "Pull Requests"
          : metric === "issues"
          ? "Issues"
          : "Reviews",
        data,
        backgroundColor,
        borderColor: backgroundColor.map(color => color.replace("60%", "70%")),
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `User ${
          metric === "commits"
            ? "Commits"
            : metric === "pullRequests"
            ? "Pull Requests"
            : metric === "issues"
            ? "Issues"
            : "Reviews"
        }`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: `User ${
          metric === "commits"
            ? "Commits"
            : metric === "pullRequests"
            ? "Pull Requests"
            : metric === "issues"
            ? "Issues"
            : "Reviews"
        } Distribution`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* GitHub-style contribution stats */}
      <div className="mb-4">
        <div className="flex flex-col space-y-4">
          {contributions.map((contributor, index) => (
            <div key={contributor.user.login} className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <img
                  src={contributor.user.avatar_url || `https://avatars.githubusercontent.com/u/0?v=4`}
                  alt={contributor.user.login}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{contributor.user.login}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {contributor.contributions[metric]} {metric === "commits" ? "commits" :
                      metric === "pullRequests" ? "PRs" :
                      metric === "issues" ? "issues" : "reviews"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      index % 5 === 0 ? "bg-blue-500" :
                      index % 5 === 1 ? "bg-purple-500" :
                      index % 5 === 2 ? "bg-green-500" :
                      index % 5 === 3 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (contributor.contributions[metric] /
                        (contributions[0]?.contributions[metric] || 1)) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {contributions.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No contribution data available</p>
              <button
                onClick={() => fetchContributions()}
                className="mt-3 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart visualization */}
      {contributions.length > 0 && (
        <div className="mt-6">
          <div className="h-[250px] w-full flex items-center justify-center">
            {chartType === 'bar' ? (
              <Bar
                ref={chartRef}
                data={chartData}
                options={{
                  ...barOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...barOptions.plugins,
                    legend: {
                      display: false
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      ...barOptions.scales.y,
                      ticks: {
                        color: 'rgb(156, 163, 175)'
                      },
                      grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: 'rgb(156, 163, 175)'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            ) : (
              <Pie
                ref={chartRef}
                data={chartData}
                options={{
                  ...pieOptions,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    ...pieOptions.plugins,
                    legend: {
                      display: false
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            )}
          </div>
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {metric === "commits"
              ? "User Commits Distribution"
              : metric === "pullRequests"
              ? "User Pull Requests Distribution"
              : metric === "issues"
              ? "User Issues Distribution"
              : "User Reviews Distribution"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionChart;
