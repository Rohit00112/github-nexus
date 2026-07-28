"use client";

import { createContext, useCallback, useContext, ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGitHub } from "./GitHubContext";
import { useAuth } from "../hooks/useAuth";
import { GitHubNotification } from "../types/github";
import { qk } from "../hooks/queries/keys";

export interface NotificationFilters {
  /** Include notifications already marked as read. */
  all?: boolean;
  /** Restrict to threads the user is directly participating in. */
  participating?: boolean;
}

interface NotificationsContextType {
  notifications: GitHubNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  /** Refetches the list, optionally switching the active filters. */
  fetchNotifications: (options?: NotificationFilters) => Promise<void>;
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

/**
 * Notification state for both the bell and the notifications page. Backed by a
 * single TanStack query so the two never fetch twice or disagree.
 *
 * The previous implementation passed `since: lastFetchTime` on every poll,
 * which replaced the whole list with only recently-changed threads. Polling
 * now always requests the full window.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { githubService } = useGitHub();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<NotificationFilters>({});

  const all = filters.all ?? false;
  const participating = filters.participating ?? false;
  const queryKey = qk.notifications.list(all, participating);

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    enabled: !!githubService && isAuthenticated,
    refetchInterval: 60_000,
    queryFn: async () => {
      const data = await githubService!.getNotifications({ all, participating, per_page: 50 });
      // The REST payload exposes the thread id as a string `id`; the rest of
      // the app works with a numeric `thread_id`.
      return data.map((notification) => ({
        ...notification,
        thread_id: Number(notification.id),
      })) as GitHubNotification[];
    },
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  /** Patches the cached list, returning a rollback snapshot. */
  const patchCache = useCallback(
    (predicate: (notification: GitHubNotification) => boolean) => {
      const previous = queryClient.getQueryData<GitHubNotification[]>(queryKey);
      queryClient.setQueryData<GitHubNotification[]>(queryKey, (current) =>
        (current ?? []).map((notification) =>
          predicate(notification) ? { ...notification, unread: false } : notification
        )
      );
      return previous;
    },
    [queryClient, queryKey]
  );

  const markAsReadMutation = useMutation({
    mutationFn: (threadId: number) => githubService!.markNotificationAsRead(threadId),
    onMutate: (threadId) => ({ previous: patchCache((n) => n.thread_id === threadId) }),
    onError: (_error, _threadId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.notifications.all }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => githubService!.markAllNotificationsAsRead(),
    onMutate: () => ({ previous: patchCache(() => true) }),
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.notifications.all }),
  });

  const markRepoAsReadMutation = useMutation({
    mutationFn: ({ owner, repo }: { owner: string; repo: string }) =>
      githubService!.markRepositoryNotificationsAsRead(owner, repo),
    onMutate: ({ owner, repo }) => ({
      previous: patchCache((n) => n.repository.full_name === `${owner}/${repo}`),
    }),
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.notifications.all }),
  });

  const fetchNotifications = useCallback(
    async (options?: NotificationFilters) => {
      // Switching filters changes the query key, which fetches on its own.
      if (
        options &&
        ((options.all ?? false) !== all || (options.participating ?? false) !== participating)
      ) {
        setFilters({ all: options.all ?? false, participating: options.participating ?? false });
        return;
      }
      await refetch();
    },
    [refetch, all, participating]
  );

  const value = useMemo<NotificationsContextType>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error: error ? "Failed to fetch notifications. Please try again later." : null,
      fetchNotifications,
      markAsRead: async (threadId) => {
        await markAsReadMutation.mutateAsync(threadId);
      },
      markAllAsRead: async () => {
        await markAllAsReadMutation.mutateAsync();
      },
      markRepositoryNotificationsAsRead: async (owner, repo) => {
        await markRepoAsReadMutation.mutateAsync({ owner, repo });
      },
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      fetchNotifications,
      markAsReadMutation,
      markAllAsReadMutation,
      markRepoAsReadMutation,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
