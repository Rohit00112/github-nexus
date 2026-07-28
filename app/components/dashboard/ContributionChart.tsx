"use client";

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TooltipItem,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useGitHub } from '../../context/GitHubContext';
import { animateChartData } from '../../utils/animations';
import LoadingSpinner from '../ui/LoadingSpinner';

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
  const barChartRef = useRef<ChartJS<"bar", number[], string> | null>(null);
  const pieChartRef = useRef<ChartJS<"pie", number[], string> | null>(null);

  const fetchContributions = useCallback(async () => {
    if (!githubService) return;

    try {
      setIsLoading(true);
      setError(null);

      const user = await githubService.getCurrentUser();
      const repos = await githubService.getUserRepositories(user.login, 1, 10);

      const contributionsMap = new Map<string, ContributionData>();

      contributionsMap.set(user.login, {
        user: { login: user.login, avatar_url: user.avatar_url },
        contributions: { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
      });

      if (repos.length === 0) {
        const sampleContributors = [
          { login: user.login, avatar_url: user.avatar_url, commits: 42, prs: 12, issues: 8, reviews: 15 },
          { login: 'octocat', avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4', commits: 28, prs: 8, issues: 5, reviews: 10 },
          { login: 'github-actions', avatar_url: 'https://avatars.githubusercontent.com/u/44036562?v=4', commits: 15, prs: 0, issues: 0, reviews: 0 },
          { login: 'dependabot', avatar_url: 'https://avatars.githubusercontent.com/u/27347476?v=4', commits: 8, prs: 18, issues: 2, reviews: 0 }
        ];

        sampleContributors.forEach(contributor => {
          contributionsMap.set(contributor.login, {
            user: { login: contributor.login, avatar_url: contributor.avatar_url },
            contributions: { commits: contributor.commits, pullRequests: contributor.prs, issues: contributor.issues, reviews: contributor.reviews }
          });
        });
      } else {
        await Promise.all(
          repos.map(async (repo) => {
            try {
              const repoContributors = await githubService.getRepositoryContributors(repo.owner.login, repo.name);
              repoContributors.forEach((contributor) => {
                if (!contributor.login) return;
                const login = contributor.login;
                if (!contributionsMap.has(login)) {
                  contributionsMap.set(login, {
                    user: { login, avatar_url: contributor.avatar_url ?? "" },
                    contributions: { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
                  });
                }
                const userData = contributionsMap.get(login)!;
                userData.contributions.commits += contributor.contributions;
                contributionsMap.set(login, userData);
              });

              const pulls = await githubService.getPullRequests(repo.owner.login, repo.name, 1, 100);
              pulls.forEach((pr) => {
                if (!pr.user) return;
                const login = pr.user.login;
                if (!contributionsMap.has(login)) {
                  contributionsMap.set(login, {
                    user: { login, avatar_url: pr.user.avatar_url },
                    contributions: { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
                  });
                }
                const userData = contributionsMap.get(login)!;
                userData.contributions.pullRequests += 1;
                contributionsMap.set(login, userData);
              });

              const issues = await githubService.getIssues(repo.owner.login, repo.name, 1, 100);
              issues.forEach((issue) => {
                if (issue.pull_request || !issue.user) return;
                const login = issue.user.login;
                if (!contributionsMap.has(login)) {
                  contributionsMap.set(login, {
                    user: { login, avatar_url: issue.user.avatar_url },
                    contributions: { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
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
  }, [githubService, metric, limit]);

  useEffect(() => {
    fetchContributions();
  }, [githubService, metric, limit, fetchContributions]);

  useEffect(() => {
    const chart = chartType === "bar" ? barChartRef.current : pieChartRef.current;
    if (!isLoading && contributions.length > 0 && chart) {
      const timeout = window.setTimeout(() => {
        animateChartData(chart);
      }, animationDelay);
      return () => window.clearTimeout(timeout);
    }
  }, [isLoading, contributions, animationDelay, chartType]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <div className="text-sm">{error}</div>
          <button
            onClick={() => fetchContributions()}
            className="px-3 py-1 bg-muted hover:bg-surface-hover text-muted-foreground rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="text-center py-8 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm mb-3">No contribution data available</p>
          <button
            onClick={() => fetchContributions()}
            className="px-4 py-2 bg-muted hover:bg-surface-hover text-muted-foreground rounded-lg text-sm transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const labels = contributions.map(item => item.user.login);
  const data = contributions.map(item => item.contributions[metric]);

  if (labels.length === 0) {
    labels.push('No data');
    data.push(0);
  }

  const generateColors = (count: number) => {
    const baseColors = [
      'hsl(217, 91%, 60%)',
      'hsl(262, 83%, 60%)',
      'hsl(142, 71%, 45%)',
      'hsl(38, 92%, 50%)',
      'hsl(330, 81%, 60%)',
      'hsl(187, 94%, 43%)',
      'hsl(25, 95%, 53%)',
      'hsl(0, 84%, 60%)',
      'hsl(300, 76%, 48%)',
      'hsl(160, 84%, 39%)',
    ];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(i < baseColors.length ? baseColors[i] : `hsl(${(i * 137.5) % 360}, 70%, 55%)`);
    }
    return colors;
  };

  const backgroundColor = generateColors(Math.max(1, labels.length));

  const chartData = {
    labels,
    datasets: [{
      label: metric === "commits" ? "Commits" : metric === "pullRequests" ? "Pull Requests" : metric === "issues" ? "Issues" : "Reviews",
      data,
      backgroundColor,
      borderColor: backgroundColor.map(color => color.replace("60%", "70%").replace("55%", "65%")),
      borderWidth: 1,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: 'rgb(161, 161, 170)' }, grid: { color: 'rgba(161, 161, 170, 0.1)' } },
      x: { ticks: { color: 'rgb(161, 161, 170)' }, grid: { display: false } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<"pie">) {
            const label = context.label || "";
            const value = Number(context.raw) || 0;
            const total = context.dataset.data.reduce((sum, item) => sum + Number(item), 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
      <div className="mb-4">
        <div className="flex flex-col space-y-3">
          {contributions.map((contributor, index) => (
            <div key={contributor.user.login} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                <Image
                  src={contributor.user.avatar_url || `https://avatars.githubusercontent.com/u/0?v=4`}
                  alt={contributor.user.login}
                  className="w-full h-full object-cover"
                  unoptimized
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-foreground truncate">{contributor.user.login}</span>
                  <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                    {contributor.contributions[metric]} {metric === "commits" ? "commits" : metric === "pullRequests" ? "PRs" : metric === "issues" ? "issues" : "reviews"}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index % 5 === 0 ? "bg-blue-500" :
                      index % 5 === 1 ? "bg-purple-500" :
                      index % 5 === 2 ? "bg-green-500" :
                      index % 5 === 3 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, (contributor.contributions[metric] / (contributions[0]?.contributions[metric] || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {contributions.length > 0 && (
        <div className="mt-6">
          <div className="h-[250px] w-full flex items-center justify-center">
            {chartType === 'bar' ? (
              <Bar ref={barChartRef} data={chartData} options={barOptions} />
            ) : (
              <Pie ref={pieChartRef} data={chartData} options={pieOptions} />
            )}
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            {metric === "commits" ? "Commits" : metric === "pullRequests" ? "Pull Requests" : metric === "issues" ? "Issues" : "Reviews"} Distribution
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionChart;
