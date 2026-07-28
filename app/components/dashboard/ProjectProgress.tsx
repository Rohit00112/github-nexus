"use client";

import { FC, useCallback, useEffect, useRef, useState } from 'react';
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
  progress: { total: number; completed: number; inProgress: number; notStarted: number };
  owner: { login: string };
}

const ProjectProgress: FC<ProjectProgressProps> = ({ limit = 3, animationDelay = 0 }) => {
  const { githubService } = useGitHub();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchProjects = useCallback(async () => {
    if (!githubService) return;

    try {
      setIsLoading(true);
      setError(null);

      const user = await githubService.getCurrentUser();
      const userProjects = await githubService.getUserProjects(user.login);

      const projectsWithProgress = await Promise.all(
        userProjects.slice(0, limit).map(async (project) => {
          try {
            const columns = await githubService.getProjectColumns(project.id);
            let totalCards = 0, completedCards = 0, inProgressCards = 0, notStartedCards = 0;

            await Promise.all(
              columns.map(async (column) => {
                const cards = await githubService.getProjectColumnCards(column.id);
                const columnName = column.name.toLowerCase();
                if (columnName.includes('done') || columnName.includes('complete')) completedCards += cards.length;
                else if (columnName.includes('progress') || columnName.includes('doing')) inProgressCards += cards.length;
                else if (columnName.includes('todo') || columnName.includes('backlog')) notStartedCards += cards.length;
                else {
                  if (columns.indexOf(column) === columns.length - 1) completedCards += cards.length;
                  else if (columns.indexOf(column) === 0) notStartedCards += cards.length;
                  else inProgressCards += cards.length;
                }
                totalCards += cards.length;
              })
            );

            return { id: project.id, name: project.name, html_url: project.html_url, progress: { total: totalCards, completed: completedCards, inProgress: inProgressCards, notStarted: notStartedCards }, owner: { login: project.creator?.login || user.login } };
          } catch (err) {
            console.error(`Error fetching data for project ${project.id}:`, err);
            return null;
          }
        })
      );

      setProjects(projectsWithProgress.filter(Boolean) as ProjectData[]);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load project progress data.");
    } finally {
      setIsLoading(false);
    }
  }, [githubService, limit]);

  useEffect(() => { fetchProjects(); }, [githubService, limit, fetchProjects]);

  useEffect(() => {
    if (!isLoading && projects.length > 0 && containerRef.current) {
      const el = containerRef.current;
      setTimeout(() => { scaleUp(el.querySelectorAll('.project-card')); }, animationDelay);
    }
  }, [isLoading, projects, animationDelay]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="medium" /></div>;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between text-sm">
        <div>{error}</div>
        <button onClick={() => { setIsLoading(true); setError(null); setTimeout(fetchProjects, 500); }} className="px-3 py-1 bg-muted hover:bg-accent text-muted-foreground rounded-lg text-sm transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return <div className="bg-muted/50 p-4 rounded-lg text-center"><p className="text-sm text-muted-foreground">No projects found.</p></div>;
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {projects.map((project) => {
        const totalItems = project.progress.total;
        const completedPercentage = totalItems > 0 ? Math.round((project.progress.completed / totalItems) * 100) : 0;
        const inProgressPercentage = totalItems > 0 ? Math.round((project.progress.inProgress / totalItems) * 100) : 0;
        const notStartedPercentage = totalItems > 0 ? Math.round((project.progress.notStarted / totalItems) * 100) : 0;

        return (
          <div key={project.id} className="project-card bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <Link href={`/projects/${project.id}`} className="text-base font-medium text-foreground hover:text-primary transition-colors">
                {project.name}
              </Link>
              <Link href={project.html_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </Link>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground text-xs">Progress</span>
                <span className="font-mono font-medium text-xs">{completedPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${completedPercentage}%` }} />
                  <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${inProgressPercentage}%` }} />
                  <div className="bg-muted-foreground/30 h-full transition-all duration-500" style={{ width: `${notStartedPercentage}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-muted/50 p-2 rounded-lg">
                <div className="font-mono font-medium">{project.progress.notStarted}</div>
                <div className="text-muted-foreground">To Do</div>
              </div>
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <div className="font-mono font-medium text-yellow-600 dark:text-yellow-400">{project.progress.inProgress}</div>
                <div className="text-yellow-600 dark:text-yellow-400">In Progress</div>
              </div>
              <div className="bg-green-500/10 p-2 rounded-lg">
                <div className="font-mono font-medium text-green-600 dark:text-green-400">{project.progress.completed}</div>
                <div className="text-green-600 dark:text-green-400">Done</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectProgress;
