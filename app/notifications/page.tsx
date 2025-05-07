"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationsContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { GitHubNotification } from "../types/github";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    notifications, 
    isLoading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'participating'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');
  
  // Get unique repositories from notifications
  const repositories = [...new Set(notifications.map(n => n.repository.full_name))];
  
  // Get unique notification types
  const notificationTypes = [...new Set(notifications.map(n => n.subject.type))];

  // Filter notifications based on selected filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read/unread status
    if (filter === 'unread' && !notification.unread) return false;
    if (filter === 'participating' && notification.reason !== 'mention' && notification.reason !== 'team_mention') return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notification.subject.type !== typeFilter) return false;
    
    // Filter by repository
    if (repoFilter !== 'all' && notification.repository.full_name !== repoFilter) return false;
    
    return true;
  });

  // Group notifications by repository
  const groupedNotifications: Record<string, GitHubNotification[]> = {};
  filteredNotifications.forEach(notification => {
    const repoName = notification.repository.full_name;
    if (!groupedNotifications[repoName]) {
      groupedNotifications[repoName] = [];
    }
    groupedNotifications[repoName].push(notification);
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Format notification time
  const formatTime = (dateString: string) => {
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
    
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Issue':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'PullRequest':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'Discussion':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
        );
      case 'Release':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  // Get notification URL
  const getNotificationUrl = (notification: GitHubNotification) => {
    if (notification.subject.url) {
      // Extract the path from the API URL
      const urlParts = notification.subject.url.split('/');
      const resourceType = notification.subject.type.toLowerCase();
      
      if (resourceType === 'issue') {
        return `/repositories/${notification.repository.owner.login}/${notification.repository.name}/issues/${urlParts[urlParts.length - 1]}`;
      } else if (resourceType === 'pullrequest') {
        return `/repositories/${notification.repository.owner.login}/${notification.repository.name}/pull/${urlParts[urlParts.length - 1]}`;
      }
    }
    
    // Fallback to repository URL
    return `/repositories/${notification.repository.owner.login}/${notification.repository.name}`;
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications({ all: filter === 'all' });
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Refresh
                  </span>
                )}
              </button>
              <button
                onClick={() => markAllAsRead()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                disabled={isLoading || filteredNotifications.filter(n => n.unread).length === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
              {/* Filter by status */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'unread'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('participating')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === 'participating'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  Participating
                </button>
              </div>

              {/* Filter by type */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">All</option>
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Filter by repository */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Repository:</span>
                <select
                  value={repoFilter}
                  onChange={(e) => setRepoFilter(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
                >
                  <option value="all">All</option>
                  {repositories.map(repo => (
                    <option key={repo} value={repo}>{repo}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="medium" />
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4">
                <p>{error}</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div>
                {Object.entries(groupedNotifications).map(([repoName, repoNotifications]) => (
                  <div key={repoName} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                      <Link 
                        href={`/repositories/${repoName}`}
                        className="font-medium text-gray-900 dark:text-white hover:underline"
                      >
                        {repoName}
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {repoNotifications.length} notification{repoNotifications.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {repoNotifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 border-t border-gray-200 dark:border-gray-700 first:border-0 ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {getNotificationIcon(notification.subject.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <Link 
                                href={getNotificationUrl(notification)}
                                onClick={() => notification.unread && markAsRead(notification.thread_id)}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {notification.subject.title}
                              </Link>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {formatTime(notification.updated_at)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="capitalize">{notification.reason.replace('_', ' ')}</span>
                              <span className="mx-1">•</span>
                              <span>{notification.subject.type}</span>
                              {notification.unread && (
                                <>
                                  <span className="mx-1">•</span>
                                  <button
                                    onClick={() => markAsRead(notification.thread_id)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    Mark as read
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p className="mb-2">No notifications found</p>
                <p className="text-sm">
                  {filter !== 'all' ? (
                    <button 
                      onClick={() => setFilter('all')} 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all notifications
                    </button>
                  ) : (
                    "You're all caught up!"
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
