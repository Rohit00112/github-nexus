"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useGitHub } from "./GitHubContext";
import { useAuth } from "../hooks/useAuth";
import { GitHubNotification } from "../types/github";

interface NotificationsContextType {
  notifications: GitHubNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (options?: {
    all?: boolean;
    participating?: boolean;
    since?: string;
  }) => Promise<void>;
  markAsRead: (threadId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markRepositoryNotificationsAsRead: (owner: string, repo: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  markRepositoryNotificationsAsRead: async () => {},
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { githubService } = useGitHub();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<GitHubNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (options?: {
    all?: boolean;
    participating?: boolean;
    since?: string;
  }) => {
    if (!githubService || !isAuthenticated) {
      // If not authenticated or no service, set empty notifications and stop loading
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Add since parameter if lastFetchTime exists and since is not provided
      const fetchOptions = { ...options };
      if (lastFetchTime && !fetchOptions.since) {
        fetchOptions.since = lastFetchTime.toISOString();
      }

      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise<GitHubNotification[]>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 10000);
      });

      // Race between the actual request and the timeout
      const data = await Promise.race([
        githubService.getNotifications({
          ...fetchOptions,
          per_page: 50,
        }),
        timeoutPromise
      ]);

      // If we get here, the request succeeded
      setNotifications(data);
      setUnreadCount(data.filter(notification => notification.unread).length);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications. Please try again later.");

      // Set empty notifications array to prevent UI from being stuck
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [githubService, isAuthenticated, lastFetchTime]);

  // Mark a notification as read
  const markAsRead = useCallback(async (threadId: number) => {
    if (!githubService || !isAuthenticated) return;

    try {
      await githubService.markNotificationAsRead(threadId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.thread_id === threadId
            ? { ...notification, unread: false }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read. Please try again later.");
    }
  }, [githubService, isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!githubService || !isAuthenticated) return;

    try {
      await githubService.markAllNotificationsAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, unread: false }))
      );

      // Update unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all notifications as read. Please try again later.");
    }
  }, [githubService, isAuthenticated]);

  // Mark repository notifications as read
  const markRepositoryNotificationsAsRead = useCallback(async (owner: string, repo: string) => {
    if (!githubService || !isAuthenticated) return;

    try {
      await githubService.markRepositoryNotificationsAsRead(owner, repo);

      // Update local state
      const repoFullName = `${owner}/${repo}`;
      const updatedNotifications = notifications.map(notification =>
        notification.repository.full_name === repoFullName
          ? { ...notification, unread: false }
          : notification
      );

      setNotifications(updatedNotifications);

      // Update unread count
      setUnreadCount(updatedNotifications.filter(n => n.unread).length);
    } catch (err) {
      console.error("Error marking repository notifications as read:", err);
      setError("Failed to mark repository notifications as read. Please try again later.");
    }
  }, [githubService, isAuthenticated, notifications]);

  // Initial fetch
  useEffect(() => {
    // Only fetch if authenticated, service is available, and auth loading is complete
    if (isAuthenticated && githubService && !authLoading && !initialFetchDone) {
      fetchNotifications();
      setInitialFetchDone(true);
    }
  }, [isAuthenticated, githubService, fetchNotifications, authLoading, initialFetchDone]);

  // Periodic fetch (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        markRepositoryNotificationsAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
