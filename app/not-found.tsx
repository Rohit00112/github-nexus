"use client";

import Link from 'next/link';
import MainLayout from './components/layout/MainLayout';
import { useEffect } from 'react';

export default function NotFound() {
  // Log the 404 error for tracking purposes
  useEffect(() => {
    console.error('404 error: Page not found');
  }, []);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-600 dark:text-blue-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold mb-4 text-gray-800 dark:text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
