"use client";

import { FC, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNotifications } from '../../context/NotificationsContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Badge,
  Spinner,
  Divider
} from "@nextui-org/react";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: FC<NotificationBellProps> = ({ className = "" }) => {
  const { notifications, unreadCount, isLoading, error, markAsRead, fetchNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  const getNotificationUrl = (notification: any) => {
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

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.thread_id);
    setIsOpen(false);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await fetchNotifications({ all: true });
    } finally {
      setLocalLoading(false);
    }
  };

  // Effect to handle dropdown open
  useEffect(() => {
    if (isOpen) {
      handleRefresh();
    }
  }, [isOpen]);

  return (
    <Popover
      placement="bottom-end"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      classNames={{
        content: "p-0 glass"
      }}
    >
      <PopoverTrigger>
        <div className={className}>
          <Badge
            content={unreadCount > 99 ? '99+' : unreadCount}
            color="danger"
            isInvisible={unreadCount === 0}
            shape="circle"
            size="sm"
          >
            <Button
              isIconOnly
              variant="light"
              aria-label="Notifications"
              title="Notifications"
              radius="full"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </Button>
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="px-4 py-3 flex justify-between items-center">
          <h3 className="text-medium font-medium">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={handleRefresh}
              isLoading={localLoading || isLoading}
              title="Refresh notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button
              as={Link}
              href="/notifications"
              size="sm"
              variant="light"
              color="primary"
              onClick={() => setIsOpen(false)}
            >
              See all
            </Button>
          </div>
        </div>

        <Divider />

        <div className="max-h-96 overflow-y-auto">
          {(isLoading || localLoading) ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="sm" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-danger mb-2">{error}</p>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onClick={handleRefresh}
              >
                Try again
              </Button>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 5).map(notification => (
                <Link
                  key={notification.id}
                  href={getNotificationUrl(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 hover:bg-default-100 dark:hover:bg-default-50/10 ${
                    notification.unread ? 'bg-primary-50/30 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.subject.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.subject.title}
                      </p>
                      <p className="text-xs text-default-500 mt-1">
                        {notification.repository.full_name} • {formatTime(notification.updated_at)}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-default-500">
              <p>No notifications</p>
            </div>
          )}
        </div>

        <Divider />

        <div className="px-4 py-2">
          <Button
            as={Link}
            href="/settings/notifications"
            size="sm"
            variant="light"
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Notification settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
