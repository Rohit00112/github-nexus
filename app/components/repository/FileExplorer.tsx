"use client";

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useGitHub } from '../../context/GitHubContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface FileExplorerProps {
  owner: string;
  repo: string;
  path?: string;
  branch?: string;
}

interface RepoContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: string;
}

const FileExplorer: FC<FileExplorerProps> = ({ 
  owner, 
  repo, 
  path = '', 
  branch = 'main' 
}) => {
  const { githubService } = useGitHub();
  const [contents, setContents] = useState<RepoContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(path);
  const [currentBranch, setCurrentBranch] = useState(branch);
  const [branches, setBranches] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<RepoContent | null>(null);

  // Fetch repository contents
  useEffect(() => {
    async function fetchContents() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Add method to GitHubService to get repository contents
        const response = await githubService.octokit.rest.repos.getContent({
          owner,
          repo,
          path: currentPath,
          ref: currentBranch
        });
        
        // Handle both array (directory) and single object (file) responses
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setContents(data as RepoContent[]);
        
        // Reset file content when navigating to a directory
        setFileContent(null);
        setSelectedFile(null);
      } catch (err) {
        console.error("Error fetching repository contents:", err);
        setError("Failed to load repository contents. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContents();
  }, [githubService, owner, repo, currentPath, currentBranch]);

  // Fetch repository branches
  useEffect(() => {
    async function fetchBranches() {
      if (!githubService) return;
      
      try {
        const response = await githubService.octokit.rest.repos.listBranches({
          owner,
          repo,
          per_page: 100
        });
        
        const branchNames = response.data.map(branch => branch.name);
        setBranches(branchNames);
        
        // Set default branch if current branch is not in the list
        if (branchNames.length > 0 && !branchNames.includes(currentBranch)) {
          setCurrentBranch(branchNames[0]);
        }
      } catch (err) {
        console.error("Error fetching repository branches:", err);
      }
    }
    
    fetchBranches();
  }, [githubService, owner, repo]);

  // Handle file click
  const handleFileClick = async (item: RepoContent) => {
    if (item.type === 'dir') {
      // Navigate to directory
      setCurrentPath(item.path);
    } else if (item.type === 'file') {
      // Fetch and display file content
      try {
        setIsLoading(true);
        setSelectedFile(item);
        
        // For binary files or large files, just provide a download link
        if (item.size > 1000000 || isBinaryFilename(item.name)) {
          setFileContent("File is too large or binary. Please download to view.");
          setIsLoading(false);
          return;
        }
        
        const response = await githubService?.octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
          ref: currentBranch
        });
        
        // Handle base64 encoded content
        if (response?.data && 'content' in response.data && 'encoding' in response.data) {
          const content = response.data.encoding === 'base64'
            ? atob(response.data.content.replace(/\\n/g, ''))
            : response.data.content;
          
          setFileContent(content);
        } else {
          setFileContent("Unable to display file content.");
        }
      } catch (err) {
        console.error("Error fetching file content:", err);
        setFileContent("Error loading file content.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle navigation to parent directory
  const navigateToParent = () => {
    if (currentPath === '') return;
    
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
  };

  // Handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentBranch(e.target.value);
    setCurrentPath(''); // Reset to root directory when changing branches
  };

  // Check if a file is likely binary based on extension
  const isBinaryFilename = (filename: string): boolean => {
    const binaryExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
      '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
      '.zip', '.tar', '.gz', '.7z', '.rar',
      '.exe', '.dll', '.so', '.dylib',
      '.mp3', '.mp4', '.avi', '.mov', '.flv'
    ];
    
    return binaryExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get breadcrumb navigation items
  const getBreadcrumbs = () => {
    if (currentPath === '') {
      return [{ name: 'Root', path: '' }];
    }
    
    const pathParts = currentPath.split('/');
    let currentPathAccumulator = '';
    
    return [
      { name: 'Root', path: '' },
      ...pathParts.map(part => {
        currentPathAccumulator = currentPathAccumulator 
          ? `${currentPathAccumulator}/${part}` 
          : part;
        
        return {
          name: part,
          path: currentPathAccumulator
        };
      })
    ];
  };

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Branch selector and breadcrumb navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap w-full sm:w-auto">
          <span className="text-gray-600 dark:text-gray-400">Branch:</span>
          <select
            value={currentBranch}
            onChange={handleBranchChange}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
          >
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap w-full sm:w-auto">
          {getBreadcrumbs().map((crumb, index, array) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <span className="mx-1 text-gray-400">/</span>}
              <button
                onClick={() => setCurrentPath(crumb.path)}
                className={`text-sm hover:underline ${
                  index === array.length - 1
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* File explorer */}
      <div className="flex flex-col md:flex-row">
        {/* File list */}
        <div className={`border-r border-gray-200 dark:border-gray-700 ${selectedFile ? 'w-full md:w-1/3' : 'w-full'}`}>
          {isLoading && !fileContent ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="medium" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentPath !== '' && (
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={navigateToParent}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          ..
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        -
                      </td>
                    </tr>
                  )}
                  
                  {contents
                    .sort((a, b) => {
                      // Directories first, then files
                      if (a.type === 'dir' && b.type !== 'dir') return -1;
                      if (a.type !== 'dir' && b.type === 'dir') return 1;
                      // Alphabetical order within each group
                      return a.name.localeCompare(b.name);
                    })
                    .map(item => (
                      <tr 
                        key={item.sha} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => handleFileClick(item)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {item.type === 'dir' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            )}
                            {item.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.type === 'dir' ? '-' : formatFileSize(item.size)}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* File content viewer */}
        {selectedFile && (
          <div className="w-full md:w-2/3 border-t md:border-t-0 border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {selectedFile.name}
              </h3>
              <a 
                href={selectedFile.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
              >
                View on GitHub
              </a>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="medium" />
                </div>
              ) : (
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
                  {fileContent}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
