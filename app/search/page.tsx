"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import RepositorySearch from "../components/repository/RepositorySearch";
import LanguageBar from "../components/repository/LanguageBar";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [initialQuery, setInitialQuery] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Get the query parameter from the URL
    const query = searchParams.get('q');
    if (query) {
      setInitialQuery(query);
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Repository Search</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search for repositories on GitHub by name, description, language, and more.
            </p>
          </div>

          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium mb-3">Popular Languages</h2>
            <LanguageBar />
          </div>

          <RepositorySearch initialQuery={initialQuery} />
        </div>
      </div>
    </MainLayout>
  );
}
