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
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useGitHub } from "../../context/GitHubContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CommitActivityChartProps {
  owner: string;
  repo: string;
}

interface WeeklyCommit {
  days: number[];
  total: number;
  week: number;
}

export default function CommitActivityChart({ owner, repo }: CommitActivityChartProps) {
  const { githubService } = useGitHub();
  const [commitActivity, setCommitActivity] = useState<WeeklyCommit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommitActivity() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await githubService.getCommitActivity(owner, repo);
        setCommitActivity(data);
      } catch (err) {
        console.error("Error fetching commit activity:", err);
        setError("Failed to load commit activity data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCommitActivity();
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

  if (!commitActivity || commitActivity.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No commit activity data available.
      </div>
    );
  }

  // Format dates for the last 52 weeks
  const labels = commitActivity.map(week => {
    const date = new Date(week.week * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Get commit totals for each week
  const commitTotals = commitActivity.map(week => week.total);

  const data = {
    labels,
    datasets: [
      {
        label: "Commits",
        data: commitTotals,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Weekly Commit Activity",
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any) {
            return `Week of ${tooltipItems[0].label}`;
          },
          label: function(context: any) {
            return `${context.parsed.y} commits`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Commits",
        },
      },
      x: {
        title: {
          display: true,
          text: "Week",
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96">
      <Bar data={data} options={options} />
    </div>
  );
}
