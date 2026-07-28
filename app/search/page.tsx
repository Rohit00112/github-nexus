"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import RepositorySearch from "../components/repository/RepositorySearch";
import LanguageBar from "../components/repository/LanguageBar";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [initialQuery, setInitialQuery] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/auth/signin");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) setInitialQuery(query);
  }, [searchParams]);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Repository Search</h1>
          <p className="text-sm text-muted-foreground mt-1">Search for repositories on GitHub by name, description, language, and more</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">Popular Languages</h2>
          <LanguageBar />
        </div>

        <RepositorySearch initialQuery={initialQuery} />
      </div>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
