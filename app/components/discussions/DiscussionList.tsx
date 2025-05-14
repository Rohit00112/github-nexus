"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "../../context/GitHubContext";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Pagination,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface DiscussionListProps {
  owner: string;
  repo: string;
  onCreateDiscussion?: () => void;
}

export default function DiscussionList({ owner, repo, onCreateDiscussion }: DiscussionListProps) {
  const { githubService } = useGitHub();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const itemsPerPage = 10;

  // Fetch discussions
  useEffect(() => {
    async function fetchDiscussions() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get discussions
        const discussionsData = await githubService.getRepositoryDiscussions(
          owner, 
          repo, 
          itemsPerPage,
          page > 1 ? endCursor : undefined
        );
        
        setDiscussions(discussionsData.nodes);
        setTotalCount(discussionsData.totalCount);
        setHasNextPage(discussionsData.pageInfo.hasNextPage);
        setEndCursor(discussionsData.pageInfo.endCursor);
        
        // Get categories
        const categoriesData = await githubService.getDiscussionCategories(owner, repo);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching discussions:", err);
        setError("Failed to fetch discussions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDiscussions();
  }, [githubService, owner, repo, page]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle search
  const handleSearch = () => {
    // Reset pagination
    setPage(1);
    setEndCursor(null);
    
    // Fetch discussions with search query
    // Note: GitHub GraphQL API doesn't support searching discussions directly
    // This would need to be implemented with a combination of REST API calls
    // or by filtering the results client-side
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setEndCursor(null);
    
    // Fetch discussions with category filter
    // Note: This would need to be implemented with additional filtering in the GraphQL query
  };

  // Handle sort
  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    setPage(1);
    setEndCursor(null);
    
    // Fetch discussions with sort option
    // Note: This would need to be implemented with additional sorting in the GraphQL query
  };

  // Filter discussions by category
  const filteredDiscussions = selectedCategory === "all"
    ? discussions
    : discussions.filter(discussion => discussion.category.id === selectedCategory);

  // Sort discussions
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "most-comments") {
      return b.comments.totalCount - a.comments.totalCount;
    } else if (sortBy === "recently-updated") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Discussions</h2>
        <Button
          color="primary"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={onCreateDiscussion}
        >
          New Discussion
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            placeholder="Category"
            selectedKeys={[selectedCategory]}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="w-40"
          >
            <SelectItem key="all" value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </SelectItem>
            ))}
          </Select>
          
          <Select
            placeholder="Sort by"
            selectedKeys={[sortBy]}
            onChange={(e) => handleSort(e.target.value)}
            className="w-40"
          >
            <SelectItem key="newest" value="newest">Newest</SelectItem>
            <SelectItem key="oldest" value="oldest">Oldest</SelectItem>
            <SelectItem key="most-comments" value="most-comments">Most Comments</SelectItem>
            <SelectItem key="recently-updated" value="recently-updated">Recently Updated</SelectItem>
          </Select>
        </div>
      </div>
      
      {sortedDiscussions.length > 0 ? (
        <div className="space-y-4">
          {sortedDiscussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={discussion.author.avatarUrl}
                      alt={discussion.author.login}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Chip size="sm" variant="flat" color="primary">
                        {discussion.category.emoji} {discussion.category.name}
                      </Chip>
                      {discussion.answerChosenAt && (
                        <Chip size="sm" variant="flat" color="success" startContent={<CheckCircleIcon className="h-3 w-3" />}>
                          Answered
                        </Chip>
                      )}
                    </div>
                    <Link
                      href={`/repositories/${owner}/${repo}/discussions/${discussion.number}`}
                      className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                    >
                      {discussion.title}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mt-1">
                      {discussion.body.replace(/\r?\n|\r/g, ' ').substring(0, 150)}
                      {discussion.body.length > 150 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-4 w-4 mr-1" />
                        {discussion.author.login}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatDate(discussion.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        {discussion.comments.totalCount} comments
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          
          <div className="flex justify-center mt-6">
            <Pagination
              total={Math.ceil(totalCount / itemsPerPage)}
              page={page}
              onChange={setPage}
              showControls
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardBody className="py-8">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No discussions found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "No discussions match your filters. Try adjusting your search criteria."
                  : "This repository doesn't have any discussions yet. Start the conversation!"}
              </p>
              <Button
                color="primary"
                onPress={onCreateDiscussion}
              >
                Start a new discussion
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
