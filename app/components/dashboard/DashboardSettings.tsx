"use client";

import { FC, useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Tooltip,
  useDisclosure,
  Tabs,
  Tab,
  Input,
  Select,
  SelectItem
} from '@nextui-org/react';

export interface DashboardConfig {
  showStatistics: boolean;
  showContributionChart: boolean;
  showContributionHeatmap: boolean;
  showProjectProgress: boolean;
  showActivityTimeline: boolean;
  contributionChartType: 'bar' | 'pie';
  contributionMetric: 'commits' | 'pullRequests' | 'issues' | 'reviews';
  activityLimit: number;
  projectLimit: number;
}

interface DashboardSettingsProps {
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
}

const DEFAULT_CONFIG: DashboardConfig = {
  showStatistics: true,
  showContributionChart: true,
  showContributionHeatmap: true,
  showProjectProgress: true,
  showActivityTimeline: true,
  contributionChartType: 'pie',
  contributionMetric: 'commits',
  activityLimit: 5,
  projectLimit: 3
};

const DashboardSettings: FC<DashboardSettingsProps> = ({
  config = DEFAULT_CONFIG,
  onConfigChange
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);
  const [activeTab, setActiveTab] = useState<string>("visible-sections");

  // Update local config when props change
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Handle checkbox changes
  const handleCheckboxChange = (key: keyof DashboardConfig) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle select changes
  const handleSelectChange = (key: keyof DashboardConfig) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  // Handle NextUI select changes
  const handleNextUISelectChange = (key: keyof DashboardConfig, value: string | Set<string>) => {
    if (value instanceof Set && value.size > 0) {
      const selectedValue = Array.from(value)[0];
      setLocalConfig(prev => ({
        ...prev,
        [key]: selectedValue
      }));
    }
  };

  // Handle number input changes
  const handleNumberChange = (key: keyof DashboardConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setLocalConfig(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  // Save changes
  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();

    // Save to localStorage
    localStorage.setItem('github-nexus-dashboard-config', JSON.stringify(localConfig));
  };

  // Reset to defaults
  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
  };

  return (
    <>
      <Tooltip content="Dashboard Settings">
        <Button
          isIconOnly
          variant="light"
          onPress={onOpen}
          className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </Button>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
        backdrop="blur"
        placement="center"
        classNames={{
          base: "bg-white dark:bg-gray-900 rounded-lg shadow-lg",
          header: "border-b border-gray-200 dark:border-gray-800 px-6 py-4",
          body: "px-6 py-4",
          footer: "border-t border-gray-200 dark:border-gray-800 px-6 py-4",
          closeButton: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Dashboard Settings
              </ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8" aria-label="Settings Tabs">
                      <button
                        onClick={() => setActiveTab("visible-sections")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "visible-sections"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        Visible Sections
                      </button>
                      <button
                        onClick={() => setActiveTab("chart-settings")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "chart-settings"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        Chart Settings
                      </button>
                      <button
                        onClick={() => setActiveTab("content-limits")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "content-limits"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        Content Limits
                      </button>
                    </nav>
                  </div>

                  {/* Visible Sections Tab */}
                  {activeTab === "visible-sections" && (
                    <div className="py-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Select which sections to display on your dashboard
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Checkbox
                            isSelected={localConfig.showStatistics}
                            onValueChange={() => handleCheckboxChange('showStatistics')}
                            className="mr-2"
                          />
                          <span>Statistics Cards</span>
                        </div>

                        <div className="flex items-center">
                          <Checkbox
                            isSelected={localConfig.showContributionChart}
                            onValueChange={() => handleCheckboxChange('showContributionChart')}
                            className="mr-2"
                          />
                          <span>Contribution Chart</span>
                        </div>

                        <div className="flex items-center">
                          <Checkbox
                            isSelected={localConfig.showContributionHeatmap}
                            onValueChange={() => handleCheckboxChange('showContributionHeatmap')}
                            className="mr-2"
                          />
                          <span>Contribution Heatmap</span>
                        </div>

                        <div className="flex items-center">
                          <Checkbox
                            isSelected={localConfig.showProjectProgress}
                            onValueChange={() => handleCheckboxChange('showProjectProgress')}
                            className="mr-2"
                          />
                          <span>Project Progress</span>
                        </div>

                        <div className="flex items-center">
                          <Checkbox
                            isSelected={localConfig.showActivityTimeline}
                            onValueChange={() => handleCheckboxChange('showActivityTimeline')}
                            className="mr-2"
                          />
                          <span>Activity Timeline</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chart Settings Tab */}
                  {activeTab === "chart-settings" && (
                    <div className="py-2 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contribution Chart Type
                        </label>
                        <select
                          value={localConfig.contributionChartType}
                          onChange={(e) => handleSelectChange('contributionChartType')(e)}
                          className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="bar">Bar Chart</option>
                          <option value="pie">Pie Chart</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contribution Metric
                        </label>
                        <select
                          value={localConfig.contributionMetric}
                          onChange={(e) => handleSelectChange('contributionMetric')(e)}
                          className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="commits">Commits</option>
                          <option value="pullRequests">Pull Requests</option>
                          <option value="issues">Issues</option>
                          <option value="reviews">Reviews</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Content Limits Tab */}
                  {activeTab === "content-limits" && (
                    <div className="py-2 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Activity Timeline Items
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={localConfig.activityLimit}
                          onChange={(e) => handleNumberChange('activityLimit')(e)}
                          className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Project Progress Items
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={localConfig.projectLimit}
                          onChange={(e) => handleNumberChange('projectLimit')(e)}
                          className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <div className="flex justify-between w-full">
                  <Button
                    variant="light"
                    onPress={handleReset}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Reset to Defaults
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="flat"
                      onPress={onClose}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleSave}
                      className="bg-blue-600 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DashboardSettings;
