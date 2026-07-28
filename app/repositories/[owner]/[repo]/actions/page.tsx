"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGitHub } from "../../../../context/GitHubContext";
import MainLayout from "../../../../components/layout/MainLayout";
import PageHeader from "../../../../components/layout/PageHeader";
import WorkflowList from "../../../../components/actions/WorkflowList";
import {
  buttonStyles,
  Card,
  EmptyState,
  ErrorState,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui";

export default function ActionsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

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
          <Spinner size={20} label="Loading workflows" />
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
      <Tabs defaultValue="workflows">
        <PageHeader
          title="Actions"
          description={`${owner}/${repo}`}
          actions={
            <a
              href={`https://github.com/${owner}/${repo}/actions`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              View on GitHub
            </a>
          }
        >
          <TabsList>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="secrets">Secrets &amp; variables</TabsTrigger>
            <TabsTrigger value="environments">Environments</TabsTrigger>
          </TabsList>
        </PageHeader>

        <TabsContent value="workflows">
          <Card className="p-4">
            <WorkflowList owner={owner} repo={repo} />
          </Card>
        </TabsContent>

        <TabsContent value="secrets">
          <EmptyState
            title="Secrets & variables"
            description="Repository secrets and variables are managed on GitHub."
            action={
              <a
                href={`https://github.com/${owner}/${repo}/settings/secrets/actions`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "primary" })}
              >
                Manage on GitHub
              </a>
            }
          />
        </TabsContent>

        <TabsContent value="environments">
          <EmptyState
            title="Environments"
            description="Deployment environments for these workflows are managed on GitHub."
            action={
              <a
                href={`https://github.com/${owner}/${repo}/settings/environments`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: "primary" })}
              >
                Manage on GitHub
              </a>
            }
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
