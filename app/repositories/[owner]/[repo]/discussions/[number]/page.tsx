"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGitHub } from "../../../../../context/GitHubContext";
import MainLayout from "../../../../../components/layout/MainLayout";
import PageHeader from "../../../../../components/layout/PageHeader";
import DiscussionDetail from "../../../../../components/discussions/DiscussionDetail";
import {
  buttonStyles,
  Card,
  ErrorState,
  Spinner,
} from "../../../../../components/ui";

export default function DiscussionDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const discussionNumber = parseInt(params.number as string, 10);

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
          <Spinner size={20} label="Loading discussion" />
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
        title={`Discussion #${discussionNumber}`}
        description={`${owner}/${repo}`}
        actions={
          <a
            href={`https://github.com/${owner}/${repo}/discussions/${discussionNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles()}
          >
            View on GitHub
          </a>
        }
      />

      <Card className="p-4">
        <DiscussionDetail owner={owner} repo={repo} discussionNumber={discussionNumber} />
      </Card>
    </MainLayout>
  );
}
