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
  Accordion,
  AccordionItem,
  Divider,
  Progress,
  Tooltip
} from "@nextui-org/react";
import { 
  ArrowPathIcon, 
  StopIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface WorkflowRunJob {
  id: string;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt: string;
  completedAt: string | null;
  steps: {
    nodes: Array<{
      name: string;
      status: string;
      conclusion: string | null;
      number: number;
      startedAt: string;
      completedAt: string | null;
    }>;
  };
}

interface WorkflowRunDetailProps {
  owner: string;
  repo: string;
  runId: string;
}

export default function WorkflowRunDetail({ owner, repo, runId }: WorkflowRunDetailProps) {
  const { githubService } = useGitHub();
  const [run, setRun] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logsUrl, setLogsUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflowRun() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const runData = await githubService.getWorkflowRun(runId);
        setRun(runData);
        
        // Get logs URL
        try {
          const logsUrlData = await githubService.getWorkflowRunLogs(owner, repo, parseInt(runData.runNumber, 10));
          setLogsUrl(logsUrlData);
        } catch (logsError) {
          console.error("Error fetching logs URL:", logsError);
        }
      } catch (err) {
        console.error("Error fetching workflow run:", err);
        setError("Failed to fetch workflow run details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkflowRun();
  }, [githubService, owner, repo, runId]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Calculate duration
  const calculateDuration = (startDate: string, endDate: string | null) => {
    if (!startDate || !endDate) return "In progress";
    
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

  // Get status icon
  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      if (conclusion === "success") return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      if (conclusion === "failure") return <XCircleIcon className="h-5 w-5 text-red-500" />;
      if (conclusion === "cancelled") return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      return null;
    }
    if (status === "in_progress") return <Spinner size="sm" />;
    return null;
  };

  // Handle rerun workflow
  const handleRerunWorkflow = async () => {
    if (!githubService || !run) return;
    
    try {
      setIsLoading(true);
      await githubService.rerunWorkflow(runId);
      
      // Refresh the run data
      const runData = await githubService.getWorkflowRun(runId);
      setRun(runData);
      
      alert("Workflow rerun triggered successfully!");
    } catch (err) {
      console.error("Error rerunning workflow:", err);
      alert("Failed to rerun workflow. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel workflow
  const handleCancelWorkflow = async () => {
    if (!githubService || !run) return;
    
    try {
      setIsLoading(true);
      await githubService.cancelWorkflowRun(runId);
      
      // Refresh the run data
      const runData = await githubService.getWorkflowRun(runId);
      setRun(runData);
      
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

  if (error || !run) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error || "Failed to load workflow run details."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">
              Workflow Run #{run.runNumber}
            </h2>
            <Chip
              color={getStatusColor(run.status, run.conclusion)}
              size="sm"
            >
              {getStatusLabel(run.status, run.conclusion)}
            </Chip>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div>
                <span className="font-medium">Event:</span> {run.event}
              </div>
              <div>
                <span className="font-medium">Branch:</span> {run.headBranch}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(run.createdAt)}
              </div>
            </div>
            <div className="mt-1">
              <span className="font-medium">Commit:</span> {run.headCommit.message}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {run.status === "in_progress" || run.status === "queued" ? (
            <Button
              color="danger"
              variant="flat"
              startContent={<StopIcon className="h-4 w-4" />}
              onPress={handleCancelWorkflow}
            >
              Cancel
            </Button>
          ) : (
            <Button
              color="primary"
              variant="flat"
              startContent={<ArrowPathIcon className="h-4 w-4" />}
              onPress={handleRerunWorkflow}
              isDisabled={run.status !== "completed"}
            >
              Re-run
            </Button>
          )}
          {logsUrl && (
            <Button
              as="a"
              href={logsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
              startContent={<DocumentTextIcon className="h-4 w-4" />}
            >
              Download Logs
            </Button>
          )}
          <Button
            as="a"
            href={run.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="flat"
          >
            View on GitHub
          </Button>
        </div>
      </div>

      <Divider />

      <div>
        <h3 className="text-lg font-medium mb-4">Jobs</h3>
        <Accordion>
          {run.jobs.nodes.map((job: WorkflowRunJob) => (
            <AccordionItem
              key={job.id}
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status, job.conclusion)}
                    <span>{job.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <ClockIcon className="inline h-4 w-4 mr-1" />
                      {calculateDuration(job.startedAt, job.completedAt)}
                    </div>
                    <Chip
                      color={getStatusColor(job.status, job.conclusion)}
                      size="sm"
                    >
                      {getStatusLabel(job.status, job.conclusion)}
                    </Chip>
                  </div>
                </div>
              }
            >
              <div className="space-y-4 pl-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div><span className="font-medium">Started:</span> {formatDate(job.startedAt)}</div>
                  {job.completedAt && (
                    <div><span className="font-medium">Completed:</span> {formatDate(job.completedAt)}</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Steps</h4>
                  {job.steps.nodes.map((step) => (
                    <Card key={step.number} shadow="sm" className="border border-gray-200 dark:border-gray-700">
                      <CardBody className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(step.status, step.conclusion)}
                            <span className="font-medium">{step.number}. {step.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            {step.startedAt && (
                              <div>
                                <ClockIcon className="inline h-4 w-4 mr-1" />
                                {calculateDuration(step.startedAt, step.completedAt)}
                              </div>
                            )}
                            <Chip
                              color={getStatusColor(step.status, step.conclusion)}
                              size="sm"
                            >
                              {getStatusLabel(step.status, step.conclusion)}
                            </Chip>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
