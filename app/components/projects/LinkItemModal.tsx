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
  Tabs,
  Tab,
  Card,
  CardBody,
  Spinner,
  Chip
} from "@nextui-org/react";

interface LinkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: number;
  onItemLinked: (columnId: number) => void;
}

export default function LinkItemModal({
  isOpen,
  onClose,
  columnId,
  onItemLinked,
}: LinkItemModalProps) {
  const { githubService } = useGitHub();
  const [activeTab, setActiveTab] = useState("issues");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch repositories when component mounts
  useEffect(() => {
    async function fetchRepositories() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        const user = await githubService.getCurrentUser();
        const repos = await githubService.getUserRepositories(user.login);
        setRepositories(repos);
        
        if (repos.length > 0) {
          setSelectedRepo(repos[0].full_name);
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
        setError("Failed to fetch repositories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRepositories();
  }, [githubService]);

  // Handle search
  const handleSearch = async () => {
    if (!githubService || !selectedRepo || !searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [owner, repo] = selectedRepo.split("/");
      
      if (activeTab === "issues") {
        const issues = await githubService.searchIssues(searchQuery, owner, repo);
        setSearchResults(issues.filter((issue: any) => !issue.pull_request));
      } else {
        const pullRequests = await githubService.searchIssues(searchQuery, owner, repo);
        setSearchResults(pullRequests.filter((issue: any) => issue.pull_request));
      }
    } catch (error) {
      console.error("Error searching items:", error);
      setError("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item selection
  const handleLinkItem = async (item: any) => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await githubService.createCard(columnId, {
        content_id: item.id,
        content_type: activeTab === "issues" ? "Issue" : "PullRequest",
      });
      
      onItemLinked(columnId);
      onClose();
    } catch (error) {
      console.error("Error linking item:", error);
      setError("Failed to link item. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Link {activeTab === "issues" ? "Issue" : "Pull Request"}</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Repository
                  </label>
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    disabled={isLoading || repositories.length === 0}
                  >
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.full_name}>
                        {repo.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Tabs 
                  selectedKey={activeTab} 
                  onSelectionChange={(key) => setActiveTab(key as string)}
                >
                  <Tab key="issues" title="Issues" />
                  <Tab key="pullRequests" title="Pull Requests" />
                </Tabs>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder={`Search ${activeTab === "issues" ? "issues" : "pull requests"}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={isLoading || !selectedRepo}
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    onClick={handleSearch}
                    isLoading={isLoading}
                    isDisabled={!searchQuery.trim() || !selectedRepo}
                  >
                    Search
                  </Button>
                </div>
                
                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((item) => (
                        <Card
                          key={item.id}
                          isPressable
                          onPress={() => handleLinkItem(item)}
                          className="border border-gray-200 dark:border-gray-700"
                        >
                          <CardBody className="p-3">
                            <div className="flex items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    #{item.number}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="text-sm font-medium">{item.title}</h4>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.labels.map((label: any) => (
                                    <Chip
                                      key={label.id}
                                      size="sm"
                                      style={{
                                        backgroundColor: `#${label.color}`,
                                        color: parseInt(label.color, 16) > 0xffffff / 2 ? '#000' : '#fff'
                                      }}
                                    >
                                      {label.name}
                                    </Chip>
                                  ))}
                                </div>
                              </div>
                              <div className="ml-2">
                                <img
                                  src={item.user.avatar_url}
                                  alt={item.user.login}
                                  className="w-6 h-6 rounded-full"
                                />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No results found
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Search for {activeTab === "issues" ? "issues" : "pull requests"} to link
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
