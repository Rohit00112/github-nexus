"use client";

import { FC, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import { scaleUp } from '../../utils/animations';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProjectProgressProps {
  limit?: number;
  animationDelay?: number;
}

interface ProjectData {
  id: number;
  name: string;
  html_url: string;
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  owner: {
    login: string;
  };
}

const ProjectProgress: FC<ProjectProgressProps> = ({
  limit = 3,
  animationDelay = 0
}) => {
  const { githubService } = useGitHub();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user's projects
        const user = await githubService.getCurrentUser();
        const userProjects = await githubService.getUserProjects(user.login);
        
        // Get project details and calculate progress
        const projectsWithProgress = await Promise.all(
          userProjects.slice(0, limit).map(async (project: any) => {
            try {
              // Get project columns
              const columns = await githubService.getProjectColumns(project.id);
              
              let totalCards = 0;
              let completedCards = 0;
              let inProgressCards = 0;
              let notStartedCards = 0;
              
              // Get cards for each column
              await Promise.all(
                columns.map(async (column: any) => {
                  const cards = await githubService.getProjectColumnCards(column.id);
                  
                  // Count cards by status
                  const columnName = column.name.toLowerCase();
                  
                  if (columnName.includes('done') || columnName.includes('complete')) {
                    completedCards += cards.length;
                  } else if (columnName.includes('progress') || columnName.includes('doing')) {
                    inProgressCards += cards.length;
                  } else if (columnName.includes('todo') || columnName.includes('backlog')) {
                    notStartedCards += cards.length;
                  } else {
                    // Default categorization
                    if (columns.indexOf(column) === columns.length - 1) {
                      completedCards += cards.length;
                    } else if (columns.indexOf(column) === 0) {
                      notStartedCards += cards.length;
                    } else {
                      inProgressCards += cards.length;
                    }
                  }
                  
                  totalCards += cards.length;
                })
              );
              
              return {
                id: project.id,
                name: project.name,
                html_url: project.html_url,
                progress: {
                  total: totalCards,
                  completed: completedCards,
                  inProgress: inProgressCards,
                  notStarted: notStartedCards
                },
                owner: {
                  login: project.creator.login
                }
              };
            } catch (err) {
              console.error(`Error fetching data for project ${project.id}:`, err);
              return null;
            }
          })
        );
        
        setProjects(projectsWithProgress.filter(Boolean) as ProjectData[]);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load project progress data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjects();
  }, [githubService, limit]);

  // Apply animation after projects are loaded
  useEffect(() => {
    if (!isLoading && projects.length > 0 && containerRef.current) {
      setTimeout(() => {
        scaleUp(containerRef.current.querySelectorAll('.project-card'));
      }, animationDelay);
    }
  }, [isLoading, projects, animationDelay]);

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

  if (projects.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center">
        <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {projects.map((project) => {
        const totalItems = project.progress.total;
        const completedPercentage = totalItems > 0 
          ? Math.round((project.progress.completed / totalItems) * 100) 
          : 0;
        const inProgressPercentage = totalItems > 0 
          ? Math.round((project.progress.inProgress / totalItems) * 100) 
          : 0;
        const notStartedPercentage = totalItems > 0 
          ? Math.round((project.progress.notStarted / totalItems) * 100) 
          : 0;
        
        return (
          <div 
            key={project.id} 
            className="project-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <Link 
                href={`/projects/${project.id}`} 
                className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {project.name}
              </Link>
              <Link 
                href={project.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </Link>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">{completedPercentage}% Complete</span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${completedPercentage}%` }}
                    aria-label={`${completedPercentage}% completed`}
                  ></div>
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{ width: `${inProgressPercentage}%` }}
                    aria-label={`${inProgressPercentage}% in progress`}
                  ></div>
                  <div 
                    className="bg-gray-400 h-full" 
                    style={{ width: `${notStartedPercentage}%` }}
                    aria-label={`${notStartedPercentage}% not started`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="font-medium">{project.progress.notStarted}</div>
                <div className="text-gray-600 dark:text-gray-400">To Do</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                <div className="font-medium">{project.progress.inProgress}</div>
                <div className="text-yellow-600 dark:text-yellow-400">In Progress</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                <div className="font-medium">{project.progress.completed}</div>
                <div className="text-green-600 dark:text-green-400">Completed</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectProgress;
