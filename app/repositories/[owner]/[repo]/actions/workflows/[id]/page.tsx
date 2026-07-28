"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGitHub } from "../../../../../../context/GitHubContext";
import type { GitHubWorkflow } from "../../../../../../services/github/githubService";
import MainLayout from "../../../../../../components/layout/MainLayout";
import PageHeader from "../../../../../../components/layout/PageHeader";
import WorkflowRuns from "../../../../../../components/actions/WorkflowRuns";
import {
  Badge,
  Button,
  buttonStyles,
  Card,
  ErrorState,
  Spinner,
  useToast,
} from "../../../../../../components/ui";
import { PlayIcon } from "@heroicons/react/24/outline";

/** Renders the workflow file name from its repo-relative path. */
function fileName(path: string) {
  return path.split("/").pop() || path;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const workflowId = params.id as string;

  const { githubService } = useGitHub();
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<GitHubWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflow() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);

        const workflows = await githubService.getRepositoryWorkflows(owner, repo);
        const matchingWorkflow = workflows.find((wf) => wf.id === workflowId);

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

  const handleTriggerWorkflow = async () => {
    if (!githubService || !workflow) return;

    try {
      setIsTriggering(true);
      // A dispatch needs an explicit ref, so fall back to the default branch.
      const repoData = await githubService.getRepository(owner, repo);
      await githubService.triggerWorkflow(owner, repo, workflow.id, repoData.default_branch);
      toast({
        title: "Workflow triggered",
        description: `${workflow.name} started on ${repoData.default_branch}.`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error triggering workflow:", err);
      toast({
        title: "Could not trigger workflow",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <Spinner size={20} label="Loading workflow" />
        </div>
      </MainLayout>
    );
  }

  if (error || !workflow) {
    return (
      <MainLayout>
        <ErrorState title="Workflow unavailable" message={error ?? "Workflow not found."} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title={workflow.name}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Badge variant={workflow.state === "active" ? "success" : "warning"} size="sm" dot>
              {workflow.state}
            </Badge>
            <span className="font-mono text-xs">{fileName(workflow.path)}</span>
            <span>Updated {formatDate(workflow.updatedAt)}</span>
          </span>
        }
        actions={
          <>
            <a
              href={workflow.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              View on GitHub
            </a>
            <a
              href={`https://github.com/${owner}/${repo}/edit/${workflow.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              Edit workflow
            </a>
            <Button
              variant="primary"
              startIcon={<PlayIcon className="size-4" />}
              onClick={handleTriggerWorkflow}
              loading={isTriggering}
              disabled={workflow.state !== "active"}
            >
              Run workflow
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <WorkflowRuns
          owner={owner}
          repo={repo}
          workflowId={workflow.id}
          workflowName={workflow.name}
        />
      </Card>
    </MainLayout>
  );
}
