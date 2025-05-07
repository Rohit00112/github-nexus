"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../context/GitHubContext";
import MainLayout from "../components/layout/MainLayout";
import GistCard, { Gist } from "../components/gists/GistCard";
import CreateGistModal from "../components/gists/CreateGistModal";

export default function GistsPage() {
  const { githubService, isLoading: githubLoading } = useGitHub();
  const [gists, setGists] = useState<Gist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"your" | "starred" | "public">("your");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch gists based on active tab
  useEffect(() => {
    async function fetchGists() {
      if (githubService && !githubLoading) {
        try {
          setIsLoading(true);
          setError(null);
          
          let gistsData: Gist[] = [];
          
          switch (activeTab) {
            case "your":
              gistsData = await githubService.getGists(1, 100);
              break;
            case "starred":
              gistsData = await githubService.getStarredGists(1, 100);
              break;
            case "public":
              gistsData = await githubService.getPublicGists(1, 100);
              break;
          }
          
          setGists(gistsData);
        } catch (err) {
          console.error("Error fetching gists:", err);
          setError("Failed to fetch gists. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchGists();
  }, [githubService, githubLoading, activeTab]);

  // Handle gist creation
  const handleGistCreated = (newGist: Gist) => {
    if (activeTab === "your") {
      setGists([newGist, ...gists]);
    }
  };

  // Handle gist deletion
  const handleGistDeleted = (gistId: string) => {
    setGists(gists.filter(gist => gist.id !== gistId));
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">GitHub Gists</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Gist
          </button>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("your")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "your"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Your Gists
              </button>
              <button
                onClick={() => setActiveTab("starred")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "starred"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Starred
              </button>
              <button
                onClick={() => setActiveTab("public")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "public"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Public
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
        ) : gists.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {gists.map(gist => (
              <GistCard
                key={gist.id}
                gist={gist}
                onDelete={activeTab === "your" ? handleGistDeleted : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No gists found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === "your"
                ? "You haven't created any gists yet."
                : activeTab === "starred"
                ? "You haven't starred any gists yet."
                : "No public gists found."}
            </p>
            {activeTab === "your" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create your first gist
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGistModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onGistCreated={handleGistCreated}
        />
      )}
    </MainLayout>
  );
}
