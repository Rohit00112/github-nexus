"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGitHub } from "../../../../context/GitHubContext";
import MainLayout from "../../../../components/layout/MainLayout";
import WorkflowList from "../../../../components/actions/WorkflowList";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Tabs,
  Tab
} from "@nextui-org/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ActionsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("workflows");

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
            <span className="text-gray-900 dark:text-gray-200">Actions</span>
          </div>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">GitHub Actions</h1>
            <Button
              as="a"
              href={`https://github.com/${owner}/${repo}/actions`}
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
            >
              View on GitHub
            </Button>
          </div>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
        >
          <Tab key="workflows" title="Workflows">
            <Card>
              <CardBody>
                <WorkflowList owner={owner} repo={repo} />
              </CardBody>
            </Card>
          </Tab>
          <Tab key="secrets" title="Secrets & Variables">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Secrets & Variables</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage repository secrets and variables for your GitHub Actions workflows.
                  </p>
                  <div className="flex justify-center py-8">
                    <Button
                      as="a"
                      href={`https://github.com/${owner}/${repo}/settings/secrets/actions`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                    >
                      Manage on GitHub
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="environments" title="Environments">
            <Card>
              <CardBody>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Environments</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage deployment environments for your GitHub Actions workflows.
                  </p>
                  <div className="flex justify-center py-8">
                    <Button
                      as="a"
                      href={`https://github.com/${owner}/${repo}/settings/environments`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                    >
                      Manage on GitHub
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </MainLayout>
  );
}
