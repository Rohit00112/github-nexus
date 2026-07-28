"use client";

import { FC } from 'react';
import Link from 'next/link';
import { GitHubRepository } from '../../types/github';
import type { GitHubService } from '../../services/github/githubService';

type SearchRepository = Awaited<ReturnType<GitHubService["searchRepositories"]>>["items"][number];

interface RepositoryCardProps {
  repository: GitHubRepository | SearchRepository;
}

const RepositoryCard: FC<RepositoryCardProps> = ({ repository }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-zinc-400';
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400', TypeScript: 'bg-blue-500', Python: 'bg-blue-600',
      Java: 'bg-red-600', 'C#': 'bg-green-600', PHP: 'bg-purple-500', Ruby: 'bg-red-500',
      Go: 'bg-blue-400', Swift: 'bg-orange-500', Kotlin: 'bg-purple-400', Rust: 'bg-orange-600',
      HTML: 'bg-red-400', CSS: 'bg-blue-300',
    };
    return colors[language] || 'bg-zinc-400';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <Link
            href={`/repositories/${repository.owner?.login}/${repository.name}`}
            className="text-base font-semibold text-foreground hover:text-primary transition-colors"
          >
            {repository.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {repository.private ? 'Private' : 'Public'}
          </p>
        </div>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      {repository.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {repository.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {repository.topics && repository.topics.slice(0, 3).map(topic => (
          <span key={topic} className="bg-primary/10 text-primary text-[11px] px-2 py-0.5 rounded-full font-medium">
            {topic}
          </span>
        ))}
        {repository.topics && repository.topics.length > 3 && (
          <span className="text-muted-foreground text-[11px] px-1 py-0.5">+{repository.topics.length - 3}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-x-3 gap-y-1">
        {repository.language && (
          <div className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${getLanguageColor(repository.language)}`} />
            <span>{repository.language}</span>
          </div>
        )}

        {repository.stargazers_count > 0 && (
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="font-mono">{repository.stargazers_count}</span>
          </div>
        )}

        {repository.forks_count > 0 && (
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <span className="font-mono">{repository.forks_count}</span>
          </div>
        )}

        <span>Updated {repository.updated_at ? formatDate(repository.updated_at) : 'Unknown'}</span>
      </div>
    </div>
  );
};

export default RepositoryCard;
