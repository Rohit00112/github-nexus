import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <Head>
        <title>Sign Out - GitHub Nexus</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="GitHub Nexus Logo"
                width={80}
                height={80}
                className="mx-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
              Sign out from GitHub Nexus
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Are you sure you want to sign out?
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 flex justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              <span>{isLoading ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
