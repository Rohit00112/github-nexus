"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGitHub } from "../../../../../../context/GitHubContext";
import MainLayout from "../../../../../../components/layout/MainLayout";
import WorkflowRuns from "../../../../../../components/actions/WorkflowRuns";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip
} from "@nextui-org/react";
import { ArrowLeftIcon, PlayIcon } from "@heroicons/react/24/outline";

export default function WorkflowDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const workflowId = params.id as string;

  const { githubService } = useGitHub();
  const [workflow, setWorkflow] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflow() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all workflows and find the one with matching ID
        const workflows = await githubService.getRepositoryWorkflows(owner, repo);
        const matchingWorkflow = workflows.find((wf: any) => wf.id === workflowId);
        
        if (matchingWorkflow) {
          setWorkflow(matchingWorkflow);
        } else {
          setError("Workflow not found.");
        }
      } catch (err) {
        console.error("Error fetching workflow:", err);
        setError("Failed to fetch workflow details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkflow();
  }, [githubService, owner, repo, workflowId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get file name from path
  const getFileName = (path: string) => {
    return path.split("/").pop() || path;
  };

  // Handle trigger workflow
  const handleTriggerWorkflow = async () => {
    if (!githubService || !workflow) return;
    
    try {
      setIsLoading(true);
      
      // Get the default branch
      const repoData = await githubService.getRepository(owner, repo);
      const defaultBranch = repoData.default_branch;
      
      // Trigger the workflow
      await githubService.triggerWorkflow(owner, repo, workflow.id, defaultBranch);
      
      // Show success message
      alert("Workflow triggered successfully!");
    } catch (err) {
      console.error("Error triggering workflow:", err);
      alert("Failed to trigger workflow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !workflow) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error || "Workflow not found."}
          </div>
          <div className="mt-4">
            <Link href={`/repositories/${owner}/${repo}/actions`} className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Actions
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link href="/repositories" className="hover:text-blue-600 dark:hover:text-blue-400">
              Repositories
            </Link>
            <span>/</span>
            <Link href={`/repositories/${owner}/${repo}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {owner}/{repo}
            </Link>
            <span>/</span>
            <Link href={`/repositories/${owner}/${repo}/actions`} className="hover:text-blue-600 dark:hover:text-blue-400">
              Actions
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-200">{workflow.name}</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{workflow.name}</h1>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <Chip
                    color={workflow.state === "active" ? "success" : "warning"}
                    size="sm"
                  >
                    {workflow.state}
                  </Chip>
                  <div>
                    <span className="font-medium">File:</span> {getFileName(workflow.path)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(workflow.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                color="primary"
                startContent={<PlayIcon className="h-4 w-4" />}
                onPress={handleTriggerWorkflow}
                isDisabled={workflow.state !== "active"}
              >
                Run workflow
              </Button>
              <Button
                as="a"
                href={workflow.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="flat"
              >
                View on GitHub
              </Button>
              <Button
                as="a"
                href={`https://github.com/${owner}/${repo}/edit/${workflow.path}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="flat"
              >
                Edit workflow
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardBody>
            <WorkflowRuns
              owner={owner}
              repo={repo}
              workflowId={workflow.id}
              workflowName={workflow.name}
            />
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
