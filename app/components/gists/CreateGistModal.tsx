"use client";

import { useState } from "react";
import { useGitHub } from "../../context/GitHubContext";

interface GistFile {
  filename: string;
  content: string;
}

interface CreateGistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGistCreated: (gist: any) => void;
}

export default function CreateGistModal({ isOpen, onClose, onGistCreated }: CreateGistModalProps) {
  const { githubService } = useGitHub();
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [files, setFiles] = useState<GistFile[]>([{ filename: "", content: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFile = () => {
    setFiles([...files, { filename: "", content: "" }]);
  };

  const handleRemoveFile = (index: number) => {
    if (files.length === 1) return;
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleFileChange = (index: number, field: keyof GistFile, value: string) => {
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!files.some(file => file.filename && file.content)) {
      setError("At least one file with a filename and content is required");
      return;
    }
    
    if (!githubService) {
      setError("GitHub service is not available");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert files array to the format expected by the GitHub API
      const filesObject: Record<string, { content: string }> = {};
      files.forEach(file => {
        if (file.filename && file.content) {
          filesObject[file.filename] = { content: file.content };
        }
      });
      
      const gist = await githubService.createGist({
        description,
        files: filesObject,
        public: isPublic,
      });
      
      onGistCreated(gist);
      onClose();
      
      // Reset form
      setDescription("");
      setIsPublic(true);
      setFiles([{ filename: "", content: "" }]);
    } catch (err) {
      console.error("Error creating gist:", err);
      setError("Failed to create gist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Gist</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter gist description"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Public</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Secret</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Files
            </label>
            {files.map((file, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    value={file.filename}
                    onChange={(e) => handleFileChange(index, "filename", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Filename including extension"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={files.length === 1}
                    className={`ml-2 p-1 rounded-md ${
                      files.length === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <textarea
                  value={file.content}
                  onChange={(e) => handleFileChange(index, "content", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="File content"
                  rows={8}
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFile}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add another file
            </button>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Gist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
