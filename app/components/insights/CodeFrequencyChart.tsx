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
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useGitHub } from "../../context/GitHubContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CodeFrequencyChartProps {
  owner: string;
  repo: string;
}

type CodeFrequencyData = [number, number, number][];

export default function CodeFrequencyChart({ owner, repo }: CodeFrequencyChartProps) {
  const { githubService } = useGitHub();
  const [codeFrequency, setCodeFrequency] = useState<CodeFrequencyData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCodeFrequency() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await githubService.getCodeFrequency(owner, repo);
        setCodeFrequency(data);
      } catch (err) {
        console.error("Error fetching code frequency:", err);
        setError("Failed to load code frequency data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCodeFrequency();
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

  if (!codeFrequency || codeFrequency.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No code frequency data available.
      </div>
    );
  }

  // Format dates for each week
  const labels = codeFrequency.map(week => {
    const date = new Date(week[0] * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Get additions and deletions for each week
  const additions = codeFrequency.map(week => week[1]);
  const deletions = codeFrequency.map(week => -week[2]); // Negate to show as negative values

  const data = {
    labels,
    datasets: [
      {
        label: "Additions",
        data: additions,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        fill: true,
      },
      {
        label: "Deletions",
        data: deletions,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        fill: true,
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
        text: "Code Frequency (Additions & Deletions)",
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems: any) {
            return `Week of ${tooltipItems[0].label}`;
          },
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            if (datasetLabel === "Deletions") {
              return `${datasetLabel}: ${Math.abs(value)} lines removed`;
            }
            return `${datasetLabel}: ${value} lines added`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Lines of Code",
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
      <Line data={data} options={options} />
    </div>
  );
}
