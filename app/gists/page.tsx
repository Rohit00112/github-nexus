"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../context/GitHubContext";
import MainLayout from "../components/layout/MainLayout";
import GistCard, { Gist } from "../components/gists/GistCard";
import CreateGistModal from "../components/gists/CreateGistModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function GistsPage() {
  const { githubService, isLoading: githubLoading } = useGitHub();
  const [gists, setGists] = useState<Gist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"your" | "starred" | "public">("your");
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleGistCreated = (newGist: Gist) => {
    if (activeTab === "your") setGists([newGist, ...gists]);
  };

  const handleGistDeleted = (gistId: string) => {
    setGists(gists.filter(gist => gist.id !== gistId));
  };

  return (
    <MainLayout>
      <div className="py-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GitHub Gists</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage code snippets</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg flex items-center text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Gist
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {[
              { key: "your" as const, label: "Your Gists" },
              { key: "starred" as const, label: "Starred" },
              { key: "public" as const, label: "Public" },
            ].map((tab) => (
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
        ) : gists.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {gists.map(gist => (
              <GistCard
                key={gist.id}
                gist={gist}
                onDelete={activeTab === "your" ? handleGistDeleted : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No gists found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {activeTab === "your"
                ? "You haven't created any gists yet."
                : activeTab === "starred"
                ? "You haven't starred any gists yet."
                : "No public gists found."}
            </p>
            {activeTab === "your" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-5 rounded-lg text-sm transition-colors"
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
