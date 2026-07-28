"use client";

import { ComponentProps, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../../../components/layout/MainLayout";
import PageHeader from "../../../../components/layout/PageHeader";
import ReviewDetails from "../../../../components/code-review/ReviewDetails";
import FileChanges from "../../../../components/code-review/FileChanges";
import { useGitHub } from "../../../../context/GitHubContext";
import {
  buttonStyles,
  Card,
  ErrorState,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui";

export default function PullRequestReviewPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const pullNumber = parseInt(params.pullNumber as string, 10);

  const { githubService } = useGitHub();
  const [files, setFiles] = useState<ComponentProps<typeof FileChanges>["files"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);
        const filesData = await githubService.getPullRequestFiles(owner, repo, pullNumber);
        setFiles(filesData);
      } catch (err) {
        console.error("Error fetching pull request files:", err);
        setError("Failed to load pull request files. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, [githubService, owner, repo, pullNumber]);

  return (
    <MainLayout>
      <Tabs defaultValue="conversation">
        <PageHeader
          title={`Review #${pullNumber}`}
          description={`${owner}/${repo}`}
          actions={
            <a
              href={`https://github.com/${owner}/${repo}/pull/${pullNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              View on GitHub
            </a>
          }
        >
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="files" count={files.length}>
              Files changed
            </TabsTrigger>
          </TabsList>
        </PageHeader>

        <TabsContent value="conversation">
          <ReviewDetails owner={owner} repo={repo} pullNumber={pullNumber} />
        </TabsContent>

        <TabsContent value="files">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size={20} label="Loading changed files" />
            </div>
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <Card className="p-4">
              <FileChanges files={files} />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
