"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon, 
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface Workflow {
  id: string;
  name: string;
  state: string;
  url: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowListProps {
  owner: string;
  repo: string;
}

export default function WorkflowList({ owner, repo }: WorkflowListProps) {
  const { githubService } = useGitHub();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflows() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const workflowsData = await githubService.getRepositoryWorkflows(owner, repo);
        setWorkflows(workflowsData);
      } catch (err) {
        console.error("Error fetching workflows:", err);
        setError("Failed to fetch workflows. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkflows();
  }, [githubService, owner, repo]);

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
  const handleTriggerWorkflow = async (workflowId: string) => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      
      // Get the default branch
      const repoData = await githubService.getRepository(owner, repo);
      const defaultBranch = repoData.default_branch;
      
      // Trigger the workflow
      await githubService.triggerWorkflow(owner, repo, workflowId, defaultBranch);
      
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
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Workflows</h2>
      
      {workflows.length > 0 ? (
        <Table aria-label="Workflows table">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>STATE</TableColumn>
            <TableColumn>FILE</TableColumn>
            <TableColumn>UPDATED</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell>
                  <Link 
                    href={`/repositories/${owner}/${repo}/actions/workflows/${workflow.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {workflow.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Chip
                    color={workflow.state === "active" ? "success" : "warning"}
                    size="sm"
                  >
                    {workflow.state}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Tooltip content={workflow.path}>
                    <span className="cursor-help">
                      {getFileName(workflow.path)}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip content={new Date(workflow.updatedAt).toLocaleString()}>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                      {formatDate(workflow.updatedAt)}
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleTriggerWorkflow(workflow.id)}
                      isDisabled={workflow.state !== "active"}
                    >
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      as="a"
                      href={`/repositories/${owner}/${repo}/actions/workflows/${workflow.id}`}
                      isIconOnly
                      size="sm"
                      variant="light"
                    >
                      <DocumentTextIcon className="h-4 w-4" />
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Workflow actions">
                        <DropdownItem
                          as="a"
                          href={workflow.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on GitHub
                        </DropdownItem>
                        <DropdownItem
                          as="a"
                          href={`https://github.com/${owner}/${repo}/edit/${workflow.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Edit workflow file
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardBody className="py-8">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No workflows found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This repository doesn't have any GitHub Actions workflows yet.
              </p>
              <Button
                as="a"
                href={`https://github.com/${owner}/${repo}/actions/new`}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                Create a workflow
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
