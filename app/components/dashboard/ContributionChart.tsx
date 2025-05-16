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

      // Add current user to the map with default values
      const contributionsMap = new Map<string, ContributionData>();
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

      // For each repository, get contributors
      await Promise.all(
        repos.map(async (repo: any) => {
          try {
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
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md flex items-center justify-between">
        <div>{error}</div>
        <button
          onClick={() => fetchContributions()}
          className="px-3 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md text-sm hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-400">No contribution data available.</p>
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
      <div className="h-[300px] w-full flex items-center justify-center">
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
                  ...barOptions.plugins.legend,
                  labels: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                      size: 12
                    }
                  }
                },
                title: {
                  ...barOptions.plugins.title,
                  color: 'rgb(156, 163, 175)',
                  font: {
                    size: 14,
                    weight: 'bold'
                  }
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
                    color: 'rgba(156, 163, 175, 0.1)'
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
                  ...pieOptions.plugins.legend,
                  position: 'bottom',
                  labels: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                      size: 12
                    },
                    padding: 20,
                    usePointStyle: true,
                    boxWidth: 8
                  }
                },
                title: {
                  ...pieOptions.plugins.title,
                  color: 'rgb(156, 163, 175)',
                  font: {
                    size: 14,
                    weight: 'bold'
                  }
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
  );
};

export default ContributionChart;
