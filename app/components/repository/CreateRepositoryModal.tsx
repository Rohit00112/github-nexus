"use client";

import { FC, useState, useRef, useEffect } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CreateRepositoryModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; description: string; isPrivate: boolean }) => void;
}

const CreateRepositoryModal: FC<CreateRepositoryModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus on the name input when the modal opens
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
    
    // Close modal when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    // Close modal when pressing Escape
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const validateName = (value: string) => {
    if (!value.trim()) {
      return 'Repository name is required';
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
      return 'Repository name can only contain letters, numbers, hyphens, underscores, and periods';
    }
    
    return '';
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }
    
    setIsLoading(true);
    onCreate({ name, description, isPrivate });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create a new repository</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="repo-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repository name*
              </label>
              <input
                ref={nameInputRef}
                id="repo-name"
                type="text"
                className={`w-full px-3 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                placeholder="e.g. my-awesome-project"
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="repo-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="repo-description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short description of your repository"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="repo-private"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <label htmlFor="repo-private" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Private repository
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Private repositories are only visible to you and people you explicitly share with.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" color="white" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  'Create repository'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRepositoryModal;
