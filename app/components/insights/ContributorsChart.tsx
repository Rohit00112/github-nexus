"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useGitHub } from "../../context/GitHubContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ContributorsChartProps {
  owner: string;
  repo: string;
}

interface Contributor {
  author: {
    login: string;
    avatar_url: string;
  };
  total: number;
  weeks: {
    w: number;
    a: number;
    d: number;
    c: number;
  }[];
}

export default function ContributorsChart({ owner, repo }: ContributorsChartProps) {
  const { githubService } = useGitHub();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContributors() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await githubService.getContributorsStats(owner, repo);
        
        // GitHub sometimes returns 202 and needs time to generate stats
        if (!data || data.length === 0) {
          // Wait a bit and try again
          setTimeout(async () => {
            try {
              const retryData = await githubService.getContributorsStats(owner, repo);
              setContributors(retryData);
            } catch (retryErr) {
              console.error("Error retrying contributors stats:", retryErr);
              setError("Failed to load contributors data. Please try again later.");
            } finally {
              setIsLoading(false);
            }
          }, 3000);
          return;
        }
        
        setContributors(data);
      } catch (err) {
        console.error("Error fetching contributors stats:", err);
        setError("Failed to load contributors data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContributors();
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

  if (!contributors || contributors.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No contributors data available.
      </div>
    );
  }

  // Sort contributors by total commits
  const sortedContributors = [...contributors].sort((a, b) => b.total - a.total);
  
  // Take top 10 contributors, combine the rest as "Others"
  const topContributors = sortedContributors.slice(0, 10);
  const otherContributors = sortedContributors.slice(10);
  const otherContributorsTotal = otherContributors.reduce((sum, contributor) => sum + contributor.total, 0);
  
  // Prepare data for the pie chart
  const labels = topContributors.map(contributor => contributor.author.login);
  if (otherContributors.length > 0) {
    labels.push("Others");
  }
  
  const commitCounts = topContributors.map(contributor => contributor.total);
  if (otherContributors.length > 0) {
    commitCounts.push(otherContributorsTotal);
  }
  
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
  
  const data = {
    labels,
    datasets: [
      {
        data: commitCounts,
        backgroundColor,
        borderColor: backgroundColor.map(color => color.replace("0.5", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Contribution Distribution",
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} commits (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-96">
      <Pie data={data} options={options} />
    </div>
  );
}
