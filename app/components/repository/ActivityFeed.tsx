"use client";

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { useGitHub } from '../../context/GitHubContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ActivityFeedProps {
  owner: string;
  repo: string;
}

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  html_url: string;
}

interface Event {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
    url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
}

const ActivityFeed: FC<ActivityFeedProps> = ({ owner, repo }) => {
  const { githubService } = useGitHub();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'commits' | 'events'>('commits');

  // Fetch repository commits
  useEffect(() => {
    async function fetchCommits() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await githubService.octokit.rest.repos.listCommits({
          owner,
          repo,
          per_page: 10
        });
        
        setCommits(response.data as Commit[]);
      } catch (err) {
        console.error("Error fetching repository commits:", err);
        setError("Failed to load repository commits. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (activeTab === 'commits') {
      fetchCommits();
    }
  }, [githubService, owner, repo, activeTab]);

  // Fetch repository events
  useEffect(() => {
    async function fetchEvents() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await githubService.octokit.rest.activity.listRepoEvents({
          owner,
          repo,
          per_page: 10
        });
        
        setEvents(response.data as Event[]);
      } catch (err) {
        console.error("Error fetching repository events:", err);
        setError("Failed to load repository events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (activeTab === 'events') {
      fetchEvents();
    }
  }, [githubService, owner, repo, activeTab]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get event description
  const getEventDescription = (event: Event) => {
    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.commits?.length || 0;
        return `pushed ${commitCount} commit${commitCount === 1 ? '' : 's'}`;
      case 'PullRequestEvent':
        const action = event.payload.action;
        const prNumber = event.payload.pull_request?.number;
        return `${action} pull request #${prNumber}`;
      case 'IssuesEvent':
        return `${event.payload.action} issue #${event.payload.issue?.number}`;
      case 'IssueCommentEvent':
        return `commented on issue #${event.payload.issue?.number}`;
      case 'CreateEvent':
        return `created ${event.payload.ref_type} ${event.payload.ref || ''}`;
      case 'DeleteEvent':
        return `deleted ${event.payload.ref_type} ${event.payload.ref || ''}`;
      case 'ForkEvent':
        return `forked the repository`;
      case 'WatchEvent':
        return `starred the repository`;
      default:
        return event.type.replace('Event', '');
    }
  };

  // Truncate commit message
  const truncateMessage = (message: string, maxLength = 80) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'commits'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('commits')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Commits
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('events')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Activity
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : activeTab === 'commits' ? (
          <div className="space-y-4">
            {commits.length > 0 ? (
              commits.map(commit => (
                <div key={commit.sha} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {commit.author?.avatar_url ? (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={commit.author.avatar_url}
                            alt={commit.author.login || commit.commit.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                          {commit.commit.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <a 
                          href={commit.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {truncateMessage(commit.commit.message.split('\n')[0])}
                        </a>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                          {formatDate(commit.commit.author.date)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">
                          {commit.author?.login || commit.commit.author.name}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No commits found for this repository.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={event.actor.avatar_url}
                          alt={event.actor.login}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          <span className="text-blue-600 dark:text-blue-400">{event.actor.login}</span>
                          {' '}
                          <span>{getEventDescription(event)}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent activity found for this repository.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
