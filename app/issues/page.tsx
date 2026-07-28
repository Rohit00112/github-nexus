"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import { GitHubIssue, GitHubRepository } from "../types/github";
import IssueCard from "../components/issues/IssueCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function IssuesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();

  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"all" | "open" | "closed">("all");

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
    async function fetchIssues() {
      if (githubService && selectedRepo) {
        try {
          setIsLoading(true);
          setError(null);
          const [owner, repo] = selectedRepo.split('/');
          const issuesData = await githubService.getIssues(owner, repo, 1, 100);
          setIssues(issuesData as GitHubIssue[]);
        } catch (err) {
          console.error("Error fetching issues:", err);
          setError("Failed to fetch issues. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (selectedRepo) fetchIssues();
  }, [githubService, selectedRepo]);

  const filteredIssues = issues
    .filter(issue =>
      (filterState === "all" || issue.state === filterState) &&
      (issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (issue.body && issue.body.toLowerCase().includes(searchQuery.toLowerCase())))
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
          <h1 className="text-2xl font-bold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage issues across your repositories</p>
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
              <label htmlFor="issue-search" className="block text-xs font-medium text-muted-foreground mb-1.5">Search</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  id="issue-search"
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
                onChange={(e) => setFilterState(e.target.value as "all" | "open" | "closed")}
              >
                <option value="all">All issues</option>
                <option value="open">Open issues</option>
                <option value="closed">Closed issues</option>
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
            <p className="text-sm text-muted-foreground">Please select a repository to view its issues.</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No issues found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterState !== "all"
                ? "No issues match your search criteria."
                : "This repository doesn't have any issues yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredIssues.map((issue) => {
              const [owner, repo] = selectedRepo.split('/');
              return (
                <IssueCard key={issue.id} issue={issue} repoOwner={owner} repoName={repo} />
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
