"use client";

import { FC } from 'react';
import Link from 'next/link';
import { GitHubWorkflowRun } from '../../types/github';

interface WorkflowRunCardProps {
  workflowRun: GitHubWorkflowRun;
  repoOwner: string;
  repoName: string;
}

const WorkflowRunCard: FC<WorkflowRunCardProps> = ({ workflowRun, repoOwner, repoName }) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate how long ago the run was created
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

  // Get status color
  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'failure':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'cancelled':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'skipped':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      }
    } else if (status === 'in_progress') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (status === 'queued') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get status label
  const getStatusLabel = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      return conclusion ? conclusion.charAt(0).toUpperCase() + conclusion.slice(1) : 'Completed';
    } else if (status === 'in_progress') {
      return 'In progress';
    } else if (status === 'queued') {
      return 'Queued';
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          );
        case 'failure':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          );
        case 'cancelled':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          );
        default:
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          );
      }
    } else if (status === 'in_progress') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 animate-spin" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      );
    } else if (status === 'queued') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon(workflowRun.status, workflowRun.conclusion)}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <Link 
                href={`/repositories/${repoOwner}/${repoName}/actions/runs/${workflowRun.id}`}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {workflowRun.name} <span className="text-gray-500">#{workflowRun.run_number}</span>
              </Link>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(workflowRun.status, workflowRun.conclusion)}`}>
                {getStatusLabel(workflowRun.status, workflowRun.conclusion)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Triggered by {workflowRun.event} event {timeAgo(workflowRun.created_at)}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Branch: <span className="font-medium">{workflowRun.head_branch}</span> • Commit: <span className="font-mono text-xs">{workflowRun.head_sha.substring(0, 7)}</span>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <Link 
                href={workflowRun.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                View on GitHub
              </Link>
              
              {workflowRun.status === 'completed' && workflowRun.conclusion !== 'success' && (
                <Link 
                  href={`/repositories/${repoOwner}/${repoName}/actions/runs/${workflowRun.id}/rerun`}
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Re-run workflow
                </Link>
              )}
              
              {(workflowRun.status === 'in_progress' || workflowRun.status === 'queued') && (
                <Link 
                  href={`/repositories/${repoOwner}/${repoName}/actions/runs/${workflowRun.id}/cancel`}
                  className="text-sm text-red-600 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Cancel workflow
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowRunCard;
