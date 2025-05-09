"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGitHub } from "../../context/GitHubContext";
import MainLayout from "../../components/layout/MainLayout";
import ProjectColumn from "../../components/projects/ProjectColumn";
import CreateColumnModal from "../../components/projects/CreateColumnModal";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string, 10);
  
  const { githubService } = useGitHub();
  const [project, setProject] = useState<any | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [cards, setCards] = useState<Record<number, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Fetch project details
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch project details
        const projectData = await githubService.getProject(projectId);
        setProject(projectData);
        setProjectName(projectData.name);
        setProjectDescription(projectData.body || "");
        
        // Fetch project columns
        const columnsData = await githubService.getProjectColumns(projectId);
        setColumns(columnsData);
        
        // Fetch cards for each column
        const cardsData: Record<number, any[]> = {};
        
        for (const column of columnsData) {
          const columnCards = await githubService.getColumnCards(column.id);
          cardsData[column.id] = columnCards;
        }
        
        setCards(cardsData);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProjectDetails();
  }, [githubService, projectId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle project update
  const handleUpdateProject = async (field: "name" | "body") => {
    if (!githubService || !project) return;
    
    try {
      setIsLoading(true);
      
      if (field === "name" && projectName.trim()) {
        await githubService.updateProject(projectId, { name: projectName });
        setProject({ ...project, name: projectName });
        setIsEditingName(false);
      } else if (field === "body") {
        await githubService.updateProject(projectId, { body: projectDescription });
        setProject({ ...project, body: projectDescription });
        setIsEditingDescription(false);
      }
    } catch (error) {
      console.error(`Error updating project ${field}:`, error);
      alert(`Failed to update project ${field}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!githubService || !project) return;
    
    if (window.confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
      try {
        setIsLoading(true);
        await githubService.deleteProject(projectId);
        router.push("/projects");
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project. Please try again.");
        setIsLoading(false);
      }
    }
  };

  // Handle column creation
  const handleColumnCreated = async (column: any) => {
    setColumns([...columns, column]);
    setCards({ ...cards, [column.id]: [] });
  };

  // Handle column deletion
  const handleDeleteColumn = async (columnId: number) => {
    setColumns(columns.filter(column => column.id !== columnId));
    
    const newCards = { ...cards };
    delete newCards[columnId];
    setCards(newCards);
  };

  // Handle column update
  const handleUpdateColumn = async (columnId: number, name: string) => {
    setColumns(columns.map(column => 
      column.id === columnId ? { ...column, name } : column
    ));
  };

  // Handle card creation
  const handleAddCard = async (columnId: number) => {
    if (!githubService) return;
    
    try {
      // Refresh cards for the column
      const columnCards = await githubService.getColumnCards(columnId);
      setCards({ ...cards, [columnId]: columnCards });
    } catch (error) {
      console.error("Error refreshing cards:", error);
    }
  };

  // Handle card deletion
  const handleDeleteCard = async (cardId: number) => {
    // Update cards state by removing the deleted card
    const newCards = { ...cards };
    
    for (const columnId in newCards) {
      newCards[columnId] = newCards[columnId].filter(card => card.id !== cardId);
    }
    
    setCards(newCards);
  };

  // Handle card movement
  const handleMoveCard = async (cardId: number, columnId: number, position: string) => {
    if (!githubService) return;
    
    try {
      // Refresh cards for all columns after movement
      const updatedCards: Record<number, any[]> = {};
      
      for (const column of columns) {
        const columnCards = await githubService.getColumnCards(column.id);
        updatedCards[column.id] = columnCards;
      }
      
      setCards(updatedCards);
    } catch (error) {
      console.error("Error refreshing cards after movement:", error);
    }
  };

  if (isLoading && !project) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            <Link href="/projects" className="hover:text-blue-600 dark:hover:text-blue-400">
              Projects
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-200">{project.name}</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditingName ? (
                <div className="mb-2">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Project name"
                    autoFocus
                  />
                  <div className="flex mt-2 space-x-2">
                    <button
                      onClick={() => handleUpdateProject("name")}
                      disabled={!projectName.trim()}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setProjectName(project.name);
                        setIsEditingName(false);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1 className="text-2xl font-bold flex items-center">
                  {project.name}
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="ml-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Edit project name"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </h1>
              )}
              
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.state === "open"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                  {project.state}
                </span>
                <span className="mx-2">•</span>
                <span>Created: {formatDate(project.created_at)}</span>
                <span className="mx-2">•</span>
                <span>Updated: {formatDate(project.updated_at)}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                View on GitHub
              </a>
              <button
                onClick={handleDeleteProject}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Project
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            {isEditingDescription ? (
              <div>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Project description (optional)"
                  rows={4}
                />
                <div className="flex mt-2 space-x-2">
                  <button
                    onClick={() => handleUpdateProject("body")}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setProjectDescription(project.body || "");
                      setIsEditingDescription(false);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md relative group">
                {project.body ? (
                  <div className="prose dark:prose-invert max-w-none">
                    {project.body}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided.
                  </p>
                )}
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit description"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Columns</h2>
            <button
              onClick={() => setShowCreateColumnModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-md transition-colors flex items-center text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Column
            </button>
          </div>
          
          {columns.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {columns.map(column => (
                <ProjectColumn
                  key={column.id}
                  column={column}
                  cards={cards[column.id] || []}
                  onDeleteColumn={handleDeleteColumn}
                  onUpdateColumn={handleUpdateColumn}
                  onAddCard={handleAddCard}
                  onDeleteCard={handleDeleteCard}
                  onMoveCard={handleMoveCard}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No columns yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add columns to organize your project tasks and issues.
              </p>
              <button
                onClick={() => setShowCreateColumnModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Add your first column
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateColumnModal && (
        <CreateColumnModal
          isOpen={showCreateColumnModal}
          onClose={() => setShowCreateColumnModal(false)}
          projectId={projectId}
          onColumnCreated={handleColumnCreated}
        />
      )}
    </MainLayout>
  );
}
