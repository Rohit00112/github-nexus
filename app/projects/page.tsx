"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../context/GitHubContext";
import MainLayout from "../components/layout/MainLayout";
import ProjectCard from "../components/projects/ProjectCard";
import CreateProjectModal from "../components/projects/CreateProjectModal";

export default function ProjectsPage() {
  const { githubService } = useGitHub();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "repository" | "organization" | "beta">("user");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectsBeta, setProjectsBeta] = useState<any[]>([]);

  // Fetch projects based on active tab
  useEffect(() => {
    async function fetchProjects() {
      if (githubService) {
        try {
          setIsLoading(true);
          setError(null);

          let projectsData: any[] = [];

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
              // Fetch GitHub Projects (beta)
              try {
                const user = await githubService.getCurrentUser();
                const userProjectsBeta = await githubService.getUserProjectsBeta(user.login);
                const orgProjectsBeta = await githubService.getAllOrgProjectsBeta();
                setProjectsBeta([...userProjectsBeta, ...orgProjectsBeta]);
              } catch (betaError) {
                console.error("Error fetching beta projects:", betaError);
                setError("Failed to fetch GitHub Projects (beta). Please try again later.");
              }
              break;
          }

          if (activeTab !== "beta") {
            setProjects(projectsData);
          }
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

  // Handle project creation
  const handleProjectCreated = (newProject: any) => {
    if (
      (activeTab === "user" && !newProject.owner_url) ||
      (activeTab === "repository" && newProject.owner_url && !newProject.organization_url) ||
      (activeTab === "organization" && newProject.organization_url)
    ) {
      setProjects([newProject, ...projects]);
    }
  };

  // Handle project deletion
  const handleProjectDeleted = (projectId: number) => {
    setProjects(projects.filter(project => project.id !== projectId));
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">GitHub Projects</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Project
          </button>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("user")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "user"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Your Projects
              </button>
              <button
                onClick={() => setActiveTab("repository")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "repository"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Repository Projects
              </button>
              <button
                onClick={() => setActiveTab("organization")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "organization"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Organization Projects
              </button>
              <button
                onClick={() => setActiveTab("beta")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "beta"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Projects (Beta)
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === "beta" ? (
          // Display GitHub Projects (beta)
          projectsBeta.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsBeta.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">
                      <a
                        href={`/projects/beta/${project.creator.login}/${project.number}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {project.title}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.shortDescription || "No description provided."}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.closed
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}>
                        {project.closed ? "Closed" : "Open"}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <img src={project.creator.avatarUrl} alt={project.creator.login} className="w-4 h-4 rounded-full mr-1" />
                        <span>{project.creator.login}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex justify-between">
                    <a
                      href={`/projects/beta/${project.creator.login}/${project.number}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details
                    </a>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No GitHub Projects (beta) found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven't created any GitHub Projects (beta) yet.
              </p>
              <a
                href="https://github.com/features/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Learn about GitHub Projects (beta)
              </a>
            </div>
          )
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleProjectDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === "user"
                ? "You haven't created any projects yet."
                : activeTab === "repository"
                ? "No repository projects found."
                : "No organization projects found."}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </MainLayout>
  );
}
