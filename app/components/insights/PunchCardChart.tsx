"use client";

import { useEffect, useState, useRef } from "react";
import { useGitHub } from "../../context/GitHubContext";

interface PunchCardChartProps {
  owner: string;
  repo: string;
}

type PunchCardData = [number, number, number][];

export default function PunchCardChart({ owner, repo }: PunchCardChartProps) {
  const { githubService } = useGitHub();
  const [punchCard, setPunchCard] = useState<PunchCardData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchPunchCard() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await githubService.getPunchCard(owner, repo);
        setPunchCard(data);
      } catch (err) {
        console.error("Error fetching punch card data:", err);
        setError("Failed to load commit time distribution data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPunchCard();
  }, [githubService, owner, repo]);

  useEffect(() => {
    if (!punchCard || punchCard.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const cellWidth = width / 24; // 24 hours
    const cellHeight = height / 7; // 7 days
    const maxRadius = Math.min(cellWidth, cellHeight) * 0.4;
    
    // Find max commits to normalize circle sizes
    const maxCommits = Math.max(...punchCard.map(item => item[2]));
    
    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines (days)
    for (let i = 0; i <= 7; i++) {
      const y = i * cellHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines (hours)
    for (let i = 0; i <= 24; i++) {
      const x = i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw day labels
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    for (let i = 0; i < 7; i++) {
      const y = i * cellHeight + cellHeight / 2;
      ctx.fillText(days[i], cellWidth - 5, y);
    }
    
    // Draw hour labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    for (let i = 0; i < 24; i++) {
      const x = (i + 1) * cellWidth + cellWidth / 2;
      ctx.fillText(i.toString(), x, cellHeight - 15);
    }
    
    // Draw circles for commit counts
    punchCard.forEach(([day, hour, count]) => {
      if (count === 0) return;
      
      const x = (hour + 1) * cellWidth + cellWidth / 2;
      const y = day * cellHeight + cellHeight / 2;
      const radius = (count / maxCommits) * maxRadius;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
      ctx.fill();
      
      // Add count text for larger circles
      if (radius > 10) {
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "10px Arial";
        ctx.fillText(count.toString(), x, y);
      }
    });
    
  }, [punchCard]);

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

  if (!punchCard || punchCard.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No commit time distribution data available.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Commit Time Distribution</h3>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Circle size represents the number of commits made during that hour and day of the week.
      </div>
      <div className="h-80 w-full">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full"></canvas>
      </div>
    </div>
  );
}
