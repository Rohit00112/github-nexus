"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface UserStats {
  publicRepos: number;
  followers: number;
  following: number;
  contributions?: number;
  stars?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchUserData() {
      if (githubService) {
        try {
          setIsLoading(true);
          const userData = await githubService.getCurrentUser();
          
          // Set basic stats from user data
          setUserStats({
            publicRepos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            // These would need additional API calls in a real implementation
            contributions: Math.floor(Math.random() * 1000), // Placeholder
            stars: Math.floor(Math.random() * 100), // Placeholder
          });
          
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user profile data. Please try again later.");
          setIsLoading(false);
        }
      }
    }

    if (!githubLoading && githubService) {
      fetchUserData();
    }
  }, [githubService, githubLoading]);

  if (authLoading || githubLoading || isLoading) {
    return (
      <MainLayout>
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-4xl">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="text-center">
                    <span className="block text-2xl font-bold">{userStats?.publicRepos || 0}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Repositories</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold">{userStats?.followers || 0}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold">{userStats?.following || 0}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Following</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold">{userStats?.contributions || 0}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contributions</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold">{userStats?.stars || 0}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stars</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                <button className="px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400">
                  Overview
                </button>
                <button className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Repositories
                </button>
                <button className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Activity
                </button>
                <button className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Settings
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your recent GitHub activity will appear here. This feature is coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
