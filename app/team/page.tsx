"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useGitHub } from "../context/GitHubContext";
import Link from "next/link";

interface Organization {
  login: string;
  avatar_url: string;
  description: string;
}

export default function TeamCollaborationPage() {
  const { githubService } = useGitHub();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const orgs = await githubService.getUserOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to load organizations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrganizations();
  }, [githubService]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Team Collaboration</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">About Team Collaboration</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The Team Collaboration view provides insights into how teams are working together across GitHub repositories.
            View team members, their contributions, and recent activity to better understand team dynamics and productivity.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Select an organization below to view its teams and members, or navigate directly to a specific team.
          </p>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Your Organizations</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : organizations.length === 0 ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
            You don&apos;t belong to any organizations. Organizations allow you to manage team access to repositories.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Link
                key={org.login}
                href={`/team/${org.login}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {org.avatar_url && (
                      <img
                        src={org.avatar_url}
                        alt={`${org.login} logo`}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <h3 className="text-lg font-medium">{org.login}</h3>
                  </div>
                  
                  {org.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {org.description}
                    </p>
                  )}
                  
                  <div className="flex justify-end">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">
                      View teams →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
