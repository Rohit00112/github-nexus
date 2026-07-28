"use client";

import { FC } from 'react';
import Link from 'next/link';
import { GitHubPullRequest } from '../../types/github';

interface PullRequestCardProps {
  pullRequest: GitHubPullRequest;
  repoOwner: string;
  repoName: string;
}

const PullRequestCard: FC<PullRequestCardProps> = ({ pullRequest, repoOwner, repoName }) => {
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

  const getStateColor = (state: string, isDraft: boolean) => {
    if (isDraft) return 'bg-muted text-muted-foreground';
    switch (state) {
      case 'open': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'closed':
        if (pullRequest.merged) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStateLabel = (state: string, isDraft: boolean) => {
    if (isDraft) return 'Draft';
    if (state === 'closed' && pullRequest.merged) return 'Merged';
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  const getStateIcon = () => {
    if (pullRequest.draft) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    }
    if (pullRequest.state === 'closed') {
      if (pullRequest.merged) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      }
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
      </svg>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStateIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/repositories/${repoOwner}/${repoName}/pull/${pullRequest.number}`}
              className="text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              {pullRequest.title}
            </Link>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStateColor(pullRequest.state, pullRequest.draft)}`}>
              {getStateLabel(pullRequest.state, pullRequest.draft)}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            #{pullRequest.number} opened {timeAgo(pullRequest.created_at)} by {pullRequest.user.login}
          </div>

          {pullRequest.body && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {pullRequest.body}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="font-mono">{pullRequest.commits}</span>
              <span>commits</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-mono">{pullRequest.changed_files}</span>
              <span>files</span>
            </div>

            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <span className="font-mono">+{pullRequest.additions}</span>
            </div>

            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <span className="font-mono">-{pullRequest.deletions}</span>
            </div>

            {pullRequest.comments > 0 && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span className="font-mono">{pullRequest.comments}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PullRequestCard;
