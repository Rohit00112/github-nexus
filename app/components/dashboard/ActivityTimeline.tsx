"use client";

import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import { animateTimeline } from '../../utils/animations';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { GitHubUserEvent } from '../../services/github/githubService';

interface ActivityTimelineProps {
  limit?: number;
  animationDelay?: number;
}

interface ActivityEvent {
  id: string;
  type: 'commit' | 'issue' | 'pull_request' | 'release' | 'fork' | 'star';
  title: string;
  description: string;
  timestamp: string;
  url: string;
  user: { login: string; avatar_url: string };
  repo: { name: string; url: string };
}

const ActivityTimeline: FC<ActivityTimelineProps> = ({ limit = 5, animationDelay = 0 }) => {
  const { githubService } = useGitHub();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchActivities() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);

        const user = await githubService.getCurrentUser();
        const events = await githubService.getUserEvents(user.login);

        const transformedActivities = events
          .filter((event: GitHubUserEvent) => ['PushEvent', 'IssuesEvent', 'PullRequestEvent', 'ReleaseEvent', 'ForkEvent', 'WatchEvent'].includes(event.type))
          .map((event: GitHubUserEvent): ActivityEvent => {
            let type: ActivityEvent['type'] = 'commit';
            let title = '';
            let description = '';
            let url = '';

            switch (event.type) {
              case 'PushEvent':
                type = 'commit';
                const commitCount = event.payload.commits?.length || 0;
                title = `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`;
                description = event.payload.commits?.[0]?.message || 'No commit message';
                url = `https://github.com/${event.repo.name}/commit/${event.payload.commits?.[0]?.sha}`;
                break;
              case 'IssuesEvent':
                type = 'issue';
                title = `${event.payload.action} issue: ${event.payload.issue?.title ?? ""}`;
                description = event.payload.issue?.body?.substring(0, 100) || 'No description';
                url = event.payload.issue?.html_url ?? `https://github.com/${event.repo.name}`;
                break;
              case 'PullRequestEvent':
                type = 'pull_request';
                title = `${event.payload.action} pull request: ${event.payload.pull_request?.title ?? ""}`;
                description = event.payload.pull_request?.body?.substring(0, 100) || 'No description';
                url = event.payload.pull_request?.html_url ?? `https://github.com/${event.repo.name}`;
                break;
              case 'ReleaseEvent':
                type = 'release';
                title = `Released ${event.payload.release?.name || event.payload.release?.tag_name || ""}`;
                description = event.payload.release?.body?.substring(0, 100) || 'No description';
                url = event.payload.release?.html_url ?? `https://github.com/${event.repo.name}/releases`;
                break;
              case 'ForkEvent':
                type = 'fork';
                title = `Forked ${event.repo.name}`;
                description = `Created a new fork of ${event.repo.name}`;
                url = `https://github.com/${event.payload.forkee?.full_name ?? event.repo.name}`;
                break;
              case 'WatchEvent':
                type = 'star';
                title = `Starred ${event.repo.name}`;
                description = `Added ${event.repo.name} to starred repositories`;
                url = `https://github.com/${event.repo.name}`;
                break;
            }

            return { id: event.id, type, title, description, timestamp: event.created_at, url, user: { login: event.actor.login, avatar_url: event.actor.avatar_url }, repo: { name: event.repo.name, url: `https://github.com/${event.repo.name}` } };
          })
          .slice(0, limit);

        setActivities(transformedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load recent activities.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, [githubService, limit]);

  useEffect(() => {
    if (!isLoading && activities.length > 0 && timelineRef.current) {
      setTimeout(() => {
        animateTimeline(timelineRef.current!, '.timeline-item');
      }, animationDelay);
    }
  }, [isLoading, activities, animationDelay]);

  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    const iconMap = {
      commit: { color: 'text-blue-500', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
      issue: { color: 'text-green-500', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
      pull_request: { color: 'text-purple-500', icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' },
      release: { color: 'text-yellow-500', icon: 'M12 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
      fork: { color: 'text-red-500', icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' },
      star: { color: 'text-amber-500', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
    };

    const { color, icon } = iconMap[type];
    return (
      <div className={`${color}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="medium" /></div>;
  }

  if (error) {
    return <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">{error}</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="bg-muted/50 p-4 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div ref={timelineRef} className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="timeline-item bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src={activity.user.avatar_url}
                  alt={activity.user.login}
                  width={18}
                  height={18}
                  className="rounded-full"
                />
                <Link href={`/users/${activity.user.login}`} className="text-sm font-medium text-primary hover:underline truncate">
                  {activity.user.login}
                </Link>
              </div>

              <Link href={activity.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {activity.title}
              </Link>

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {activity.description}
              </p>

              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <Link href={activity.repo.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  {activity.repo.name}
                </Link>
                <span>{getRelativeTime(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
