"use client";

import { useState } from "react";

interface FileChangesProps {
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}

export default function FileChanges({ files }: FileChangesProps) {
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

  // Toggle file expansion
  const toggleFile = (filename: string) => {
    setExpandedFiles({
      ...expandedFiles,
      [filename]: !expandedFiles[filename],
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "added":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Added
          </span>
        );
      case "modified":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Modified
          </span>
        );
      case "removed":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Removed
          </span>
        );
      case "renamed":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Renamed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  // Format patch for display
  const formatPatch = (patch: string) => {
    const lines = patch.split("\n");
    
    return (
      <div className="font-mono text-sm overflow-x-auto">
        {lines.map((line, index) => {
          let bgColor = "";
          let textColor = "";
          
          if (line.startsWith("+")) {
            bgColor = "bg-green-50 dark:bg-green-900";
            textColor = "text-green-800 dark:text-green-200";
          } else if (line.startsWith("-")) {
            bgColor = "bg-red-50 dark:bg-red-900";
            textColor = "text-red-800 dark:text-red-200";
          } else if (line.startsWith("@@")) {
            bgColor = "bg-blue-50 dark:bg-blue-900";
            textColor = "text-blue-800 dark:text-blue-200";
          }
          
          return (
            <div key={index} className={`px-2 py-0.5 ${bgColor} ${textColor}`}>
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No files changed in this pull request.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file.filename} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => toggleFile(file.filename)}
          >
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span className="font-medium truncate max-w-md">{file.filename}</span>
              {getStatusBadge(file.status)}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-green-600 dark:text-green-400">+{file.additions}</span>
                <span className="mx-1">/</span>
                <span className="text-red-600 dark:text-red-400">-{file.deletions}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
                  expandedFiles[file.filename] ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {expandedFiles[file.filename] && file.patch && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {formatPatch(file.patch)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
