"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { ArrowPathIcon, BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../context/NotificationsContext";
import { notificationHref, notificationPresentation } from "../../lib/notifications";
import { relativeTime } from "../../lib/time";
import { cn } from "../../lib/cn";
import EmptyState from "../ui/EmptyState";
import { InlineError } from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import Tooltip from "../ui/Tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: FC<NotificationBellProps> = ({ className }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const recent = notifications.slice(0, 8);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content="Notifications" side="bottom">
        <PopoverTrigger
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
          className={cn(
            "relative inline-flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text",
            className
          )}
        >
          <BellIcon className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent className="w-[22rem] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-text">Notifications</p>
          <div className="flex items-center gap-1">
            <Tooltip content="Refresh">
              <button
                onClick={() => fetchNotifications()}
                aria-label="Refresh notifications"
                className="rounded p-1 text-text-subtle hover:bg-surface-hover hover:text-text"
              >
                <ArrowPathIcon className={cn("size-3.5", isLoading && "animate-spin")} />
              </button>
            </Tooltip>
            {unreadCount > 0 && (
              <Tooltip content="Mark all as read">
                <button
                  onClick={() => markAllAsRead()}
                  aria-label="Mark all as read"
                  className="rounded p-1 text-text-subtle hover:bg-surface-hover hover:text-text"
                >
                  <CheckIcon className="size-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2.5">
                  <Skeleton variant="circle" className="size-4 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-3/4" />
                    <Skeleton className="w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-3">
              <InlineError message={error} />
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              bare
              icon={<BellIcon className="size-5" />}
              title="You're all caught up"
              description="New activity on your repositories shows up here."
              className="py-10"
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((notification) => {
                const { icon: Icon, tone } = notificationPresentation(notification.subject.type);
                return (
                  <li key={notification.id}>
                    <Link
                      href={notificationHref(notification)}
                      onClick={() => {
                        if (notification.unread) markAsRead(notification.thread_id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex gap-2.5 px-3 py-2.5 hover:bg-surface-hover",
                        notification.unread && "bg-accent-muted"
                      )}
                    >
                      <Icon className={cn("mt-0.5 size-4 shrink-0", tone)} />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm",
                            notification.unread ? "font-medium text-text" : "text-text-muted"
                          )}
                        >
                          {notification.subject.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-text-subtle">
                          {notification.repository.full_name} ·{" "}
                          {relativeTime(notification.updated_at)}
                        </p>
                      </div>
                      {notification.unread && (
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-1.5">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex h-7 items-center justify-center rounded-md text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
