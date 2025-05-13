"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGitHub } from "../../../../../../context/GitHubContext";
import MainLayout from "../../../../../../components/layout/MainLayout";
import WorkflowRunDetail from "../../../../../../components/actions/WorkflowRunDetail";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner
} from "@nextui-org/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function WorkflowRunDetailPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const runId = params.id as string;

  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Just to check if the repository exists
    async function checkRepository() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        await githubService.getRepository(owner, repo);
      } catch (err) {
        console.error("Error fetching repository:", err);
        setError("Repository not found or you don't have access to it.");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkRepository();
  }, [githubService, owner, repo]);

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

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error}
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
            <span className="text-gray-900 dark:text-gray-200">Run</span>
          </div>
        </div>

        <Card>
          <CardBody>
            <WorkflowRunDetail
              owner={owner}
              repo={repo}
              runId={runId}
            />
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
}
