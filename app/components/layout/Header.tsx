"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.svg"
                alt="GitHub Nexus Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold">GitHub Nexus</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/repositories" className="hover:text-gray-300 transition-colors">
            Repositories
          </Link>
          <Link href="/issues" className="hover:text-gray-300 transition-colors">
            Issues
          </Link>
          <Link href="/pull-requests" className="hover:text-gray-300 transition-colors">
            Pull Requests
          </Link>
          <Link href="/actions" className="hover:text-gray-300 transition-colors">
            Actions
          </Link>
          <Link href="/insights" className="hover:text-gray-300 transition-colors">
            Insights
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
            {/* User avatar will go here */}
            <div className="w-full h-full bg-gray-500"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
