'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import { GitHubRepository, GitHubWorkflow } from "../types/github";
import WorkflowCard from "../components/actions/WorkflowCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useRef } from "react";

export default function ActionsClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const componentMounted = useRef(false);

  // Hide server-only content when component mounts
  useEffect(() => {
    componentMounted.current = true;
    // Add a class to the body to indicate the client component is mounted
    document.documentElement.classList.add('client-mounted');
  }, []);

  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"all" | "active" | "disabled">("all");

  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && !isAuthenticated) {
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

          // Select the first repository by default
          if (repos.length > 0 && !selectedRepo) {
            setSelectedRepo(repos[0].full_name);
          }
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
    async function fetchWorkflows() {
      if (githubService && selectedRepo) {
        try {
          setIsLoading(true);
          setError(null);

          const [owner, repo] = selectedRepo.split('/');
          const workflowsData = await githubService.getWorkflows(owner, repo, 1, 100);

          setWorkflows(workflowsData);
        } catch (err) {
          console.error("Error fetching workflows:", err);
          setError("Failed to fetch workflows. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (selectedRepo) {
      fetchWorkflows();
    }
  }, [githubService, selectedRepo]);

  const filteredWorkflows = workflows
    .filter(workflow =>
      (filterState === "all" || workflow.state === filterState) &&
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (authLoading || githubLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">GitHub Actions</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <label htmlFor="repository-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Repository
            </label>
            <select
              id="repository-select"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={selectedRepo || ""}
              onChange={(e) => setSelectedRepo(e.target.value)}
            >
              <option value="" disabled>Select a repository</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:w-1/3">
            <label htmlFor="workflow-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search workflows
            </label>
            <div className="relative">
              <input
                id="workflow-search"
                type="text"
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="md:w-1/3">
            <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <select
              id="state-filter"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as "all" | "active" | "disabled")}
            >
              <option value="all">All workflows</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
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
      ) : !selectedRepo ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No repository selected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please select a repository to view its workflows.
          </p>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No workflows found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || filterState !== "all"
              ? "No workflows match your search criteria."
              : "This repository doesn't have any GitHub Actions workflows yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkflows.map((workflow) => {
            const [owner, repo] = selectedRepo.split('/');
            return (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                repoOwner={owner}
                repoName={repo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
