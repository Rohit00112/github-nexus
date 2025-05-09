"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useGitHub } from "../../context/GitHubContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TeamContributionChartProps {
  org: string;
  team_slug?: string;
  chartType?: "bar" | "pie";
  metric?: "commits" | "pullRequests" | "issues" | "reviews";
}

interface MemberContribution {
  member: {
    login: string;
    avatar_url: string;
  };
  contributions: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    repositories: number;
  };
}

interface TeamContributions {
  members: MemberContribution[];
  repositories: number;
  totals: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
  };
}

export default function TeamContributionChart({
  org,
  team_slug,
  chartType = "bar",
  metric = "commits",
}: TeamContributionChartProps) {
  const { githubService } = useGitHub();
  const [teamContributions, setTeamContributions] = useState<TeamContributions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamContributions() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        if (team_slug) {
          // Fetch team contributions
          const contributions = await githubService.getTeamContributions(org, team_slug);
          setTeamContributions(contributions);
        } else {
          // For organization-level view, we need to fetch members and their contributions
          const members = await githubService.getOrganizationMembers(org);
          
          // Get contributions for each member
          const memberContributions = await Promise.all(
            members.map(async (member) => {
              const contributions = await githubService.getUserContributions(member.login);
              return {
                member,
                contributions,
              };
            })
          );
          
          // Calculate totals
          const totals = memberContributions.reduce(
            (acc, { contributions }) => {
              acc.commits += contributions.commits;
              acc.pullRequests += contributions.pullRequests;
              acc.issues += contributions.issues;
              acc.reviews += contributions.reviews;
              return acc;
            },
            { commits: 0, pullRequests: 0, issues: 0, reviews: 0 }
          );
          
          setTeamContributions({
            members: memberContributions,
            repositories: 0, // We don't have this information at the org level
            totals,
          });
        }
      } catch (err) {
        console.error("Error fetching team contributions:", err);
        setError("Failed to load team contributions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeamContributions();
  }, [githubService, org, team_slug]);

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

  if (!teamContributions || teamContributions.members.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No contribution data available.
      </div>
    );
  }

  // Sort members by contribution count (descending)
  const sortedMembers = [...teamContributions.members].sort(
    (a, b) => b.contributions[metric] - a.contributions[metric]
  );

  // Limit to top 10 contributors for readability
  const topContributors = sortedMembers.slice(0, 10);

  // Prepare chart data
  const labels = topContributors.map((item) => item.member.login);
  const data = topContributors.map((item) => item.contributions[metric]);

  // Generate colors for each contributor
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137.5) % 360; // Use golden angle approximation for nice distribution
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  const backgroundColor = generateColors(labels.length);

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
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Team Member ${
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
        position: "right" as const,
      },
      title: {
        display: true,
        text: `Team Member ${
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96">
      {chartType === "bar" ? (
        <Bar data={chartData} options={barOptions} />
      ) : (
        <Pie data={chartData} options={pieOptions} />
      )}
    </div>
  );
}
