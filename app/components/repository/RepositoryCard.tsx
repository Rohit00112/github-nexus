"use client";

import { FC } from 'react';
import Link from 'next/link';
import { GitHubRepository } from '../../types/github';

interface RepositoryCardProps {
  repository: GitHubRepository;
}

const RepositoryCard: FC<RepositoryCardProps> = ({ repository }) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get language color
  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-400';
    
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-500',
      Python: 'bg-blue-600',
      Java: 'bg-red-600',
      'C#': 'bg-green-600',
      PHP: 'bg-purple-500',
      Ruby: 'bg-red-500',
      Go: 'bg-blue-400',
      Swift: 'bg-orange-500',
      Kotlin: 'bg-purple-400',
      Rust: 'bg-orange-600',
      HTML: 'bg-red-400',
      CSS: 'bg-blue-300',
    };
    
    return colors[language] || 'bg-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Link 
            href={`/repositories/${repository.owner.login}/${repository.name}`}
            className="text-xl font-semibold text-blue-600 hover:underline"
          >
            {repository.name}
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {repository.private ? 'Private' : 'Public'} repository
          </p>
        </div>
        <div className="flex space-x-2">
          <a 
            href={repository.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </div>
      
      {repository.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
          {repository.description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {repository.topics && repository.topics.map(topic => (
          <span 
            key={topic} 
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
          >
            {topic}
          </span>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 gap-x-4 gap-y-2">
        {repository.language && (
          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full mr-1 ${getLanguageColor(repository.language)}`}></span>
            <span>{repository.language}</span>
          </div>
        )}
        
        {repository.stargazers_count > 0 && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{repository.stargazers_count}</span>
          </div>
        )}
        
        {repository.forks_count > 0 && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>{repository.forks_count}</span>
          </div>
        )}
        
        <div className="flex items-center">
          <span>Updated on {formatDate(repository.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;
