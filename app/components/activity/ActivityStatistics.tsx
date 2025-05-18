"use client";

import { FC } from 'react';
import { Card, CardBody } from '@nextui-org/react';

interface ActivityStats {
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  comments: number;
  repositories: number;
}

interface ActivityStatisticsProps {
  stats: ActivityStats;
  isLoading: boolean;
}

const ActivityStatistics: FC<ActivityStatisticsProps> = ({ stats, isLoading }) => {
  const statItems = [
    {
      name: 'Commits',
      value: stats.commits,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582A1 1 0 004 6.82v4.36a1 1 0 00.673.946l3.327 1.331v1.422a1 1 0 001 1h4a1 1 0 001-1v-1.422l3.327-1.33a1 1 0 00.673-.947V6.82a1 1 0 00-.673-.946L14 4.323V3a1 1 0 00-1-1h-3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Pull Requests',
      value: stats.pullRequests,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Issues',
      value: stats.issues,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Reviews',
      value: stats.reviews,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Comments',
      value: stats.comments,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600 dark:text-pink-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Repositories',
      value: stats.repositories,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <Card key={item.name} className="bg-white dark:bg-gray-800 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
                {isLoading ? (
                  <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-xl font-semibold">{item.value.toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default ActivityStatistics;
