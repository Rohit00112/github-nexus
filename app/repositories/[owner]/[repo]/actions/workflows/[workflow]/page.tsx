"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../../../../../components/layout/MainLayout";
import { useAuth } from "../../../../../../hooks/useAuth";
import { useGitHub } from "../../../../../../context/GitHubContext";
import { GitHubWorkflow, GitHubWorkflowRun } from "../../../../../../types/github";
import WorkflowRunCard from "../../../../../../components/actions/WorkflowRunCard";
import LoadingSpinner from "../../../../../../components/ui/LoadingSpinner";

interface WorkflowDetailPageProps {
  params: {
    owner: string;
    repo: string;
    workflow: string;
  };
}

export default function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  // Access params safely
  const ownerName = Array.isArray(params.owner) ? params.owner[0] : params.owner;
  const repoName = Array.isArray(params.repo) ? params.repo[0] : params.repo;
  const workflowId = Array.isArray(params.workflow) ? params.workflow[0] : params.workflow;
  
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  
  const [workflow, setWorkflow] = useState<GitHubWorkflow | null>(null);
  const [workflowRuns, setWorkflowRuns] = useState<GitHubWorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [branchRef, setBranchRef] = useState("main");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);
  
  useEffect(() => {
    async function fetchWorkflowAndRuns() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);
          
          const workflowData = await githubService.getWorkflow(ownerName, repoName, parseInt(workflowId));
          setWorkflow(workflowData);
          
          const runsData = await githubService.getWorkflowRuns(ownerName, repoName, parseInt(workflowId));
          setWorkflowRuns(runsData);
        } catch (err) {
          console.error("Error fetching workflow:", err);
          setError("Failed to fetch workflow. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchWorkflowAndRuns();
  }, [githubService, githubLoading, ownerName, repoName, workflowId]);
  
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
  
  const handleDispatchWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflow) return;
    
    try {
      setIsSubmitting(true);
      
      await githubService?.triggerWorkflow(
        ownerName,
        repoName,
        parseInt(workflowId),
        branchRef
      );
      
      setShowDispatchModal(false);
      
      // Refresh the workflow runs after a short delay
      setTimeout(async () => {
        const runsData = await githubService?.getWorkflowRuns(ownerName, repoName, parseInt(workflowId));
        if (runsData) {
          setWorkflowRuns(runsData);
        }
      }, 2000);
    } catch (err) {
      console.error("Error dispatching workflow:", err);
      alert("Failed to dispatch workflow. Please try again.");
    } finally {
      setIsSubmitting(false);
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
  
  if (!workflow) {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Workflow not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The workflow you're looking for doesn't exist or you don't have permission to view it.
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
              <h1 className="text-2xl font-bold">{workflow.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Last updated on {formatDate(workflow.updated_at)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                workflow.state === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {workflow.state}
              </span>
              
              <button
                onClick={() => setShowDispatchModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Run workflow
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href={workflow.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              View workflow file
            </Link>
            
            <Link 
              href={workflow.badge_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              View status badge
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Workflow Runs</h2>
          
          {workflowRuns.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No workflow runs found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This workflow hasn't been run yet.
              </p>
              <button
                onClick={() => setShowDispatchModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Run workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workflowRuns.map((run) => (
                <WorkflowRunCard 
                  key={run.id} 
                  workflowRun={run} 
                  repoOwner={ownerName}
                  repoName={repoName}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Dispatch Workflow Modal */}
        {showDispatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Run Workflow</h3>
              
              <form onSubmit={handleDispatchWorkflow}>
                <div className="mb-4">
                  <label htmlFor="branch-ref" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch or tag
                  </label>
                  <input
                    id="branch-ref"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={branchRef}
                    onChange={(e) => setBranchRef(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    The branch or tag reference where the workflow will run.
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onClick={() => setShowDispatchModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Running...' : 'Run workflow'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
