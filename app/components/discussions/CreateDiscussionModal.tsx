"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Spinner
} from "@nextui-org/react";

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  onDiscussionCreated: (discussionNumber: number) => void;
}

export default function CreateDiscussionModal({
  isOpen,
  onClose,
  owner,
  repo,
  onDiscussionCreated
}: CreateDiscussionModalProps) {
  const { githubService } = useGitHub();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch discussion categories
  useEffect(() => {
    async function fetchCategories() {
      if (!githubService || !isOpen) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const categoriesData = await githubService.getDiscussionCategories(owner, repo);
        setCategories(categoriesData);
        
        // Set default category if available
        if (categoriesData.length > 0) {
          setCategoryId(categoriesData[0].id);
        }
      } catch (err) {
        console.error("Error fetching discussion categories:", err);
        setError("Failed to fetch discussion categories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategories();
  }, [githubService, owner, repo, isOpen]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setBody("");
      setCategoryId("");
      setError(null);
    }
  }, [isOpen]);

  // Handle create discussion
  const handleCreateDiscussion = async () => {
    if (!githubService || !title.trim() || !body.trim() || !categoryId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get repository ID
      const repositoryId = await githubService.getRepositoryIdByName(owner, repo);
      
      // Create discussion
      const discussion = await githubService.createDiscussion({
        repositoryId,
        categoryId,
        title,
        body
      });
      
      // Close modal and notify parent
      onClose();
      onDiscussionCreated(discussion.number);
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError("Failed to create discussion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Create a new discussion</ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md mb-4">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Title"
                    placeholder="Enter a title for your discussion"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    isRequired
                  />
                  
                  <Select
                    label="Category"
                    placeholder="Select a category"
                    selectedKeys={categoryId ? [categoryId] : []}
                    onChange={(e) => setCategoryId(e.target.value)}
                    isRequired
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.emoji} {category.name}
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Textarea
                    label="Body"
                    placeholder="Write your discussion here... (Markdown supported)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    minRows={10}
                    isRequired
                  />
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Markdown formatting supported:</p>
                    <ul className="list-disc pl-4 mt-1">
                      <li>**bold** or __bold__</li>
                      <li>*italic* or _italic_</li>
                      <li># Heading 1, ## Heading 2, etc.</li>
                      <li>[Link text](URL)</li>
                      <li>- Bullet points</li>
                      <li>1. Numbered lists</li>
                      <li>```code blocks```</li>
                    </ul>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleCreateDiscussion}
                isLoading={isSubmitting}
                isDisabled={isLoading || !title.trim() || !body.trim() || !categoryId}
              >
                Create Discussion
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
