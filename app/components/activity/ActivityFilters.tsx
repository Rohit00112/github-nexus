"use client";

import { FC } from 'react';
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Button, 
  Chip, 
  CheckboxGroup, 
  Checkbox,
  Divider
} from '@nextui-org/react';

export interface ActivityFilters {
  eventTypes: string[];
  timeRange: string;
  repositories: string[];
}

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  repositories: { name: string; full_name: string }[];
}

const ActivityFilters: FC<ActivityFiltersProps> = ({
  filters,
  onFiltersChange,
  repositories
}) => {
  const handleEventTypeChange = (selectedTypes: string[]) => {
    onFiltersChange({
      ...filters,
      eventTypes: selectedTypes
    });
  };

  const handleTimeRangeChange = (timeRange: string) => {
    onFiltersChange({
      ...filters,
      timeRange
    });
  };

  const handleRepositoryChange = (selectedRepos: string[]) => {
    onFiltersChange({
      ...filters,
      repositories: selectedRepos
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      {/* Event Type Filter */}
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            className="capitalize"
            endContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
          >
            Event Types
            {filters.eventTypes.length > 0 && (
              <Chip size="sm" className="ml-2">{filters.eventTypes.length}</Chip>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Event Types"
          closeOnSelect={false}
          selectionMode="multiple"
          selectedKeys={new Set(filters.eventTypes)}
          onSelectionChange={(keys) => handleEventTypeChange(Array.from(keys) as string[])}
        >
          <DropdownItem key="commit">Commits</DropdownItem>
          <DropdownItem key="issue">Issues</DropdownItem>
          <DropdownItem key="pull_request">Pull Requests</DropdownItem>
          <DropdownItem key="release">Releases</DropdownItem>
          <DropdownItem key="fork">Forks</DropdownItem>
          <DropdownItem key="star">Stars</DropdownItem>
          <DropdownItem key="comment">Comments</DropdownItem>
          <DropdownItem key="review">Reviews</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Time Range Filter */}
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            className="capitalize"
            endContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
          >
            {filters.timeRange || "All Time"}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Time Range"
          selectionMode="single"
          selectedKeys={new Set([filters.timeRange])}
          onSelectionChange={(keys) => handleTimeRangeChange(Array.from(keys)[0] as string)}
        >
          <DropdownItem key="today">Today</DropdownItem>
          <DropdownItem key="week">This Week</DropdownItem>
          <DropdownItem key="month">This Month</DropdownItem>
          <DropdownItem key="quarter">Last 3 Months</DropdownItem>
          <DropdownItem key="year">This Year</DropdownItem>
          <DropdownItem key="">All Time</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Repository Filter */}
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="flat" 
            className="capitalize"
            endContent={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            }
          >
            Repositories
            {filters.repositories.length > 0 && (
              <Chip size="sm" className="ml-2">{filters.repositories.length}</Chip>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Repositories"
          closeOnSelect={false}
          selectionMode="multiple"
          selectedKeys={new Set(filters.repositories)}
          onSelectionChange={(keys) => handleRepositoryChange(Array.from(keys) as string[])}
          className="max-h-64 overflow-y-auto"
        >
          {repositories.map((repo) => (
            <DropdownItem key={repo.full_name} textValue={repo.name}>
              {repo.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      {/* Clear Filters Button */}
      {(filters.eventTypes.length > 0 || filters.timeRange || filters.repositories.length > 0) && (
        <Button 
          variant="light" 
          color="danger"
          onPress={() => onFiltersChange({
            eventTypes: [],
            timeRange: '',
            repositories: []
          })}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default ActivityFilters;
