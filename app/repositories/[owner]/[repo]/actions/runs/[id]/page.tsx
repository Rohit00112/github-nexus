"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGitHub } from "../../../../../../context/GitHubContext";
import MainLayout from "../../../../../../components/layout/MainLayout";
import PageHeader from "../../../../../../components/layout/PageHeader";
import WorkflowRunDetail from "../../../../../../components/actions/WorkflowRunDetail";
import {
  buttonStyles,
  Card,
  ErrorState,
  Spinner,
} from "../../../../../../components/ui";

export default function WorkflowRunDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const runId = params.id as string;

  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Confirms the repository exists and is visible to the current token.
    async function checkRepository() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);
        await githubService.getRepository(owner, repo);
      } catch (err) {
        console.error("Error fetching repository:", err);
        setError("Repository not found, or you don't have access to it.");
      } finally {
        setIsLoading(false);
      }
    }

    checkRepository();
  }, [githubService, owner, repo]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <Spinner size={20} label="Loading workflow run" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorState title="Repository unavailable" message={error} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title={`Run #${runId}`}
        description={`${owner}/${repo}`}
        actions={
          <a
            href={`https://github.com/${owner}/${repo}/actions/runs/${runId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles()}
          >
            View on GitHub
          </a>
        }
      />

      <Card className="p-4">
        <WorkflowRunDetail owner={owner} repo={repo} runId={runId} />
      </Card>
    </MainLayout>
  );
}
