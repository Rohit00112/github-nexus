"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
}

interface Organization {
  login: string;
  avatar_url: string;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectModalProps) {
  const { githubService } = useGitHub();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [projectType, setProjectType] = useState<"user" | "repository" | "organization">("user");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        
        // Fetch repositories and organizations in parallel
        const [reposData, orgsData] = await Promise.all([
          githubService.getUserRepositories(),
          githubService.getUserOrganizations(),
        ]);
        
        setRepositories(reposData);
        setOrganizations(orgsData);
        
        // Set default selections if available
        if (reposData.length > 0) {
          setSelectedRepo(reposData[0].full_name);
        }
        
        if (orgsData.length > 0) {
          setSelectedOrg(orgsData[0].login);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load repositories and organizations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isOpen) {
      fetchData();
    }
  }, [githubService, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubService || !name.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let project;
      
      if (projectType === "user") {
        // Create user project
        project = await githubService.createProject({
          owner: "",
          name,
          body,
        });
      } else if (projectType === "repository" && selectedRepo) {
        // Create repository project
        const [owner, repo] = selectedRepo.split("/");
        project = await githubService.createProject({
          owner,
          repo,
          name,
          body,
        });
      } else if (projectType === "organization" && selectedOrg) {
        // Create organization project
        project = await githubService.createProject({
          owner: "",
          org: selectedOrg,
          name,
          body,
        });
      } else {
        setError("Invalid project type or selection");
        setIsLoading(false);
        return;
      }
      
      onProjectCreated(project);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setBody("");
    setProjectType("user");
    setSelectedRepo(repositories.length > 0 ? repositories[0].full_name : "");
    setSelectedOrg(organizations.length > 0 ? organizations[0].login : "");
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="project-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Type
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="project-type"
                  value="user"
                  checked={projectType === "user"}
                  onChange={() => setProjectType("user")}
                />
                <span className="ml-2">User Project</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="project-type"
                  value="repository"
                  checked={projectType === "repository"}
                  onChange={() => setProjectType("repository")}
                  disabled={repositories.length === 0}
                />
                <span className="ml-2">Repository Project</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="project-type"
                  value="organization"
                  checked={projectType === "organization"}
                  onChange={() => setProjectType("organization")}
                  disabled={organizations.length === 0}
                />
                <span className="ml-2">Organization Project</span>
              </label>
            </div>
          </div>
          
          {projectType === "repository" && (
            <div className="mb-4">
              <label htmlFor="repository" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repository
              </label>
              <select
                id="repository"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {projectType === "organization" && (
            <div className="mb-4">
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Organization
              </label>
              <select
                id="organization"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                {organizations.map((org) => (
                  <option key={org.login} value={org.login}>
                    {org.login}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter project description"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
