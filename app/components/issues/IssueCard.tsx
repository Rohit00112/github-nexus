"use client";

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GitHubIssue } from '../../types/github';

interface IssueCardProps {
  issue: GitHubIssue;
  repoOwner: string;
  repoName: string;
}

const IssueCard: FC<IssueCardProps> = ({ issue, repoOwner, repoName }) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate how long ago the issue was created or updated
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return `1 year ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return `1 month ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return `1 day ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return `1 hour ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return `1 minute ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
  };

  // Get state color
  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <svg 
            className={`h-5 w-5 ${issue.state === 'open' ? 'text-green-600' : 'text-red-600'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            {issue.state === 'open' ? (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            )}
          </svg>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <Link 
                href={`/repositories/${repoOwner}/${repoName}/issues/${issue.number}`}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {issue.title}
              </Link>
              <span className={`text-xs px-2 py-1 rounded-full ${getStateColor(issue.state)}`}>
                {issue.state}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              #{issue.number} opened {timeAgo(issue.created_at)} by {issue.user.login}
            </div>
            
            {issue.body && (
              <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                {issue.body}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {issue.labels.map(label => (
                <span 
                  key={label.id} 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `#${label.color}20`, 
                    color: `#${label.color}`,
                    border: `1px solid #${label.color}40`
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
            
            {issue.assignees.length > 0 && (
              <div className="flex items-center mt-3">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">Assignees:</span>
                <div className="flex -space-x-2">
                  {issue.assignees.map(assignee => (
                    <div key={assignee.id} className="h-6 w-6 rounded-full overflow-hidden border border-white dark:border-gray-800">
                      <Image
                        src={assignee.avatar_url}
                        alt={assignee.login}
                        width={24}
                        height={24}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {issue.comments > 0 && (
              <div className="flex items-center mt-3 text-sm text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>{issue.comments} comments</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
