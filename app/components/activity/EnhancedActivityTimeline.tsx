"use client";

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import { Pagination, Spinner, Card, CardBody, Chip } from '@nextui-org/react';
import { ActivityFilters } from './ActivityFilters';

interface EnhancedActivityTimelineProps {
  filters: ActivityFilters;
  pageSize?: number;
}

interface ActivityEvent {
  id: string;
  type: 'commit' | 'issue' | 'pull_request' | 'release' | 'fork' | 'star' | 'comment' | 'review';
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
    full_name: string;
    url: string;
  };
}

const EnhancedActivityTimeline: FC<EnhancedActivityTimelineProps> = ({
  filters,
  pageSize = 10
}) => {
  const { githubService } = useGitHub();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all activities
  useEffect(() => {
    async function fetchActivities() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user events
        const user = await githubService.getCurrentUser();
        const events = await githubService.getUserEvents(user.login, 100); // Get more events for filtering
        
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
              'WatchEvent', // Star event
              'IssueCommentEvent',
              'PullRequestReviewEvent',
              'PullRequestReviewCommentEvent',
              'CommitCommentEvent'
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
                title = `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.repo.name}`;
                description = event.payload.commits?.map((commit: any) => commit.message).join(', ') || '';
                url = `https://github.com/${event.repo.name}/commit/${event.payload.head}`;
                break;
              
              case 'IssuesEvent':
                type = 'issue';
                title = `${event.payload.action} issue in ${event.repo.name}`;
                description = event.payload.issue?.title || '';
                url = event.payload.issue?.html_url || `https://github.com/${event.repo.name}`;
                break;
              
              case 'PullRequestEvent':
                type = 'pull_request';
                title = `${event.payload.action} pull request in ${event.repo.name}`;
                description = event.payload.pull_request?.title || '';
                url = event.payload.pull_request?.html_url || `https://github.com/${event.repo.name}`;
                break;
              
              case 'ReleaseEvent':
                type = 'release';
                title = `Released ${event.payload.release?.name || 'a new version'} in ${event.repo.name}`;
                description = event.payload.release?.body || '';
                url = event.payload.release?.html_url || `https://github.com/${event.repo.name}/releases`;
                break;
              
              case 'ForkEvent':
                type = 'fork';
                title = `Forked ${event.repo.name}`;
                description = `Created a new fork of ${event.repo.name}`;
                url = `https://github.com/${event.payload.forkee?.full_name || event.repo.name}`;
                break;
              
              case 'WatchEvent':
                type = 'star';
                title = `Starred ${event.repo.name}`;
                description = `Added ${event.repo.name} to starred repositories`;
                url = `https://github.com/${event.repo.name}`;
                break;

              case 'IssueCommentEvent':
              case 'CommitCommentEvent':
              case 'PullRequestReviewCommentEvent':
                type = 'comment';
                title = `Commented on ${event.repo.name}`;
                description = event.payload.comment?.body || '';
                url = event.payload.comment?.html_url || `https://github.com/${event.repo.name}`;
                break;

              case 'PullRequestReviewEvent':
                type = 'review';
                title = `Reviewed pull request in ${event.repo.name}`;
                description = event.payload.review?.body || 'Submitted a review';
                url = event.payload.review?.html_url || `https://github.com/${event.repo.name}`;
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
                name: event.repo.name.split('/')[1],
                full_name: event.repo.name,
                url: `https://github.com/${event.repo.name}`
              }
            };
          });
        
        setActivities(transformedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load recent activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchActivities();
  }, [githubService]);

  // Apply filters and pagination
  useEffect(() => {
    // Apply filters
    let filtered = [...activities];
    
    // Filter by event type
    if (filters.eventTypes.length > 0) {
      filtered = filtered.filter(activity => filters.eventTypes.includes(activity.type));
    }
    
    // Filter by repository
    if (filters.repositories.length > 0) {
      filtered = filtered.filter(activity => filters.repositories.includes(activity.repo.full_name));
    }
    
    // Filter by time range
    if (filters.timeRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(activity => new Date(activity.timestamp) >= startDate);
    }
    
    setFilteredActivities(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1); // Reset to first page when filters change
  }, [activities, filters, pageSize]);

  // Get activity icon based on type
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
          <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'fork':
        return (
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582A1 1 0 004 6.82v4.36a1 1 0 00.673.946l3.327 1.331v1.422a1 1 0 001 1h4a1 1 0 001-1v-1.422l3.327-1.33a1 1 0 00.673-.947V6.82a1 1 0 00-.673-.946L14 4.323V3a1 1 0 00-1-1h-3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'star':
        return (
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-600 dark:text-pink-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'review':
        return (
          <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 dark:text-teal-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Get current page of activities
  const getCurrentPageActivities = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredActivities.slice(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
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

  if (filteredActivities.length === 0) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardBody className="py-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No activities found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activities.length > 0 
                ? "Try adjusting your filters to see more activities." 
                : "You don't have any recent GitHub activities."}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {getCurrentPageActivities().map((activity) => (
          <Card key={activity.id} className="bg-white dark:bg-gray-800 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-start space-x-4">
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
                    <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <Link href={activity.url} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-gray-900 dark:text-gray-100 hover:underline">
                    {activity.title}
                  </Link>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {activity.description}
                  </p>

                  <div className="mt-2 flex items-center">
                    <Link href={activity.repo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {activity.repo.full_name}
                    </Link>
                    <Chip size="sm" className="ml-2" color={
                      activity.type === 'commit' ? 'primary' :
                      activity.type === 'issue' ? 'warning' :
                      activity.type === 'pull_request' ? 'secondary' :
                      activity.type === 'release' ? 'success' :
                      activity.type === 'fork' ? 'default' :
                      activity.type === 'star' ? 'warning' :
                      activity.type === 'comment' ? 'danger' :
                      'primary'
                    }>
                      {activity.type.replace('_', ' ')}
                    </Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={page}
            onChange={setPage}
            showControls
            showShadow
            color="primary"
            size="lg"
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedActivityTimeline;
