"use client";

import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import { animateTimeline } from '../../utils/animations';
import LoadingSpinner from '../ui/LoadingSpinner';

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
  user: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
}

const ActivityTimeline: FC<ActivityTimelineProps> = ({
  limit = 5,
  animationDelay = 0
}) => {
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
        
        // Get user events
        const user = await githubService.getCurrentUser();
        const events = await githubService.getUserEvents(user.login);
        
        // Transform events into activity format
        const transformedActivities = events
          .filter((event: any) => {
            // Filter relevant event types
            return [
              'PushEvent', 
              'IssuesEvent', 
              'PullRequestEvent', 
              'ReleaseEvent',
              'ForkEvent',
              'WatchEvent' // Star event
            ].includes(event.type);
          })
          .map((event: any): ActivityEvent => {
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
                title = `${event.payload.action} issue: ${event.payload.issue.title}`;
                description = event.payload.issue.body?.substring(0, 100) || 'No description';
                url = event.payload.issue.html_url;
                break;
              
              case 'PullRequestEvent':
                type = 'pull_request';
                title = `${event.payload.action} pull request: ${event.payload.pull_request.title}`;
                description = event.payload.pull_request.body?.substring(0, 100) || 'No description';
                url = event.payload.pull_request.html_url;
                break;
              
              case 'ReleaseEvent':
                type = 'release';
                title = `Released ${event.payload.release.name || event.payload.release.tag_name}`;
                description = event.payload.release.body?.substring(0, 100) || 'No description';
                url = event.payload.release.html_url;
                break;
              
              case 'ForkEvent':
                type = 'fork';
                title = `Forked ${event.repo.name}`;
                description = `Created a new fork of ${event.repo.name}`;
                url = `https://github.com/${event.payload.forkee.full_name}`;
                break;
              
              case 'WatchEvent':
                type = 'star';
                title = `Starred ${event.repo.name}`;
                description = `Added ${event.repo.name} to starred repositories`;
                url = `https://github.com/${event.repo.name}`;
                break;
            }
            
            return {
              id: event.id,
              type,
              title,
              description,
              timestamp: event.created_at,
              url,
              user: {
                login: event.actor.login,
                avatar_url: event.actor.avatar_url
              },
              repo: {
                name: event.repo.name,
                url: `https://github.com/${event.repo.name}`
              }
            };
          })
          .slice(0, limit);
        
        setActivities(transformedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load recent activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchActivities();
  }, [githubService, limit]);

  // Apply animation after activities are loaded
  useEffect(() => {
    if (!isLoading && activities.length > 0 && timelineRef.current) {
      setTimeout(() => {
        animateTimeline(timelineRef.current!, '.timeline-item');
      }, animationDelay);
    }
  }, [isLoading, activities, animationDelay]);

  // Format relative time
  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Get icon based on activity type
  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'commit':
        return (
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582A1 1 0 004 6.82v4.36a1 1 0 00.673.946l3.327 1.331v1.422a1 1 0 001 1h4a1 1 0 001-1v-1.422l3.327-1.33a1 1 0 00.673-.947V6.82a1 1 0 00-.673-.946L14 4.323V3a1 1 0 00-1-1h-3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'issue':
        return (
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'pull_request':
        return (
          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'release':
        return (
          <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'fork':
        return (
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'star':
        return (
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
    }
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

  if (activities.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-400">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div ref={timelineRef} className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="timeline-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <Image 
                  src={activity.user.avatar_url} 
                  alt={activity.user.login}
                  width={20}
                  height={20}
                  className="rounded-full mr-2"
                />
                <Link href={`/users/${activity.user.login}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate">
                  {activity.user.login}
                </Link>
              </div>
              
              <Link href={activity.url} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-gray-900 dark:text-gray-100 hover:underline">
                {activity.title}
              </Link>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Link href={activity.repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
