"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGitHub } from "../../../../context/GitHubContext";
import MainLayout from "../../../../components/layout/MainLayout";
import DiscussionList from "../../../../components/discussions/DiscussionList";
import CreateDiscussionModal from "../../../../components/discussions/CreateDiscussionModal";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner
} from "@nextui-org/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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

  // Handle discussion created
  const handleDiscussionCreated = (discussionNumber: number) => {
    // Navigate to the newly created discussion
    router.push(`/repositories/${owner}/${repo}/discussions/${discussionNumber}`);
  };

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
            <Link href="/repositories" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Repositories
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
            <span className="text-gray-900 dark:text-gray-200">Discussions</span>
          </div>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Discussions</h1>
            <Button
              as="a"
              href={`https://github.com/${owner}/${repo}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
            >
              View on GitHub
            </Button>
          </div>
        </div>

        <Card>
          <CardBody>
            <DiscussionList
              owner={owner}
              repo={repo}
              onCreateDiscussion={() => setShowCreateModal(true)}
            />
          </CardBody>
        </Card>

        <CreateDiscussionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          owner={owner}
          repo={repo}
          onDiscussionCreated={handleDiscussionCreated}
        />
      </div>
    </MainLayout>
  );
}
