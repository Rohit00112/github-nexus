"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import { GitHubRepository } from "../types/github";
import RepositoryCard from "../components/repository/RepositoryCard";
import CreateRepositoryModal from "../components/repository/CreateRepositoryModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RepositoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();

  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "stars">("updated");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchRepositories() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);

          const user = await githubService.getCurrentUser();
          const repos = await githubService.getUserRepositories(user.login, 1, 100);

          setRepositories(repos);
        } catch (err) {
          console.error("Error fetching repositories:", err);
          setError("Failed to fetch repositories. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchRepositories();
  }, [githubService, githubLoading]);

  const handleCreateRepository = async (data: { name: string; description: string; isPrivate: boolean }) => {
    if (githubService) {
      try {
        setIsLoading(true);

        const newRepo = await githubService.createRepository({
          name: data.name,
          description: data.description,
          private: data.isPrivate,
          auto_init: true,
        });

        setRepositories([newRepo, ...repositories]);
        setShowCreateModal(false);
      } catch (err) {
        console.error("Error creating repository:", err);
        setError("Failed to create repository. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredRepositories = repositories
    .filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "stars") {
        return b.stargazers_count - a.stargazers_count;
      } else {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  if (authLoading || githubLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Repositories</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Repository
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find a repository..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <select
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "updated" | "name" | "stars")}
              >
                <option value="updated">Last updated</option>
                <option value="name">Name</option>
                <option value="stars">Stars</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No repositories found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery ? "No repositories match your search criteria." : "You don't have any repositories yet."}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Create a new repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRepositories.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRepositoryModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRepository}
        />
      )}
    </MainLayout>
  );
}
