"use client";

import Link from "next/link";
import { useState } from "react";
import { useGitHub } from "../../context/GitHubContext";
import Image from "next/image";

interface GistFile {
  filename?: string;
  language?: string | null;
  raw_url?: string;
  size?: number;
  type?: string;
  content?: string;
}

interface GistOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Gist {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  owner?: GistOwner | null;
  html_url: string;
  comments: number;
}

interface GistCardProps {
  gist: Gist;
  onDelete?: (gistId: string) => void;
}

export default function GistCard({ gist, onDelete }: GistCardProps) {
  const { githubService } = useGitHub();
  const [isStarred, setIsStarred] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileNames = Object.keys(gist.files);
  const firstFileName = fileNames[0];
  const firstFile = gist.files[firstFileName];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const checkIfStarred = async () => {
    if (!githubService || isStarred !== null) return;
    try { setIsLoading(true); const starred = await githubService.isGistStarred(gist.id); setIsStarred(starred); } catch { } finally { setIsLoading(false); }
  };

  const toggleStar = async () => {
    if (!githubService) return;
    try {
      setIsLoading(true);
      if (isStarred) { await githubService.unstarGist(gist.id); setIsStarred(false); }
      else { await githubService.starGist(gist.id); setIsStarred(true); }
    } catch { } finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    if (!githubService || !onDelete) return;
    if (window.confirm("Are you sure you want to delete this gist?")) {
      try { setIsLoading(true); await githubService.deleteGist(gist.id); onDelete(gist.id); } catch { alert("Failed to delete gist."); } finally { setIsLoading(false); }
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200" onMouseEnter={checkIfStarred}>
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/gists/${gist.id}`} className="text-base font-medium text-foreground hover:text-primary transition-colors">
            {gist.description || `Gist:${gist.id.substring(0, 7)}`}
          </Link>
          <div className="flex gap-1">
            {isStarred !== null && (
              <button onClick={toggleStar} disabled={isLoading} className="text-muted-foreground hover:text-yellow-500 p-1 rounded-lg hover:bg-accent transition-colors" title={isStarred ? "Unstar" : "Star"}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isStarred ? "text-yellow-500" : ""}`} fill={isStarred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button onClick={handleDelete} disabled={isLoading} className="text-muted-foreground hover:text-red-500 p-1 rounded-lg hover:bg-accent transition-colors" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-2">
          {gist.owner && (
            <>
              <Image src={gist.owner.avatar_url} alt={gist.owner.login} className="w-4 h-4 rounded-full" unoptimized width={16} height={16} />
              <span>{gist.owner.login}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(gist.created_at)}</span>
          <span>·</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${gist.public ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
            {gist.public ? "Public" : "Secret"}
          </span>
          <span>· {fileNames.length} {fileNames.length === 1 ? "file" : "files"}</span>
        </div>
      </div>
      <div className="p-3 bg-muted/30">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{firstFileName}</span>
            {firstFile.language && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary font-medium">{firstFile.language}</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">{firstFile.size} bytes</span>
        </div>
        <pre className="text-xs overflow-x-auto p-2 bg-card rounded-lg border border-border">
          <code className="font-mono text-muted-foreground">{firstFile.content ? firstFile.content.slice(0, 200) + (firstFile.content.length > 200 ? "..." : "") : "Content not loaded"}</code>
        </pre>
      </div>
    </div>
  );
}
