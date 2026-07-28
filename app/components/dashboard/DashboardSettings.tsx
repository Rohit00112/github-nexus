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
  Tooltip,
  useDisclosure,
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

const DashboardSettings: FC<DashboardSettingsProps> = ({ config = DEFAULT_CONFIG, onConfigChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);
  const [activeTab, setActiveTab] = useState<string>("visible-sections");

  useEffect(() => { setLocalConfig(config); }, [config]);

  const handleCheckboxChange = (key: keyof DashboardConfig) => {
    setLocalConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key: keyof DashboardConfig) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalConfig(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleNumberChange = (key: keyof DashboardConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setLocalConfig(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
    localStorage.setItem('github-nexus-dashboard-config', JSON.stringify(localConfig));
  };

  const handleReset = () => { setLocalConfig(DEFAULT_CONFIG); };

  return (
    <>
      <Tooltip content="Dashboard Settings">
        <Button isIconOnly variant="light" onPress={onOpen} className="text-muted-foreground hover:text-foreground rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside" backdrop="blur" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Dashboard Settings</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="border-b border-border">
                    <nav className="flex space-x-6" aria-label="Settings Tabs">
                      {["visible-sections", "chart-settings", "content-limits"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                            activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab.replace(/-/g, ' ')}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {activeTab === "visible-sections" && (
                    <div className="py-2 space-y-3">
                      <p className="text-sm text-muted-foreground">Select which sections to display on your dashboard</p>
                      {[
                        { key: 'showStatistics', label: 'Statistics Cards' },
                        { key: 'showContributionChart', label: 'Contribution Chart' },
                        { key: 'showContributionHeatmap', label: 'Contribution Heatmap' },
                        { key: 'showProjectProgress', label: 'Project Progress' },
                        { key: 'showActivityTimeline', label: 'Activity Timeline' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                          <Checkbox isSelected={localConfig[key as keyof DashboardConfig] as boolean} onValueChange={() => handleCheckboxChange(key as keyof DashboardConfig)} className="mr-2" />
                          <span className="text-sm">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "chart-settings" && (
                    <div className="py-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Chart Type</label>
                        <select value={localConfig.contributionChartType} onChange={handleSelectChange('contributionChartType')} className="block w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none">
                          <option value="bar">Bar Chart</option>
                          <option value="pie">Pie Chart</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Metric</label>
                        <select value={localConfig.contributionMetric} onChange={handleSelectChange('contributionMetric')} className="block w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none">
                          <option value="commits">Commits</option>
                          <option value="pullRequests">Pull Requests</option>
                          <option value="issues">Issues</option>
                          <option value="reviews">Reviews</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === "content-limits" && (
                    <div className="py-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Activity Timeline Items</label>
                        <input type="number" min="1" max="10" value={localConfig.activityLimit} onChange={handleNumberChange('activityLimit')} className="block w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Project Progress Items</label>
                        <input type="number" min="1" max="5" value={localConfig.projectLimit} onChange={handleNumberChange('projectLimit')} className="block w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex justify-between w-full">
                  <Button variant="light" onPress={handleReset} className="text-muted-foreground">Reset</Button>
                  <div className="flex gap-2">
                    <Button variant="flat" onPress={onClose}>Cancel</Button>
                    <Button color="primary" onPress={handleSave}>Save</Button>
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
