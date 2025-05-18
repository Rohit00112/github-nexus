"use client";

import { FC, useState, useEffect } from 'react';
import { useGitHub } from '../../context/GitHubContext';
import { Card, CardBody, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';

interface ActivityCalendarProps {
  username?: string;
}

interface CalendarDay {
  date: string;
  count: number;
  level: number; // 0-4 for intensity
}

interface CalendarWeek {
  days: CalendarDay[];
}

interface CalendarData {
  weeks: CalendarWeek[];
  totalContributions?: number;
}

const ActivityCalendar: FC<ActivityCalendarProps> = ({ username }) => {
  const { githubService } = useGitHub();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);

  // Get available years (current year and 2 previous years)
  const availableYears = [year, year - 1, year - 2];

  useEffect(() => {
    async function fetchCalendarData() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user if username is not provided
        let targetUsername = username;
        if (!targetUsername) {
          const user = await githubService.getCurrentUser();
          targetUsername = user.login;
        }
        
        // Fetch contribution data
        const contributionData = await githubService.getUserContributionCalendar(targetUsername, year);
        setCalendarData(contributionData);
      } catch (err) {
        console.error("Error fetching contribution calendar:", err);
        setError("Failed to load contribution data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCalendarData();
  }, [githubService, username, year]);

  const handleYearChange = (selectedYear: string) => {
    setYear(parseInt(selectedYear));
  };

  // Get color for contribution level
  const getLevelColor = (level: number) => {
    const colors = {
      0: 'bg-gray-100 dark:bg-gray-800',
      1: 'bg-green-100 dark:bg-green-900',
      2: 'bg-green-300 dark:bg-green-700',
      3: 'bg-green-500 dark:bg-green-500',
      4: 'bg-green-700 dark:bg-green-300'
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center items-center h-64">
          <Spinner size="lg" color="primary" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-4">
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!calendarData) {
    return (
      <Card>
        <CardBody className="p-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-md">
            No contribution data available.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Contribution Calendar</h3>
          
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
                {year}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Year Selection"
              selectionMode="single"
              selectedKeys={new Set([year.toString()])}
              onSelectionChange={(keys) => handleYearChange(Array.from(keys)[0] as string)}
            >
              {availableYears.map((y) => (
                <DropdownItem key={y.toString()}>{y}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        {calendarData.totalContributions !== undefined && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{calendarData.totalContributions.toLocaleString()}</span> contributions in {year}
            </p>
          </div>
        )}
        
        <div className="relative">
          {/* Calendar grid */}
          <div className="flex flex-col gap-1">
            {/* Month labels */}
            <div className="flex text-xs text-gray-500 dark:text-gray-400 mb-1 pl-6">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={month} className="flex-1" style={{ marginLeft: i === 0 ? '0' : '' }}>
                  {month}
                </div>
              ))}
            </div>
            
            {/* Day labels and calendar cells */}
            <div className="flex">
              {/* Day of week labels */}
              <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 pr-2">
                <div className="h-3"></div> {/* Empty space for alignment */}
                <div className="h-3 flex items-center">Mon</div>
                <div className="h-3 flex items-center">Wed</div>
                <div className="h-3 flex items-center">Fri</div>
              </div>
              
              {/* Calendar cells */}
              <div className="flex-1 flex gap-1">
                {calendarData.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`h-3 w-3 rounded-sm ${getLevelColor(day.level)} cursor-pointer transition-colors`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tooltip */}
          {hoveredDay && (
            <div className="absolute top-0 left-0 bg-white dark:bg-gray-900 shadow-lg rounded-md p-2 text-xs z-10 pointer-events-none transform -translate-y-full">
              <p className="font-medium">{formatDate(hoveredDay.date)}</p>
              <p>{hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span className="mr-2">Less</span>
          <div className={`h-3 w-3 rounded-sm ${getLevelColor(0)}`}></div>
          <div className={`h-3 w-3 rounded-sm ${getLevelColor(1)} ml-1`}></div>
          <div className={`h-3 w-3 rounded-sm ${getLevelColor(2)} ml-1`}></div>
          <div className={`h-3 w-3 rounded-sm ${getLevelColor(3)} ml-1`}></div>
          <div className={`h-3 w-3 rounded-sm ${getLevelColor(4)} ml-1`}></div>
          <span className="ml-2">More</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default ActivityCalendar;
