"use client";

import { FC, useEffect, useRef, useState } from 'react';
import { useGitHub } from '../../context/GitHubContext';
import { gsap } from 'gsap';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ContributionHeatmapProps {
  username?: string;
  year?: number;
  animationDelay?: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
  days: ContributionDay[];
}

const ContributionHeatmap: FC<ContributionHeatmapProps> = ({
  username,
  year = new Date().getFullYear(),
  animationDelay = 0
}) => {
  const { githubService } = useGitHub();
  const [contributions, setContributions] = useState<ContributionWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxContributions, setMaxContributions] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchContributions() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user if username is not provided
        let targetUsername = username;
        if (!targetUsername) {
          const user = await githubService.getCurrentUser();
          targetUsername = user.login;
        }
        
        // Fetch contribution data
        // Note: This is a simplified version. In a real app, you would need to use GitHub's GraphQL API
        // to get the actual contribution calendar data
        const contributionData = await githubService.getUserContributionCalendar(targetUsername, year);
        
        if (contributionData && contributionData.weeks) {
          setContributions(contributionData.weeks);
          
          // Calculate statistics
          let max = 0;
          let total = 0;
          let currentStrk = 0;
          let longestStrk = 0;
          let tempStreak = 0;
          
          // Process all days
          const allDays = contributionData.weeks.flatMap(week => week.days);
          
          // Sort by date
          allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          allDays.forEach(day => {
            // Update max contributions
            if (day.count > max) {
              max = day.count;
            }
            
            // Update total contributions
            total += day.count;
            
            // Update streaks
            if (day.count > 0) {
              tempStreak++;
              if (tempStreak > longestStrk) {
                longestStrk = tempStreak;
              }
            } else {
              tempStreak = 0;
            }
          });
          
          // Calculate current streak (from the end)
          for (let i = allDays.length - 1; i >= 0; i--) {
            if (allDays[i].count > 0) {
              currentStrk++;
            } else {
              break;
            }
          }
          
          setMaxContributions(max);
          setTotalContributions(total);
          setCurrentStreak(currentStrk);
          setLongestStreak(longestStrk);
        }
      } catch (err) {
        console.error("Error fetching contribution data:", err);
        setError("Failed to load contribution data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContributions();
  }, [githubService, username, year]);

  // Apply animation after data is loaded
  useEffect(() => {
    if (!isLoading && contributions.length > 0 && heatmapRef.current) {
      setTimeout(() => {
        const cells = heatmapRef.current!.querySelectorAll('.contribution-cell');
        
        gsap.fromTo(
          cells,
          { 
            scale: 0,
            opacity: 0 
          },
          { 
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: {
              grid: [7, contributions.length],
              from: "start",
              amount: 1
            },
            ease: "power1.out",
            delay: animationDelay / 1000
          }
        );
      }, 100);
    }
  }, [isLoading, contributions, animationDelay]);

  // Get color based on contribution level
  const getLevelColor = (level: 0 | 1 | 2 | 3 | 4, isDarkMode: boolean): string => {
    if (isDarkMode) {
      switch (level) {
        case 0: return 'bg-gray-800';
        case 1: return 'bg-green-900';
        case 2: return 'bg-green-700';
        case 3: return 'bg-green-500';
        case 4: return 'bg-green-300';
      }
    } else {
      switch (level) {
        case 0: return 'bg-gray-100';
        case 1: return 'bg-green-100';
        case 2: return 'bg-green-300';
        case 3: return 'bg-green-500';
        case 4: return 'bg-green-700';
      }
    }
  };

  // Format date for tooltip
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="medium" />
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

  if (contributions.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-400">No contribution data available for {year}.</p>
      </div>
    );
  }

  // Determine if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h3 className="text-lg font-semibold mb-2 md:mb-0">Contribution Activity ({year})</h3>
        
        <div className="flex flex-wrap gap-4">
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total: </span>
            <span className="font-medium">{totalContributions} contributions</span>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current Streak: </span>
            <span className="font-medium">{currentStreak} days</span>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Longest Streak: </span>
            <span className="font-medium">{longestStreak} days</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div ref={heatmapRef} className="flex min-w-max">
          {/* Day labels */}
          <div className="flex flex-col justify-around text-xs text-gray-500 dark:text-gray-400 pr-2 py-1">
            <div>Mon</div>
            <div>Wed</div>
            <div>Fri</div>
          </div>
          
          {/* Contribution grid */}
          <div className="flex">
            {contributions.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.days.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`contribution-cell w-3 h-3 rounded-sm ${getLevelColor(day.level, isDarkMode)}`}
                    title={`${formatDate(day.date)}: ${day.count} contributions`}
                    data-date={day.date}
                    data-count={day.count}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end mt-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="mr-1">Less</span>
        <div className={`w-3 h-3 rounded-sm ${getLevelColor(0, isDarkMode)}`}></div>
        <div className={`w-3 h-3 rounded-sm ml-1 ${getLevelColor(1, isDarkMode)}`}></div>
        <div className={`w-3 h-3 rounded-sm ml-1 ${getLevelColor(2, isDarkMode)}`}></div>
        <div className={`w-3 h-3 rounded-sm ml-1 ${getLevelColor(3, isDarkMode)}`}></div>
        <div className={`w-3 h-3 rounded-sm ml-1 ${getLevelColor(4, isDarkMode)}`}></div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
