"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGitHub } from "../../../../context/GitHubContext";
import MainLayout from "../../../../components/layout/MainLayout";
import PageHeader from "../../../../components/layout/PageHeader";
import DiscussionList from "../../../../components/discussions/DiscussionList";
import CreateDiscussionModal from "../../../../components/discussions/CreateDiscussionModal";
import {
  Button,
  buttonStyles,
  Card,
  ErrorState,
  Spinner,
} from "../../../../components/ui";

export default function DiscussionsPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleDiscussionCreated = (discussionNumber: number) => {
    router.push(`/repositories/${owner}/${repo}/discussions/${discussionNumber}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <Spinner size={20} label="Loading discussions" />
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
        title="Discussions"
        description={`${owner}/${repo}`}
        actions={
          <>
            <a
              href={`https://github.com/${owner}/${repo}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              View on GitHub
            </a>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              New discussion
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <DiscussionList
          owner={owner}
          repo={repo}
          onCreateDiscussion={() => setShowCreateModal(true)}
        />
      </Card>

      <CreateDiscussionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        owner={owner}
        repo={repo}
        onDiscussionCreated={handleDiscussionCreated}
      />
    </MainLayout>
  );
}
