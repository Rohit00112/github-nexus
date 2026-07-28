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
          setRepositories(repos as GitHubRepository[]);
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
        setRepositories([newRepo as GitHubRepository, ...repositories]);
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
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
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
      <div className="py-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and browse your GitHub repositories</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg flex items-center text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Repository
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Find a repository..."
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "updated" | "name" | "stars")}
            >
              <option value="updated">Last updated</option>
              <option value="name">Name</option>
              <option value="stars">Stars</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm">{error}</div>
        ) : filteredRepositories.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery ? "No repositories match your search criteria." : "You don't have any repositories yet."}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-5 rounded-lg text-sm transition-colors"
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
