"use client";

import { FC, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGitHub } from '../../context/GitHubContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import RepositoryCard from './RepositoryCard';
import SearchHistory, { addToSearchHistory } from './SearchHistory';

interface RepositorySearchProps {
  initialQuery?: string;
}

const RepositorySearch: FC<RepositorySearchProps> = ({ initialQuery = '' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { githubService } = useGitHub();

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filter and sort state
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'help-wanted-issues'>('stars');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [language, setLanguage] = useState<string>('');
  const [minStars, setMinStars] = useState<string>('');
  const [minForks, setMinForks] = useState<string>('');

  // Popular languages for filter dropdown
  const popularLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C#', 'PHP', 'Ruby', 'C++', 'Rust'
  ];

  // Build search query with filters
  const buildSearchQuery = useCallback(() => {
    let query = searchQuery.trim();

    // Add language filter
    if (language) {
      query += ` language:${language}`;
    }

    // Add stars filter
    if (minStars) {
      query += ` stars:>=${minStars}`;
    }

    // Add forks filter
    if (minForks) {
      query += ` forks:>=${minForks}`;
    }

    return query;
  }, [searchQuery, language, minStars, minForks]);

  // Search repositories
  const searchRepositories = useCallback(async () => {
    const query = buildSearchQuery();

    if (!query) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await githubService?.searchRepositories({
        query,
        sort: sortBy,
        order: sortOrder,
        per_page: perPage,
        page: currentPage
      });

      if (data) {
        setResults(data.items);
        setTotalCount(data.total_count);
      }
    } catch (err) {
      console.error('Error searching repositories:', err);
      setError('Failed to search repositories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [githubService, buildSearchQuery, sortBy, sortOrder, perPage, currentPage]);

  // Update URL with search parameters
  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    if (language) params.set('language', language);
    if (minStars) params.set('stars', minStars);
    if (minForks) params.set('forks', minForks);
    if (sortBy !== 'stars') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ''}`);
  }, [router, searchQuery, language, minStars, minForks, sortBy, sortOrder, currentPage]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1); // Reset to first page on new search
      searchRepositories();
      updateSearchParams();

      // Add to search history
      addToSearchHistory(searchQuery.trim());
    }
  };

  // Handle selecting a query from search history
  const handleSelectFromHistory = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

    // Update filters based on the query
    const queryParts = query.split(' ');
    let newLanguage = '';
    let newMinStars = '';
    let newMinForks = '';

    queryParts.forEach(part => {
      if (part.startsWith('language:')) {
        newLanguage = part.replace('language:', '');
      } else if (part.startsWith('stars:>=')) {
        newMinStars = part.replace('stars:>=', '');
      } else if (part.startsWith('forks:>=')) {
        newMinForks = part.replace('forks:>=', '');
      }
    });

    setLanguage(newLanguage);
    setMinStars(newMinStars);
    setMinForks(newMinForks);

    // Trigger search
    setTimeout(() => {
      searchRepositories();
      updateSearchParams();
    }, 0);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Load search results when parameters change
  useEffect(() => {
    if (githubService) {
      searchRepositories();
    }
  }, [githubService, currentPage, perPage, sortBy, sortOrder, searchRepositories]);

  // Initialize from URL parameters
  useEffect(() => {
    const q = searchParams.get('q');
    const lang = searchParams.get('language');
    const stars = searchParams.get('stars');
    const forks = searchParams.get('forks');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const page = searchParams.get('page');

    if (q) setSearchQuery(q);
    if (lang) setLanguage(lang);
    if (stars) setMinStars(stars);
    if (forks) setMinForks(forks);
    if (sort && ['stars', 'forks', 'updated', 'help-wanted-issues'].includes(sort)) {
      setSortBy(sort as 'stars' | 'forks' | 'updated' | 'help-wanted-issues');
    }
    if (order && ['asc', 'desc'].includes(order)) {
      setSortOrder(order as 'asc' | 'desc');
    }
    if (page) setCurrentPage(parseInt(page, 10));

    // Only search if we have a query
    if (q) {
      searchRepositories();
    }
  }, [searchParams, searchRepositories]);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / perPage);
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingTo = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Search'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="">Any Language</option>
              {popularLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Stars
            </label>
            <input
              type="number"
              value={minStars}
              onChange={(e) => setMinStars(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Forks
            </label>
            <input
              type="number"
              value={minForks}
              onChange={(e) => setMinForks(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <div className="flex">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md bg-white dark:bg-gray-800"
              >
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="updated">Recently Updated</option>
                <option value="help-wanted-issues">Help Wanted Issues</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-md bg-white dark:bg-gray-800"
                title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Results */}
      {error ? (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {showingFrom}-{showingTo} of {totalCount.toLocaleString()} repositories
          </div>

          <div className="grid grid-cols-1 gap-6">
            {results.map(repo => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p className="text-lg mb-2">No repositories found</p>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p className="text-lg mb-2">Search for GitHub repositories</p>
            <p>Enter keywords, filter by language, stars, and more</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <SearchHistory onSelectQuery={handleSelectFromHistory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositorySearch;
