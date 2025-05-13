"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGitHub } from "../../../../context/GitHubContext";
import MainLayout from "../../../../components/layout/MainLayout";
import ProjectBetaBoard from "../../../../components/projects/ProjectBetaBoard";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Tabs,
  Tab,
  Textarea,
  Input
} from "@nextui-org/react";
import { PencilIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ProjectBetaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const number = parseInt(params.number as string, 10);

  const { githubService } = useGitHub();
  const [project, setProject] = useState<any | null>(null);
  const [projectItems, setProjectItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [activeView, setActiveView] = useState("board");

  // Fetch project details
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch project details
        const projectData = await githubService.getProjectBeta(owner, number);
        setProject(projectData);
        setProjectTitle(projectData.title);
        setProjectDescription(projectData.shortDescription || "");

        // Fetch project items
        const itemsData = await githubService.getProjectItems(projectData.id);
        setProjectItems(itemsData);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectDetails();
  }, [githubService, owner, number]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle item added
  const handleItemAdded = async () => {
    if (!githubService || !project) return;
    
    try {
      setIsLoading(true);
      const itemsData = await githubService.getProjectItems(project.id);
      setProjectItems(itemsData);
    } catch (error) {
      console.error("Error refreshing project items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item updated
  const handleItemUpdated = async () => {
    if (!githubService || !project) return;
    
    try {
      setIsLoading(true);
      const itemsData = await githubService.getProjectItems(project.id);
      setProjectItems(itemsData);
    } catch (error) {
      console.error("Error refreshing project items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !project) {
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
            <Link href="/projects" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Projects
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
            Project not found.
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Projects
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
            <Link href="/projects" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Projects
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-200">{project.title}</span>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="mb-2">
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="text-2xl font-bold"
                    placeholder="Project title"
                    autoFocus
                  />
                  <div className="flex mt-2 space-x-2">
                    <Button
                      color="primary"
                      isDisabled={!projectTitle.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      color="default"
                      variant="light"
                      onPress={() => {
                        setProjectTitle(project.title);
                        setIsEditingTitle(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <h1 className="text-2xl font-bold flex items-center">
                  {project.title}
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => setIsEditingTitle(true)}
                    className="ml-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </h1>
              )}

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <Chip
                  color={project.closed ? "danger" : "success"}
                  size="sm"
                >
                  {project.closed ? "Closed" : "Open"}
                </Chip>
                <span className="mx-2">•</span>
                <span>Created: {formatDate(project.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>Updated: {formatDate(project.updatedAt)}</span>
                <span className="mx-2">•</span>
                <span>Creator: {project.creator.login}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                as="a"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="flat"
                startContent={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>}
              >
                View on GitHub
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {isEditingDescription ? (
              <div>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Project description (optional)"
                  minRows={3}
                />
                <div className="flex mt-2 space-x-2">
                  <Button
                    color="primary"
                  >
                    Save
                  </Button>
                  <Button
                    color="default"
                    variant="light"
                    onPress={() => {
                      setProjectDescription(project.shortDescription || "");
                      setIsEditingDescription(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md relative group">
                {project.shortDescription ? (
                  <div className="prose dark:prose-invert max-w-none">
                    {project.shortDescription}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided.
                  </p>
                )}
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setIsEditingDescription(true)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Tabs
            selectedKey={activeView}
            onSelectionChange={(key) => setActiveView(key as string)}
          >
            <Tab key="board" title="Board">
              <Card>
                <CardBody>
                  <ProjectBetaBoard
                    projectId={project.id}
                    fields={project.fields.nodes}
                    items={projectItems}
                    onItemAdded={handleItemAdded}
                    onItemUpdated={handleItemUpdated}
                  />
                </CardBody>
              </Card>
            </Tab>
            <Tab key="fields" title="Fields">
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Project Fields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.fields.nodes.map((field: any) => (
                        <Card key={field.id} shadow="sm">
                          <CardBody className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{field.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Type: {field.dataType}
                                </p>
                              </div>
                            </div>
                            {field.dataType === "SINGLE_SELECT" && field.options && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Options:</p>
                                <div className="flex flex-wrap gap-1">
                                  {field.options.map((option: any) => (
                                    <Chip
                                      key={option.id}
                                      size="sm"
                                      style={{
                                        backgroundColor: `#${option.color}`,
                                        color: parseInt(option.color, 16) > 0xffffff / 2 ? '#000' : '#fff'
                                      }}
                                    >
                                      {option.name}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab key="views" title="Views">
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Project Views</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.views.nodes.map((view: any) => (
                        <Card key={view.id} shadow="sm">
                          <CardBody className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{view.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Layout: {view.layout}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
