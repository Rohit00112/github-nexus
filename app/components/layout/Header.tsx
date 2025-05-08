"use client";

import Link from 'next/link';
import Image from 'next/image';
import { FC, useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import HeaderSearchBar from '../ui/HeaderSearchBar';

const Header: FC = () => {
  const { session, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        {isAuthenticated && (
          <div className="flex items-center space-x-6">
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
              <Link href="/gists" className="hover:text-gray-300 transition-colors">
                Gists
              </Link>
              <Link href="/code-review" className="hover:text-gray-300 transition-colors">
                Code Review
              </Link>
              <Link href="/actions" className="hover:text-gray-300 transition-colors">
                Actions
              </Link>
              <Link href="/insights" className="hover:text-gray-300 transition-colors">
                Insights
              </Link>
            </nav>

            <HeaderSearchBar className="hidden md:block" />
          </div>
        )}

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 focus:outline-none focus:border-blue-500"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <Link
                      href="/auth/signout"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Sign out
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
