"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SearchBar from "../components/ui/SearchBar";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type SearchResultType = 'repository' | 'issue' | 'pull-request';

interface SearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  description?: string;
  url: string;
  owner: string;
  repo: string;
  number?: number;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function performSearch() {
      if (!query || !githubService) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would use GitHub's search API
        // For now, we'll simulate search results with data we can fetch
        
        const searchResults: SearchResult[] = [];
        
        // Search repositories
        try {
          const currentUser = await githubService.getCurrentUser();
          const repos = await githubService.getUserRepositories(currentUser.login);
          
          const filteredRepos = repos.filter(repo => 
            repo.name.toLowerCase().includes(query.toLowerCase()) || 
            (repo.description && repo.description.toLowerCase().includes(query.toLowerCase()))
          );
          
          filteredRepos.forEach(repo => {
            searchResults.push({
              id: repo.id,
              type: 'repository',
              title: repo.name,
              description: repo.description || '',
              url: `/repositories/${repo.owner.login}/${repo.name}`,
              owner: repo.owner.login,
              repo: repo.name,
              createdAt: repo.created_at,
              updatedAt: repo.updated_at
            });
          });
        } catch (err) {
          console.error("Error searching repositories:", err);
        }
        
        setResults(searchResults);
      } catch (err) {
        console.error("Error performing search:", err);
        setError("An error occurred while searching. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [query, githubService]);

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(result => result.type === activeFilter);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Search</h1>
          
          <div className="mb-6">
            <SearchBar 
              className="w-full" 
              placeholder="Search repositories, issues, and pull requests..."
            />
          </div>
          
          {query && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">
                Search results for: <span className="font-bold">{query}</span>
              </h2>
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'all'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('repository')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'repository'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  Repositories
                </button>
                <button
                  onClick={() => setActiveFilter('issue')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'issue'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  Issues
                </button>
                <button
                  onClick={() => setActiveFilter('pull-request')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    activeFilter === 'pull-request'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  Pull Requests
                </button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map(result => (
                <div 
                  key={`${result.type}-${result.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                      result.type === 'repository' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : result.type === 'issue'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {result.type === 'repository' ? 'Repository' : result.type === 'issue' ? 'Issue' : 'Pull Request'}
                    </span>
                    <Link 
                      href={result.url}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {result.owner}/{result.repo}{result.number ? `#${result.number}` : ''}
                    </Link>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">
                    <Link href={result.url} className="hover:underline">
                      {result.title}
                    </Link>
                  </h3>
                  
                  {result.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {formatDate(result.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We couldn't find any matches for "{query}". Try different or more general keywords.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}
