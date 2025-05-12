"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAutomation } from "../context/AutomationContext";
import RuleList from "../components/automation/RuleList";
import RuleForm from "../components/automation/RuleForm";
import RuleDetails from "../components/automation/RuleDetails";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab
} from "@nextui-org/react";
import {
  PlusIcon,
  ChevronDownIcon,
  BookOpenIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { AutomationResourceType } from "../types/automation";

export default function AutomationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { rules, isLoading } = useAutomation();

  const [activeTab, setActiveTab] = useState("rules");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Check for template parameter in URL
  const templateType = searchParams.get('template');

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <MainLayout>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Authentication Required</h2>
          <p className="mt-2 text-red-700 dark:text-red-300">
            You need to be signed in to access the automation features.
          </p>
        </div>
      </MainLayout>
    );
  }

  const handleCreateRule = () => {
    setSelectedRuleId(null);
    setIsCreating(true);
    setIsEditing(false);
    setActiveTab("create");
  };

  const handleEditRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsCreating(false);
    setIsEditing(true);
    setActiveTab("create");
  };

  const handleViewRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsCreating(false);
    setIsEditing(false);
    setActiveTab("details");
  };

  const handleFormCancel = () => {
    setActiveTab("rules");
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleFormSuccess = () => {
    setActiveTab("rules");
    setIsCreating(false);
    setIsEditing(false);
  };

  const createRuleFromTemplate = (templateType: string) => {
    setSelectedRuleId(null);
    setIsCreating(true);
    setIsEditing(false);
    setActiveTab("create");
    // Template data will be handled in the RuleForm component
    // We'll pass the template type as a URL parameter
    router.push(`/automation?template=${templateType}`);
  };

  // Get rule statistics
  const ruleStats = {
    total: rules.length,
    enabled: rules.filter(r => r.enabled).length,
    issues: rules.filter(r => r.resourceType === AutomationResourceType.ISSUE).length,
    pullRequests: rules.filter(r => r.resourceType === AutomationResourceType.PULL_REQUEST).length,
    both: rules.filter(r => r.resourceType === AutomationResourceType.BOTH).length,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Workflow Automation</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage automation rules for your GitHub issues and pull requests
            </p>
          </div>
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<ChevronDownIcon className="h-4 w-4" />}
                >
                  Options
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Rule options">
                <DropdownItem
                  key="guide"
                  startContent={<BookOpenIcon className="h-4 w-4" />}
                  onPress={() => setShowGuide(!showGuide)}
                >
                  {showGuide ? "Hide Automation Guide" : "Show Automation Guide"}
                </DropdownItem>
                <DropdownItem
                  key="templates"
                  startContent={<LightBulbIcon className="h-4 w-4" />}
                  onPress={() => setShowTemplates(!showTemplates)}
                >
                  {showTemplates ? "Hide Rule Templates" : "Show Rule Templates"}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              color="primary"
              onPress={handleCreateRule}
              startContent={<PlusIcon className="h-4 w-4" />}
            >
              Create Rule
            </Button>
          </div>
        </div>

        {showGuide && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Automation Guide</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">What are Automation Rules?</h3>
                  <p className="text-sm">
                    Automation rules allow you to automate repetitive tasks in your GitHub workflow.
                    Each rule consists of conditions and actions. When all conditions are met, the actions are executed.
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Creating Rules</h3>
                  <p className="text-sm">
                    To create a rule, click the "Create New Rule" button. Give your rule a name and description,
                    then define the conditions that should trigger the rule and the actions that should be executed.
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Testing Rules</h3>
                  <p className="text-sm">
                    You can test your rules against existing issues or pull requests to see if they match and what actions would be taken.
                    This helps you verify that your rules work as expected before enabling them.
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Example Use Cases</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Automatically label issues based on their title or content</li>
                    <li>Assign pull requests to specific team members based on the files changed</li>
                    <li>Add comments to welcome new contributors</li>
                    <li>Close stale issues that haven't been updated in a while</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {showTemplates && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Rule Templates</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card shadow="sm" isPressable onPress={() => createRuleFromTemplate("auto-label")}>
                  <CardBody>
                    <h3 className="text-md font-medium mb-2">Auto-Label Issues</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically add labels to issues based on keywords in the title or body.
                    </p>
                  </CardBody>
                </Card>

                <Card shadow="sm" isPressable onPress={() => createRuleFromTemplate("auto-assign")}>
                  <CardBody>
                    <h3 className="text-md font-medium mb-2">Auto-Assign PRs</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically assign pull requests to team members based on criteria.
                    </p>
                  </CardBody>
                </Card>

                <Card shadow="sm" isPressable onPress={() => createRuleFromTemplate("welcome-comment")}>
                  <CardBody>
                    <h3 className="text-md font-medium mb-2">Welcome New Contributors</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add a welcome comment to first-time contributors' issues or PRs.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Rules</p>
              <p className="text-2xl font-bold">{ruleStats.total}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Enabled Rules</p>
              <p className="text-2xl font-bold text-success">{ruleStats.enabled}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Issue Rules</p>
              <p className="text-2xl font-bold text-primary">{ruleStats.issues + ruleStats.both}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">PR Rules</p>
              <p className="text-2xl font-bold text-secondary">{ruleStats.pullRequests + ruleStats.both}</p>
            </CardBody>
          </Card>
        </div>

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-6"
        >
          <Tab key="rules" title="Rules">
            <Card>
              <CardBody>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <RuleList
                    onEdit={handleEditRule}
                    onView={handleViewRule}
                  />
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="create" title={isCreating ? "Create Rule" : "Edit Rule"} isDisabled={!isCreating && !isEditing}>
            <Card>
              <CardBody>
                <RuleForm
                  ruleId={selectedRuleId}
                  onCancel={handleFormCancel}
                  onSuccess={handleFormSuccess}
                  templateType={templateType || undefined}
                />
              </CardBody>
            </Card>
          </Tab>

          <Tab key="details" title="Rule Details" isDisabled={!selectedRuleId || isCreating || isEditing}>
            <Card>
              <CardBody>
                {selectedRuleId && (
                  <RuleDetails
                    rule={rules.find(r => r.id === selectedRuleId)!}
                  />
                )}
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </MainLayout>
  );
}
