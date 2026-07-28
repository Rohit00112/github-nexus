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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`relative ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search..."
          className="w-full pl-8 pr-10 py-1.5 bg-muted/50 text-sm text-foreground placeholder-muted-foreground rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        />
        {!isFocused && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded">
              /
            </kbd>
          </div>
        )}
      </div>
    </form>
  );
};

export default HeaderSearchBar;
