"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../context/GitHubContext";
import MainLayout from "../components/layout/MainLayout";
import Image from "next/image";
import ProjectCard from "../components/projects/ProjectCard";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import type {
  ClassicProject,
  ProjectBetaSummary,
} from "../services/github/githubService";

export default function ProjectsPage() {
  const { githubService } = useGitHub();
  const [projects, setProjects] = useState<ClassicProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "repository" | "organization" | "beta">("user");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectsBeta, setProjectsBeta] = useState<ProjectBetaSummary[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      if (githubService) {
        try {
          setIsLoading(true);
          setError(null);
          let projectsData: ClassicProject[] = [];
          switch (activeTab) {
            case "user":
              const user = await githubService.getCurrentUser();
              projectsData = await githubService.getUserProjects(user.login);
              break;
            case "repository":
              projectsData = await githubService.getAllRepositoryProjects();
              break;
            case "organization":
              projectsData = await githubService.getAllOrganizationProjects();
              break;
            case "beta":
              try {
                const userBeta = await githubService.getCurrentUser();
                const userProjectsBeta = await githubService.getUserProjectsBeta(userBeta.login);
                const orgProjectsBeta = await githubService.getAllOrgProjectsBeta();
                setProjectsBeta([...userProjectsBeta, ...orgProjectsBeta]);
              } catch (betaError) {
                console.error("Error fetching beta projects:", betaError);
                setError("Failed to fetch GitHub Projects (beta). Please try again later.");
              }
              break;
          }
          if (activeTab !== "beta") setProjects(projectsData);
        } catch (err) {
          console.error("Error fetching projects:", err);
          setError("Failed to fetch projects. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchProjects();
  }, [githubService, activeTab]);

  const handleProjectCreated = (newProject: ClassicProject) => {
    if (
      (activeTab === "user" && !newProject.owner_url) ||
      (activeTab === "repository" && newProject.owner_url && !newProject.organization_url) ||
      (activeTab === "organization" && newProject.organization_url)
    ) {
      setProjects([newProject, ...projects]);
    }
  };

  const handleProjectDeleted = (projectId: number) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  const tabs = [
    { key: "user" as const, label: "Your Projects" },
    { key: "repository" as const, label: "Repository" },
    { key: "organization" as const, label: "Organization" },
    { key: "beta" as const, label: "Projects (Beta)" },
  ];

  return (
    <MainLayout>
      <div className="py-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GitHub Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track your GitHub projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg flex items-center text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Project
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2.5 px-4 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm mb-6">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : activeTab === "beta" ? (
          projectsBeta.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsBeta.map(project => (
                <div key={project.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-5">
                    <h3 className="text-base font-semibold mb-2">
                      <a href={`/projects/beta/${project.creator.login}/${project.number}`} className="text-primary hover:underline">
                        {project.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.shortDescription || "No description provided."}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.closed ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}>
                        {project.closed ? "Closed" : "Open"}
                      </span>
                      <span className="text-border">•</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="text-border">•</span>
                      <div className="flex items-center">
                        <Image src={project.creator.avatarUrl} alt={project.creator.login} className="w-4 h-4 rounded-full mr-1" unoptimized width={16} height={16} />
                        <span>{project.creator.login}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/50 px-5 py-3 flex justify-between items-center">
                    <a href={`/projects/beta/${project.creator.login}/${project.number}`} className="text-sm text-primary hover:underline">View Details</a>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">View on GitHub</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No GitHub Projects (beta) found</h3>
              <p className="text-sm text-muted-foreground mb-6">You haven&apos;t created any GitHub Projects (beta) yet.</p>
              <a href="https://github.com/features/issues" target="_blank" rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-5 rounded-lg text-sm transition-colors inline-block">
                Learn about GitHub Projects (beta)
              </a>
            </div>
          )
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} onDelete={handleProjectDeleted} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {activeTab === "user" ? "You haven't created any projects yet." : activeTab === "repository" ? "No repository projects found." : "No organization projects found."}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-5 rounded-lg text-sm transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onProjectCreated={handleProjectCreated} />
      )}
    </MainLayout>
  );
}
