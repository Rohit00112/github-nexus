import Link from 'next/link';
import ActionsClient from './client';

export default function ActionsPage() {
  return (
    <>
      {/* This will be shown during server-side rendering */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 only-on-server">
        <h1 className="text-3xl font-bold mb-6">GitHub Actions</h1>
        <p className="text-lg mb-8 text-center max-w-2xl">
          Manage your GitHub Actions workflows, view run history, and trigger new workflow runs.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md">
          <p className="text-center mb-6">
            Please sign in to view and manage your GitHub Actions workflows.
          </p>
          <div className="flex justify-center">
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Client component will be visible when JavaScript loads */}
      <ActionsClient />
    </>
  );
}
