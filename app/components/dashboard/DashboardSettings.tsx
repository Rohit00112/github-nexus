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
  useDisclosure
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
  const handleSelectChange = (key: keyof DashboardConfig, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle number input changes
  const handleNumberChange = (key: keyof DashboardConfig, value: string) => {
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
      
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Dashboard Settings
              </ModalHeader>
              
              <ModalBody>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Visible Sections</h3>
                    <div className="space-y-2">
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
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Chart Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contribution Chart Type
                        </label>
                        <select
                          value={localConfig.contributionChartType}
                          onChange={(e) => handleSelectChange('contributionChartType', e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="bar">Bar Chart</option>
                          <option value="pie">Pie Chart</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contribution Metric
                        </label>
                        <select
                          value={localConfig.contributionMetric}
                          onChange={(e) => handleSelectChange('contributionMetric', e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="commits">Commits</option>
                          <option value="pullRequests">Pull Requests</option>
                          <option value="issues">Issues</option>
                          <option value="reviews">Reviews</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Content Limits</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Activity Timeline Items
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={localConfig.activityLimit}
                          onChange={(e) => handleNumberChange('activityLimit', e.target.value)}
                          className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Progress Items
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={localConfig.projectLimit}
                          onChange={(e) => handleNumberChange('projectLimit', e.target.value)}
                          className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
