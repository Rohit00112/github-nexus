"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface MemberCardProps {
  member: {
    login: string;
    avatar_url: string;
    html_url: string;
    name?: string;
    bio?: string;
    type: string;
  };
  contributions?: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
    repositories: number;
  };
  role?: string;
}

export default function MemberCard({ member, contributions, role }: MemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={member.avatar_url}
              alt={`${member.login}'s avatar`}
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {member.name || member.login}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              @{member.login}
            </p>
            {role && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {role}
              </p>
            )}
          </div>
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform duration-200 ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {member.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {member.bio}
              </p>
            )}

            {contributions && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {contributions.commits}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Commits
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {contributions.pullRequests}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Pull Requests
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {contributions.issues}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Issues
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded text-center">
                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    {contributions.reviews}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Reviews
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Link
                href={member.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View GitHub Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
