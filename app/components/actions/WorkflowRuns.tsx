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
  StopIcon, 
  ArrowPathIcon, 
  EllipsisVerticalIcon,
  DocumentTextIcon,
  ClockIcon,
  CodeBracketIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface WorkflowRun {
  id: string;
  runNumber: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  conclusion: string | null;
  url: string;
  event: string;
  headBranch: string;
  headCommit: {
    message: string;
    committedDate: string;
    author: {
      name: string;
      email: string;
      avatarUrl: string;
    };
  };
}

interface WorkflowRunsProps {
  owner: string;
  repo: string;
  workflowId: string;
  workflowName: string;
}

export default function WorkflowRuns({ owner, repo, workflowId, workflowName }: WorkflowRunsProps) {
  const { githubService } = useGitHub();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflowRuns() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const runsData = await githubService.getWorkflowRuns(owner, repo, workflowId);
        setRuns(runsData);
      } catch (err) {
        console.error("Error fetching workflow runs:", err);
        setError("Failed to fetch workflow runs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkflowRuns();
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

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      if (conclusion === "success") return "success";
      if (conclusion === "failure") return "danger";
      if (conclusion === "cancelled") return "warning";
      return "default";
    }
    if (status === "in_progress") return "primary";
    if (status === "queued") return "secondary";
    return "default";
  };

  // Get status label
  const getStatusLabel = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      if (conclusion === "success") return "Success";
      if (conclusion === "failure") return "Failed";
      if (conclusion === "cancelled") return "Cancelled";
      return conclusion || "Completed";
    }
    if (status === "in_progress") return "In Progress";
    if (status === "queued") return "Queued";
    return status;
  };

  // Handle rerun workflow
  const handleRerunWorkflow = async (runId: string) => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      await githubService.rerunWorkflow(runId);
      
      // Refresh the runs list
      const runsData = await githubService.getWorkflowRuns(owner, repo, workflowId);
      setRuns(runsData);
      
      alert("Workflow rerun triggered successfully!");
    } catch (err) {
      console.error("Error rerunning workflow:", err);
      alert("Failed to rerun workflow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel workflow
  const handleCancelWorkflow = async (runId: string) => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      await githubService.cancelWorkflowRun(runId);
      
      // Refresh the runs list
      const runsData = await githubService.getWorkflowRuns(owner, repo, workflowId);
      setRuns(runsData);
      
      alert("Workflow cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling workflow:", err);
      alert("Failed to cancel workflow. Please try again.");
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{workflowName} Runs</h2>
        <Button
          color="primary"
          startContent={<PlayIcon className="h-4 w-4" />}
          onPress={() => {
            // Trigger workflow
          }}
        >
          Run workflow
        </Button>
      </div>
      
      {runs.length > 0 ? (
        <Table aria-label="Workflow runs table">
          <TableHeader>
            <TableColumn>RUN</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>EVENT</TableColumn>
            <TableColumn>BRANCH</TableColumn>
            <TableColumn>COMMIT</TableColumn>
            <TableColumn>CREATED</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <Link 
                    href={`/repositories/${owner}/${repo}/actions/runs/${run.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    #{run.runNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <Chip
                    color={getStatusColor(run.status, run.conclusion)}
                    size="sm"
                  >
                    {getStatusLabel(run.status, run.conclusion)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip variant="flat" size="sm">
                    {run.event}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{run.headBranch}</span>
                </TableCell>
                <TableCell>
                  <Tooltip content={run.headCommit.message}>
                    <div className="flex items-center">
                      <CodeBracketIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm truncate max-w-[150px]">
                        {run.headCommit.message.split("\n")[0]}
                      </span>
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip content={new Date(run.createdAt).toLocaleString()}>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(run.createdAt)} {formatTime(run.createdAt)}
                      </span>
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {run.status === "in_progress" || run.status === "queued" ? (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleCancelWorkflow(run.id)}
                      >
                        <StopIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleRerunWorkflow(run.id)}
                        isDisabled={run.status !== "completed"}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      as="a"
                      href={`/repositories/${owner}/${repo}/actions/runs/${run.id}`}
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
                      <DropdownMenu aria-label="Run actions">
                        <DropdownItem
                          as="a"
                          href={run.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on GitHub
                        </DropdownItem>
                        <DropdownItem
                          as="a"
                          href={`https://github.com/${owner}/${repo}/commit/${run.headBranch}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View commit
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No workflow runs found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This workflow hasn't been run yet.
              </p>
              <Button
                color="primary"
                startContent={<PlayIcon className="h-4 w-4" />}
                onPress={() => {
                  // Trigger workflow
                }}
              >
                Run workflow
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
