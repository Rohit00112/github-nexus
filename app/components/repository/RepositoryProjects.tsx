"use client";

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RepositoryProjectsProps {
  owner: string;
  repo: string;
}

const RepositoryProjects: FC<RepositoryProjectsProps> = ({ owner, repo }) => {
  const { githubService } = useGitHub();
  const [classicProjects, setClassicProjects] = useState<any[]>([]);
  const [betaProjects, setBetaProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'classic' | 'beta'>('classic');

  // Fetch repository projects
  useEffect(() => {
    async function fetchProjects() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch classic projects
        const classicProjectsData = await githubService.getRepositoryProjects(owner, repo);
        setClassicProjects(classicProjectsData);
        
        // Fetch beta projects (ProjectsV2)
        // Note: This is a bit more complex as we need to find projects that are linked to this repository
        // For now, we'll just show a placeholder for beta projects
        setBetaProjects([]);
      } catch (err) {
        console.error("Error fetching repository projects:", err);
        setError("Failed to load repository projects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjects();
  }, [githubService, owner, repo]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Repository Projects</h3>
        <Link
          href={`/projects?repo=${owner}/${repo}`}
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All Projects
        </Link>
      </div>

      {/* Tabs for Classic vs Beta Projects */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'classic'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('classic')}
          >
            Classic Projects
          </button>
          <button
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'beta'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('beta')}
          >
            Projects (Beta)
          </button>
        </nav>
      </div>

      {/* Classic Projects */}
      {activeTab === 'classic' && (
        <div>
          {classicProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classicProjects.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-lg font-medium mb-2">
                    <Link href={`/projects/${project.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {project.name}
                    </Link>
                  </h4>
                  {project.body && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.body}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.state === 'open' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {project.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Projects Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This repository doesn't have any classic projects yet.
              </p>
              <a
                href={`https://github.com/${owner}/${repo}/projects/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
              >
                Create Project on GitHub
              </a>
            </div>
          )}
        </div>
      )}

      {/* Beta Projects */}
      {activeTab === 'beta' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">GitHub Projects (Beta)</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            GitHub Projects (Beta) provides a new project experience that integrates with GitHub issues and pull requests.
          </p>
          <a
            href={`https://github.com/${owner}/${repo}/projects?type=beta`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
          >
            View Projects on GitHub
          </a>
        </div>
      )}
    </div>
  );
};

export default RepositoryProjects;
