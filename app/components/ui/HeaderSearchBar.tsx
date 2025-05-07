"use client";

import { FC, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderSearchBarProps {
  className?: string;
}

const HeaderSearchBar: FC<HeaderSearchBarProps> = ({ className = "" }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  // Handle click outside to close expanded search on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcut (/ key) to focus search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Focus search when / is pressed, unless user is typing in an input or textarea
      if (
        event.key === '/' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      
      // Close search on Escape
      if (event.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocused]);

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className={`relative ${isFocused ? 'w-full md:w-64 lg:w-80' : 'w-40 md:w-64'} transition-all duration-200 ${className}`}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search repositories..."
          className="w-full pl-9 pr-4 py-1.5 bg-gray-700 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {isFocused && (
          <div className="hidden md:block absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            Press Enter to search
          </div>
        )}
      </div>
      
      {isFocused && (
        <div className="absolute right-0 mt-1 text-xs text-gray-400 md:hidden">
          Press Enter to search
        </div>
      )}
    </form>
  );
};

export default HeaderSearchBar;
