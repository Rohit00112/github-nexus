"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea
} from "@nextui-org/react";
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon } from "@heroicons/react/24/outline";

interface ProjectBetaItem {
  id: string;
  content?: {
    id: string;
    title: string;
    number: number;
    state: string;
    repository?: {
      name: string;
      owner: {
        login: string;
      };
    };
  };
  fieldValues: {
    nodes: Array<{
      text?: string;
      date?: string;
      name?: string;
      field: {
        name: string;
      };
    }>;
  };
}

interface ProjectBetaField {
  id: string;
  name: string;
  dataType: string;
  options?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

interface ProjectBetaBoardProps {
  projectId: string;
  fields: ProjectBetaField[];
  items: ProjectBetaItem[];
  onItemAdded: () => void;
  onItemUpdated: () => void;
}

export default function ProjectBetaBoard({
  projectId,
  fields,
  items,
  onItemAdded,
  onItemUpdated
}: ProjectBetaBoardProps) {
  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showLinkItemModal, setShowLinkItemModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemBody, setNewItemBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [repositories, setRepositories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("issues");

  // Get status field if it exists
  const statusField = fields.find(field => 
    field.name.toLowerCase() === "status" && field.dataType === "SINGLE_SELECT"
  );

  // Group items by status
  const groupedItems: Record<string, ProjectBetaItem[]> = {};
  
  if (statusField && statusField.options) {
    // Initialize groups based on status options
    statusField.options.forEach(option => {
      groupedItems[option.name] = [];
    });
    
    // Add "No Status" group for items without a status
    groupedItems["No Status"] = [];
    
    // Group items
    items.forEach(item => {
      const statusValue = item.fieldValues.nodes.find(
        value => value.field.name.toLowerCase() === "status" && value.name
      );
      
      if (statusValue && statusValue.name) {
        if (groupedItems[statusValue.name]) {
          groupedItems[statusValue.name].push(item);
        } else {
          groupedItems["No Status"].push(item);
        }
      } else {
        groupedItems["No Status"].push(item);
      }
    });
  } else {
    // If no status field, just show all items in one group
    groupedItems["All Items"] = items;
  }

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
    
    if (showLinkItemModal) {
      fetchRepositories();
    }
  }, [githubService, showLinkItemModal]);

  // Handle search for linking items
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

  // Handle creating a draft issue
  const handleCreateDraftIssue = async () => {
    if (!githubService || !newItemTitle.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await githubService.createDraftIssue(
        projectId,
        newItemTitle,
        newItemBody
      );
      
      setNewItemTitle("");
      setNewItemBody("");
      setShowAddItemModal(false);
      onItemAdded();
    } catch (error) {
      console.error("Error creating draft issue:", error);
      setError("Failed to create draft issue. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle linking an item to the project
  const handleLinkItem = async (item: any) => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await githubService.addItemToProject(
        projectId,
        item.node_id
      );
      
      setShowLinkItemModal(false);
      onItemAdded();
    } catch (error) {
      console.error("Error linking item:", error);
      setError("Failed to link item. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Items</h2>
        <div className="flex space-x-2">
          <Button 
            color="primary" 
            startContent={<PlusIcon className="h-4 w-4" />}
            onPress={() => setShowAddItemModal(true)}
          >
            Add Item
          </Button>
          <Button
            variant="flat"
            startContent={<LinkIcon className="h-4 w-4" />}
            onPress={() => setShowLinkItemModal(true)}
          >
            Link Item
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedItems).map(([status, statusItems]) => (
          <Card key={status} className="h-full">
            <CardHeader className="flex justify-between items-center bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center">
                <h3 className="text-md font-medium">{status}</h3>
                <Chip size="sm" className="ml-2">{statusItems.length}</Chip>
              </div>
            </CardHeader>
            <CardBody className="overflow-y-auto max-h-[500px]">
              {statusItems.length > 0 ? (
                <div className="space-y-3">
                  {statusItems.map(item => (
                    <Card key={item.id} shadow="sm" className="border border-gray-200 dark:border-gray-700">
                      <CardBody className="p-3">
                        <div className="text-sm font-medium">
                          {item.content ? (
                            <div>
                              <div className="flex items-center mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.content.repository?.owner.login}/{item.content.repository?.name} #{item.content.number}
                                </span>
                              </div>
                              <a 
                                href={`/repositories/${item.content.repository?.owner.login}/${item.content.repository?.name}/${item.content.state === 'open' ? 'issues' : 'pull'}/${item.content.number}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {item.content.title}
                              </a>
                              <Chip 
                                size="sm" 
                                className="ml-2" 
                                color={item.content.state === 'open' ? 'success' : 'danger'}
                              >
                                {item.content.state}
                              </Chip>
                            </div>
                          ) : (
                            // Draft issue
                            <div>
                              {item.fieldValues.nodes.find(v => v.field.name === "Title")?.text || "Untitled Draft"}
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No items in this status
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Draft Issue</ModalHeader>
              <ModalBody>
                <Input
                  label="Title"
                  placeholder="Enter issue title"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  isRequired
                />
                <Textarea
                  label="Description"
                  placeholder="Enter issue description"
                  value={newItemBody}
                  onChange={(e) => setNewItemBody(e.target.value)}
                  minRows={3}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreateDraftIssue}
                  isLoading={isLoading}
                  isDisabled={!newItemTitle.trim()}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Link Item Modal */}
      <Modal isOpen={showLinkItemModal} onClose={() => setShowLinkItemModal(false)} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Link Issue or Pull Request</ModalHeader>
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
                  
                  <div className="flex space-x-2">
                    <Button
                      className={activeTab === "issues" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"}
                      onPress={() => setActiveTab("issues")}
                    >
                      Issues
                    </Button>
                    <Button
                      className={activeTab === "pullRequests" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"}
                      onPress={() => setActiveTab("pullRequests")}
                    >
                      Pull Requests
                    </Button>
                  </div>
                  
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
    </div>
  );
}
