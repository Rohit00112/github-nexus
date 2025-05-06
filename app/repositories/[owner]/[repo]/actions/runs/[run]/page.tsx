"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../../../../../components/layout/MainLayout";
import { useAuth } from "../../../../../../hooks/useAuth";
import { useGitHub } from "../../../../../../context/GitHubContext";
import { GitHubWorkflowRun, GitHubWorkflowJob } from "../../../../../../types/github";
import LoadingSpinner from "../../../../../../components/ui/LoadingSpinner";

interface WorkflowRunDetailPageProps {
  params: {
    owner: string;
    repo: string;
    run: string;
  };
}

export default function WorkflowRunDetailPage({ params }: WorkflowRunDetailPageProps) {
  // Access params safely
  const ownerName = Array.isArray(params.owner) ? params.owner[0] : params.owner;
  const repoName = Array.isArray(params.repo) ? params.repo[0] : params.repo;
  const runId = Array.isArray(params.run) ? params.run[0] : params.run;

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();

  const [workflowRun, setWorkflowRun] = useState<GitHubWorkflowRun | null>(null);
  const [jobs, setJobs] = useState<GitHubWorkflowJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchWorkflowRunAndJobs() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);

          const runData = await githubService.getWorkflowRun(ownerName, repoName, parseInt(runId));
          setWorkflowRun(runData);

          const jobsData = await githubService.getWorkflowRunJobs(ownerName, repoName, parseInt(runId));
          setJobs(jobsData);
        } catch (err) {
          console.error("Error fetching workflow run:", err);
          setError("Failed to fetch workflow run. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchWorkflowRunAndJobs();
  }, [githubService, githubLoading, ownerName, repoName, runId]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate duration between two dates
  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return "In progress";

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const durationMs = end - start;

    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds} seconds`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  // Get status color
  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'failure':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'cancelled':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'skipped':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      }
    } else if (status === 'in_progress') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (status === 'queued') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get status label
  const getStatusLabel = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      return conclusion ? conclusion.charAt(0).toUpperCase() + conclusion.slice(1) : 'Completed';
    } else if (status === 'in_progress') {
      return 'In progress';
    } else if (status === 'queued') {
      return 'Queued';
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      switch (conclusion) {
        case 'success':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          );
        case 'failure':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          );
        case 'cancelled':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          );
        default:
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          );
      }
    } else if (status === 'in_progress') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 animate-spin" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      );
    } else if (status === 'queued') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const handleRerunWorkflow = async () => {
    if (!workflowRun) return;

    try {
      setIsRerunning(true);

      await githubService?.rerunWorkflow(
        ownerName,
        repoName,
        parseInt(runId)
      );

      // Refresh the workflow run data after a short delay
      setTimeout(async () => {
        const runData = await githubService?.getWorkflowRun(ownerName, repoName, parseInt(runId));
        if (runData) {
          setWorkflowRun(runData);
        }
      }, 2000);
    } catch (err) {
      console.error("Error re-running workflow:", err);
      alert("Failed to re-run workflow. Please try again.");
    } finally {
      setIsRerunning(false);
    }
  };

  const handleCancelWorkflow = async () => {
    if (!workflowRun) return;

    try {
      setIsCancelling(true);

      await githubService?.cancelWorkflowRun(
        ownerName,
        repoName,
        parseInt(runId)
      );

      // Refresh the workflow run data after a short delay
      setTimeout(async () => {
        const runData = await githubService?.getWorkflowRun(ownerName, repoName, parseInt(runId));
        if (runData) {
          setWorkflowRun(runData);
        }
      }, 2000);
    } catch (err) {
      console.error("Error cancelling workflow:", err);
      alert("Failed to cancel workflow. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading || githubLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
          {error}
        </div>
      </MainLayout>
    );
  }

  if (!workflowRun) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Workflow run not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The workflow run you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/actions"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Back to Actions
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-6">
        <div className="mb-6">
          <Link
            href={`/repositories/${ownerName}/${repoName}/actions`}
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Actions
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                {getStatusIcon(workflowRun.status, workflowRun.conclusion)}
                <span className="ml-2">{workflowRun.name} <span className="text-gray-500">#{workflowRun.run_number}</span></span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Triggered by {workflowRun.event} event on {formatDate(workflowRun.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workflowRun.status, workflowRun.conclusion)}`}>
                {getStatusLabel(workflowRun.status, workflowRun.conclusion)}
              </span>

              {workflowRun.status === 'completed' && workflowRun.conclusion !== 'success' && (
                <button
                  onClick={handleRerunWorkflow}
                  disabled={isRerunning}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {isRerunning ? 'Re-running...' : 'Re-run workflow'}
                </button>
              )}

              {(workflowRun.status === 'in_progress' || workflowRun.status === 'queued') && (
                <button
                  onClick={handleCancelWorkflow}
                  disabled={isCancelling}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel workflow'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workflow Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-medium">{getStatusLabel(workflowRun.status, workflowRun.conclusion)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Workflow:</span>
                  <Link
                    href={workflowRun.workflow_url.replace('https://api.github.com/repos', `/repositories`).replace('/actions/workflows', '/actions/workflows')}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {workflowRun.name}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Run number:</span>
                  <span className="font-medium">#{workflowRun.run_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Run attempt:</span>
                  <span className="font-medium">#{workflowRun.run_attempt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Event:</span>
                  <span className="font-medium">{workflowRun.event}</span>
                </div>
                {workflowRun.status === 'completed' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium">{calculateDuration(workflowRun.run_started_at, workflowRun.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commit Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Branch:</span>
                  <span className="font-medium">{workflowRun.head_branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Commit:</span>
                  <span className="font-mono">{workflowRun.head_sha.substring(0, 7)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Message:</span>
                  <span className="font-medium truncate max-w-[200px]">{workflowRun.head_commit.message}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Author:</span>
                  <span className="font-medium">{workflowRun.head_commit.author.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                  <span className="font-medium">{formatDate(workflowRun.head_commit.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              href={workflowRun.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              View on GitHub
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Jobs</h2>

          {jobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This workflow run doesn't have any jobs yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(job.status, job.conclusion)}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold">
                            {job.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(job.status, job.conclusion)}`}>
                            {getStatusLabel(job.status, job.conclusion)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Started at {formatDate(job.started_at)}
                          {job.completed_at && ` • Completed at ${formatDate(job.completed_at)}`}
                          {job.completed_at && ` • Duration: ${calculateDuration(job.started_at, job.completed_at)}`}
                        </div>

                        {job.steps && job.steps.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Steps</h4>
                            <div className="space-y-2">
                              {job.steps.map((step) => (
                                <div key={step.number} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      {step.status === 'completed' ? (
                                        step.conclusion === 'success' ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                          </svg>
                                        )
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 animate-spin mr-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      <span className="font-medium">{step.name}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(step.status, step.conclusion)}`}>
                                      {getStatusLabel(step.status, step.conclusion)}
                                    </span>
                                  </div>
                                  {step.completed_at && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      Duration: {calculateDuration(step.started_at, step.completed_at)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3">
                          <Link
                            href={job.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            View job details on GitHub
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}