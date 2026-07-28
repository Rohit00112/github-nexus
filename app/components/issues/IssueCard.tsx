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
  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'closed': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className={`h-4 w-4 ${issue.state === 'open' ? 'text-green-500' : 'text-red-500'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {issue.state === 'open' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/repositories/${repoOwner}/${repoName}/issues/${issue.number}`}
              className="text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              {issue.title}
            </Link>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStateColor(issue.state)}`}>
              {issue.state}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            #{issue.number} opened {timeAgo(issue.created_at)} by {issue.user.login}
          </div>

          {issue.body && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {issue.body}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            {issue.labels.map(label => (
              <span
                key={label.id}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `#${label.color}15`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}30`
                }}
              >
                {label.name}
              </span>
            ))}
          </div>

          {issue.assignees.length > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex -space-x-1.5">
                {issue.assignees.map(assignee => (
                  <div key={assignee.id} className="h-5 w-5 rounded-full overflow-hidden border-2 border-card">
                    <Image src={assignee.avatar_url} alt={assignee.login} width={20} height={20} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.comments > 0 && (
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span>{issue.comments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
