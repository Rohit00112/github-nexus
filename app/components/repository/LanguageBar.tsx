"use client";

import { FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LanguageBarProps {
  className?: string;
}

const LanguageBar: FC<LanguageBarProps> = ({ className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Popular programming languages with their colors
  const languages = [
    { name: 'JavaScript', color: '#f1e05a' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'Python', color: '#3572A5' },
    { name: 'Java', color: '#b07219' },
    { name: 'Go', color: '#00ADD8' },
    { name: 'C#', color: '#178600' },
    { name: 'PHP', color: '#4F5D95' },
    { name: 'Ruby', color: '#701516' },
    { name: 'C++', color: '#f34b7d' },
    { name: 'Rust', color: '#dea584' },
  ];
  
  // Get current language filter
  const currentLanguage = searchParams.get('language') || '';
  
  // Handle language click
  const handleLanguageClick = (language: string) => {
    // Create a new URLSearchParams object from the current query
    const params = new URLSearchParams(searchParams.toString());
    
    if (language === currentLanguage) {
      // If clicking the current language, remove the filter
      params.delete('language');
    } else {
      // Otherwise, set the language filter
      params.set('language', language);
    }
    
    // Navigate to the search page with the updated query
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex space-x-2 py-2 min-w-max">
        {languages.map(language => (
          <button
            key={language.name}
            onClick={() => handleLanguageClick(language.name)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentLanguage === language.name
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: language.color }}
              />
              {language.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageBar;
