"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import { GitHubPullRequest, GitHubRepository } from "../types/github";
import PullRequestCard from "../components/pull-requests/PullRequestCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function PullRequestsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();

  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"all" | "open" | "closed" | "merged" | "draft">("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/auth/signin");
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
          if (repos.length > 0 && !selectedRepo) setSelectedRepo(repos[0].full_name);
        } catch (err) {
          console.error("Error fetching repositories:", err);
          setError("Failed to fetch repositories. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchRepositories();
  }, [githubService, githubLoading, selectedRepo]);

  useEffect(() => {
    async function fetchPullRequests() {
      if (githubService && selectedRepo) {
        try {
          setIsLoading(true);
          setError(null);
          const [owner, repo] = selectedRepo.split('/');
          const prsData = await githubService.getPullRequests(owner, repo, 1, 100);
          setPullRequests(prsData as unknown as GitHubPullRequest[]);
        } catch (err) {
          console.error("Error fetching pull requests:", err);
          setError("Failed to fetch pull requests. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (selectedRepo) fetchPullRequests();
  }, [githubService, selectedRepo]);

  const filteredPullRequests = pullRequests
    .filter(pr => {
      if (filterState === "all") return true;
      if (filterState === "merged") return pr.state === "closed" && pr.merged;
      if (filterState === "draft") return pr.draft;
      return pr.state === filterState;
    })
    .filter(pr =>
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pr.body && pr.body.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Pull Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage pull requests across your repositories</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="md:w-1/3">
              <label htmlFor="repository-select" className="block text-xs font-medium text-muted-foreground mb-1.5">Repository</label>
              <select
                id="repository-select"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                value={selectedRepo || ""}
                onChange={(e) => setSelectedRepo(e.target.value)}
              >
                <option value="" disabled>Select a repository</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>
                ))}
              </select>
            </div>

            <div className="md:w-1/3">
              <label htmlFor="pr-search" className="block text-xs font-medium text-muted-foreground mb-1.5">Search</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  id="pr-search"
                  type="text"
                  placeholder="Search by title or description..."
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="md:w-1/3">
              <label htmlFor="state-filter" className="block text-xs font-medium text-muted-foreground mb-1.5">State</label>
              <select
                id="state-filter"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value as "all" | "open" | "closed" | "merged" | "draft")}
              >
                <option value="all">All pull requests</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="merged">Merged</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm">{error}</div>
        ) : !selectedRepo ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No repository selected</h3>
            <p className="text-sm text-muted-foreground">Please select a repository to view its pull requests.</p>
          </div>
        ) : filteredPullRequests.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No pull requests found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterState !== "all"
                ? "No pull requests match your search criteria."
                : "This repository doesn't have any pull requests yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPullRequests.map((pr) => {
              const [owner, repo] = selectedRepo.split('/');
              return (
                <PullRequestCard key={pr.id} pullRequest={pr} repoOwner={owner} repoName={repo} />
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
