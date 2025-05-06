"use client";

import { FC } from 'react';
import Link from 'next/link';
import { GitHubWorkflow } from '../../types/github';

interface WorkflowCardProps {
  workflow: GitHubWorkflow;
  repoOwner: string;
  repoName: string;
}

const WorkflowCard: FC<WorkflowCardProps> = ({ workflow, repoOwner, repoName }) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get state color
  const getStateColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'disabled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <Link 
                href={`/repositories/${repoOwner}/${repoName}/actions/workflows/${workflow.id}`}
                className="text-lg font-semibold text-blue-600 hover:underline"
              >
                {workflow.name}
              </Link>
              <span className={`text-xs px-2 py-1 rounded-full ${getStateColor(workflow.state)}`}>
                {workflow.state}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Last updated on {formatDate(workflow.updated_at)}
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <Link 
                href={workflow.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                View workflow file
              </Link>
              
              <Link 
                href={`/repositories/${repoOwner}/${repoName}/actions/workflows/${workflow.id}/dispatch`}
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Trigger workflow
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
