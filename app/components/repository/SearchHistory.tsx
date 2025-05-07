"use client";

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchHistoryProps {
  className?: string;
  onSelectQuery?: (query: string) => void;
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

const SearchHistory: FC<SearchHistoryProps> = ({ 
  className = "",
  onSelectQuery
}) => {
  const router = useRouter();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  
  // Load search history from localStorage
  useEffect(() => {
    const loadSearchHistory = () => {
      try {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory) as SearchHistoryItem[];
          setSearchHistory(parsedHistory);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    
    loadSearchHistory();
    
    // Add event listener for storage changes (in case history is updated in another tab)
    window.addEventListener('storage', loadSearchHistory);
    
    return () => {
      window.removeEventListener('storage', loadSearchHistory);
    };
  }, []);
  
  // Handle clicking on a search history item
  const handleHistoryItemClick = (query: string) => {
    if (onSelectQuery) {
      onSelectQuery(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  // Clear search history
  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };
  
  // Remove a single history item
  const removeHistoryItem = (query: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    
    const updatedHistory = searchHistory.filter(item => item.query !== query);
    setSearchHistory(updatedHistory);
    
    // Update localStorage
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (searchHistory.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 dark:text-gray-400 ${className}`}>
        <p>No recent searches</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Recent Searches</h3>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear all
        </button>
      </div>
      
      <div className="space-y-2">
        {searchHistory
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)
          .map(item => (
            <div
              key={item.query}
              onClick={() => handleHistoryItemClick(item.query)}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-800 dark:text-gray-200">{item.query}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                  {formatTimestamp(item.timestamp)}
                </span>
                <button
                  onClick={(e) => removeHistoryItem(item.query, e)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Remove from history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Helper function to add a search query to history
export const addToSearchHistory = (query: string) => {
  if (!query.trim()) return;
  
  try {
    // Get existing history
    const savedHistory = localStorage.getItem('searchHistory');
    let history: SearchHistoryItem[] = [];
    
    if (savedHistory) {
      history = JSON.parse(savedHistory);
    }
    
    // Check if query already exists
    const existingIndex = history.findIndex(item => item.query === query);
    
    if (existingIndex !== -1) {
      // Update timestamp of existing query
      history[existingIndex].timestamp = Date.now();
    } else {
      // Add new query
      history.push({
        query,
        timestamp: Date.now()
      });
    }
    
    // Limit history to 10 items
    if (history.length > 10) {
      history.sort((a, b) => b.timestamp - a.timestamp);
      history = history.slice(0, 10);
    }
    
    // Save updated history
    localStorage.setItem('searchHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export default SearchHistory;
