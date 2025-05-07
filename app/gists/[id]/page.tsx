"use client";

import { useParams } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import GistViewer from "../../components/gists/GistViewer";
import Link from "next/link";

export default function GistPage() {
  const params = useParams();
  const gistId = params.id as string;

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link
            href="/gists"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Gists
          </Link>
        </div>
        
        <GistViewer gistId={gistId} />
      </div>
    </MainLayout>
  );
}
