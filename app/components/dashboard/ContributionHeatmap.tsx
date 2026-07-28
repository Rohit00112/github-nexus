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
  level: number;
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

        let targetUsername = username;
        if (!targetUsername) {
          const user = await githubService.getCurrentUser();
          targetUsername = user.login;
        }

        const contributionData = await githubService.getUserContributionCalendar(targetUsername, year);

        if (contributionData && contributionData.weeks) {
          setContributions(contributionData.weeks);

          let total = 0;
          let currentStrk = 0;
          let longestStrk = 0;
          let tempStreak = 0;

          const allDays = contributionData.weeks.flatMap(week => week.days);
          allDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          allDays.forEach(day => {
            total += day.count;
            if (day.count > 0) {
              tempStreak++;
              if (tempStreak > longestStrk) longestStrk = tempStreak;
            } else {
              tempStreak = 0;
            }
          });

          for (let i = allDays.length - 1; i >= 0; i--) {
            if (allDays[i].count > 0) currentStrk++;
            else break;
          }

          setTotalContributions(total);
          setCurrentStreak(currentStrk);
          setLongestStreak(longestStrk);
        }
      } catch (err) {
        console.error("Error fetching contribution data:", err);
        setError("Failed to load contribution data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContributions();
  }, [githubService, username, year]);

  useEffect(() => {
    if (!isLoading && contributions.length > 0 && heatmapRef.current) {
      setTimeout(() => {
        const cells = heatmapRef.current!.querySelectorAll('.contribution-cell');
        gsap.fromTo(cells, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: { grid: [7, contributions.length], from: "start", amount: 0.8 }, ease: "power1.out", delay: animationDelay / 1000 });
      }, 100);
    }
  }, [isLoading, contributions, animationDelay]);

  const getLevelColor = (level: number, isDarkMode: boolean): string => {
    if (isDarkMode) {
      return ['bg-zinc-800', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-300'][level];
    }
    return ['bg-zinc-100', 'bg-green-200', 'bg-green-400', 'bg-green-500', 'bg-green-700'][level];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="medium" /></div>;
  if (error) return <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">{error}</div>;
  if (contributions.length === 0) return <div className="bg-muted/50 p-4 rounded-lg text-center"><p className="text-sm text-muted-foreground">No contribution data available for {year}.</p></div>;

  const isDarkMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h3 className="text-base font-semibold mb-2 md:mb-0">Contribution Activity ({year})</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-mono font-medium">{totalContributions}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Streak: </span>
            <span className="font-mono font-medium">{currentStreak}d</span>
          </div>
          <div>
            <span className="text-muted-foreground">Best: </span>
            <span className="font-mono font-medium">{longestStreak}d</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div ref={heatmapRef} className="flex min-w-max">
          <div className="flex flex-col justify-around text-[10px] text-muted-foreground pr-2 py-1">
            <div>Mon</div>
            <div>Wed</div>
            <div>Fri</div>
          </div>
          <div className="flex">
            {contributions.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.days.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`contribution-cell w-2.5 h-2.5 rounded-sm ${getLevelColor(day.level, isDarkMode)}`}
                    title={`${formatDate(day.date)}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-3 text-[10px] text-muted-foreground">
        <span className="mr-1">Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div key={level} className={`w-2.5 h-2.5 rounded-sm ${level > 0 ? 'ml-1' : ''} ${getLevelColor(level, isDarkMode)}`} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
