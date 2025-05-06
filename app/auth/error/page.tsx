"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";
  
  if (error === "AccessDenied") {
    errorMessage = "You do not have permission to access this resource.";
  } else if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration.";
  } else if (error === "Verification") {
    errorMessage = "The verification token has expired or has already been used.";
  }

  return (
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
            Authentication Error
          </h1>
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            {errorMessage}
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
