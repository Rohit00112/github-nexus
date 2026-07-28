"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationsContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { GitHubNotification } from "../types/github";

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

  const repositories = [...new Set(notifications.map(n => n.repository.full_name))];
  const notificationTypes = [...new Set(notifications.map(n => n.subject.type))];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && !notification.unread) return false;
    if (filter === 'participating' && notification.reason !== 'mention' && notification.reason !== 'team_mention') return false;
    if (typeFilter !== 'all' && notification.subject.type !== typeFilter) return false;
    if (repoFilter !== 'all' && notification.repository.full_name !== repoFilter) return false;
    return true;
  });

  const groupedNotifications: Record<string, GitHubNotification[]> = {};
  filteredNotifications.forEach(notification => {
    const repoName = notification.repository.full_name;
    if (!groupedNotifications[repoName]) groupedNotifications[repoName] = [];
    groupedNotifications[repoName].push(notification);
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/auth/signin");
  }, [authLoading, isAuthenticated, router]);

  const handleRefresh = useCallback(async () => {
    try {
      await fetchNotifications({ all: filter === 'all', participating: filter === 'participating' });
    } catch (err) {
      console.error("Error refreshing notifications:", err);
    }
  }, [fetchNotifications, filter]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) handleRefresh();
  }, [filter, typeFilter, repoFilter, isAuthenticated, authLoading, handleRefresh]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Issue':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
      case 'PullRequest':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>;
      case 'Discussion':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
    }
  };

  const getNotificationUrl = (notification: GitHubNotification) => {
    if (notification.subject.url) {
      const urlParts = notification.subject.url.split('/');
      const resourceType = notification.subject.type.toLowerCase();
      if (resourceType === 'issue') return `/repositories/${notification.repository.owner.login}/${notification.repository.name}/issues/${urlParts[urlParts.length - 1]}`;
      if (resourceType === 'pullrequest') return `/repositories/${notification.repository.owner.login}/${notification.repository.name}/pull/${urlParts[urlParts.length - 1]}`;
    }
    return `/repositories/${notification.repository.owner.login}/${notification.repository.name}`;
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
      <div className="py-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">Stay updated on your GitHub activity</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 border border-border bg-card hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="small" /> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              )}
              Refresh
            </button>
            <button
              onClick={() => markAllAsRead()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              disabled={isLoading || filteredNotifications.filter(n => n.unread).length === 0}
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1.5">
              {['all', 'unread', 'participating'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1.5 border border-border rounded-lg bg-background text-sm"
              >
                <option value="all">All</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Repo:</span>
              <select
                value={repoFilter}
                onChange={(e) => setRepoFilter(e.target.value)}
                className="px-2 py-1.5 border border-border rounded-lg bg-background text-sm"
              >
                <option value="all">All</option>
                {repositories.map(repo => (
                  <option key={repo} value={repo}>{repo}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm">{error}</div>
        ) : filteredNotifications.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {Object.entries(groupedNotifications).map(([repoName, repoNotifications]) => (
              <div key={repoName} className="border-b border-border last:border-0">
                <div className="px-4 py-2.5 bg-muted/50 flex justify-between items-center">
                  <Link
                    href={`/repositories/${repoName}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {repoName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {repoNotifications.length} notification{repoNotifications.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {repoNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-t border-border first:border-0 ${
                      notification.unread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        {getNotificationIcon(notification.subject.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Link
                            href={getNotificationUrl(notification)}
                            onClick={() => notification.unread && markAsRead(notification.thread_id)}
                            className="text-primary hover:underline font-medium text-sm"
                          >
                            {notification.subject.title}
                          </Link>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {formatTime(notification.updated_at)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground gap-1">
                          <span className="capitalize">{notification.reason.replace('_', ' ')}</span>
                          <span className="text-border">•</span>
                          <span>{notification.subject.type}</span>
                          {notification.unread && (
                            <>
                              <span className="text-border">•</span>
                              <button
                                onClick={() => markAsRead(notification.thread_id)}
                                className="text-primary hover:underline"
                              >
                                Mark read
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
          <div className="bg-card border border-border rounded-xl py-12 text-center">
            <p className="text-muted-foreground mb-2">No notifications found</p>
            <p className="text-sm text-muted-foreground">
              {filter !== 'all' ? (
                <button onClick={() => setFilter('all')} className="text-primary hover:underline">View all notifications</button>
              ) : (
                "You're all caught up!"
              )}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
