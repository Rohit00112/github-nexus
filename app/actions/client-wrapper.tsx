'use client';

import { Suspense, lazy } from 'react';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Lazy load the client component
const ActionsClient = lazy(() => import('./actions-client'));

export default function ActionsClientWrapper() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="py-6">
          <h1 className="text-2xl font-bold mb-6">GitHub Actions</h1>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        </div>
      }>
        <ActionsClient />
      </Suspense>
    </MainLayout>
  );
}
