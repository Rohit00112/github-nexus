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
        classNames={{
          base: "bg-white dark:bg-gray-900",
          header: "border-b border-gray-200 dark:border-gray-800",
          footer: "border-t border-gray-200 dark:border-gray-800"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Dashboard Settings
              </ModalHeader>

              <ModalBody>
                <Tabs aria-label="Dashboard Settings Options" fullWidth>
                  <Tab key="visible-sections" title="Visible Sections">
                    <div className="py-2">
                      <CheckboxGroup
                        label="Select which sections to display on your dashboard"
                        orientation="vertical"
                        color="primary"
                      >
                        <Checkbox
                          isSelected={localConfig.showStatistics}
                          onValueChange={() => handleCheckboxChange('showStatistics')}
                        >
                          Statistics Cards
                        </Checkbox>

                        <Checkbox
                          isSelected={localConfig.showContributionChart}
                          onValueChange={() => handleCheckboxChange('showContributionChart')}
                        >
                          Contribution Chart
                        </Checkbox>

                        <Checkbox
                          isSelected={localConfig.showContributionHeatmap}
                          onValueChange={() => handleCheckboxChange('showContributionHeatmap')}
                        >
                          Contribution Heatmap
                        </Checkbox>

                        <Checkbox
                          isSelected={localConfig.showProjectProgress}
                          onValueChange={() => handleCheckboxChange('showProjectProgress')}
                        >
                          Project Progress
                        </Checkbox>

                        <Checkbox
                          isSelected={localConfig.showActivityTimeline}
                          onValueChange={() => handleCheckboxChange('showActivityTimeline')}
                        >
                          Activity Timeline
                        </Checkbox>
                      </CheckboxGroup>
                    </div>
                  </Tab>

                  <Tab key="chart-settings" title="Chart Settings">
                    <div className="py-2 space-y-4">
                      <Select
                        label="Contribution Chart Type"
                        selectedKeys={[localConfig.contributionChartType]}
                        onSelectionChange={(keys) => handleNextUISelectChange('contributionChartType', keys)}
                        className="w-full"
                      >
                        <SelectItem key="bar" value="bar">Bar Chart</SelectItem>
                        <SelectItem key="pie" value="pie">Pie Chart</SelectItem>
                      </Select>

                      <Select
                        label="Contribution Metric"
                        selectedKeys={[localConfig.contributionMetric]}
                        onSelectionChange={(keys) => handleNextUISelectChange('contributionMetric', keys)}
                        className="w-full"
                      >
                        <SelectItem key="commits" value="commits">Commits</SelectItem>
                        <SelectItem key="pullRequests" value="pullRequests">Pull Requests</SelectItem>
                        <SelectItem key="issues" value="issues">Issues</SelectItem>
                        <SelectItem key="reviews" value="reviews">Reviews</SelectItem>
                      </Select>
                    </div>
                  </Tab>

                  <Tab key="content-limits" title="Content Limits">
                    <div className="py-2 space-y-4">
                      <Input
                        type="number"
                        label="Activity Timeline Items"
                        min={1}
                        max={10}
                        value={localConfig.activityLimit.toString()}
                        onChange={handleNumberChange('activityLimit')}
                        className="w-full"
                      />

                      <Input
                        type="number"
                        label="Project Progress Items"
                        min={1}
                        max={5}
                        value={localConfig.projectLimit.toString()}
                        onChange={handleNumberChange('projectLimit')}
                        className="w-full"
                      />
                    </div>
                  </Tab>
                </Tabs>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={handleReset}>
                  Reset to Defaults
                </Button>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSave}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DashboardSettings;
