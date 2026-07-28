"use client";

import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "../components/layout/MainLayout";
import { useAutomation } from "../context/AutomationContext";
import RuleList from "../components/automation/RuleList";
import RuleForm from "../components/automation/RuleForm";
import RuleDetails from "../components/automation/RuleDetails";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { AutomationResourceType } from "../types/automation";

function AutomationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { rules, isLoading } = useAutomation();

  const [activeTab, setActiveTab] = useState("rules");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [_isCreating, setIsCreating] = useState(false);
  const [_isEditing, setIsEditing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const templateType = searchParams.get('template');

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="medium" />
        </div>
      </MainLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <MainLayout>
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl text-sm">
          You need to be signed in to access the automation features.
        </div>
      </MainLayout>
    );
  }

  const handleCreateRule = () => { setSelectedRuleId(null); setIsCreating(true); setIsEditing(false); setActiveTab("create"); };
  const handleEditRule = (ruleId: string) => { setSelectedRuleId(ruleId); setIsCreating(false); setIsEditing(true); setActiveTab("create"); };
  const _handleViewRule = (ruleId: string) => { setSelectedRuleId(ruleId); setIsCreating(false); setIsEditing(false); setActiveTab("details"); };
  const handleFormCancel = () => { setActiveTab("rules"); setIsCreating(false); setIsEditing(false); };
  const handleFormSuccess = () => { setActiveTab("rules"); setIsCreating(false); setIsEditing(false); };
  const createRuleFromTemplate = (templateType: string) => { setSelectedRuleId(null); setIsCreating(true); setIsEditing(false); setActiveTab("create"); router.push(`/automation?template=${templateType}`); };

  const ruleStats = {
    total: rules.length,
    enabled: rules.filter(r => r.enabled).length,
    issues: rules.filter(r => r.resourceType === AutomationResourceType.ISSUE).length,
    pullRequests: rules.filter(r => r.resourceType === AutomationResourceType.PULL_REQUEST).length,
    both: rules.filter(r => r.resourceType === AutomationResourceType.BOTH).length,
  };

  return (
    <MainLayout>
      <div className="py-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workflow Automation</h1>
            <p className="text-sm text-muted-foreground mt-1">Create and manage automation rules for your GitHub issues and pull requests</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowGuide(!showGuide); setShowTemplates(false); }}
              className="border border-border bg-card hover:bg-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {showGuide ? "Hide Guide" : "Guide"}
            </button>
            <button
              onClick={() => { setShowTemplates(!showTemplates); setShowGuide(false); }}
              className="border border-border bg-card hover:bg-accent px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {showTemplates ? "Hide Templates" : "Templates"}
            </button>
            <button
              onClick={handleCreateRule}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Rule
            </button>
          </div>
        </div>

        {showGuide && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold mb-3">Automation Guide</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-1">What are Automation Rules?</h3>
                <p>Automation rules allow you to automate repetitive tasks in your GitHub workflow. Each rule consists of conditions and actions. When all conditions are met, the actions are executed.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Creating Rules</h3>
                <p>To create a rule, click the &quot;Create Rule&quot; button. Give your rule a name and description, then define the conditions that should trigger the rule and the actions that should be executed.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Example Use Cases</h3>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>Automatically label issues based on their title or content</li>
                  <li>Assign pull requests to specific team members based on the files changed</li>
                  <li>Add comments to welcome new contributors</li>
                  <li>Close stale issues that haven&apos;t been updated in a while</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {showTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { type: "auto-label", title: "Auto-Label Issues", desc: "Automatically add labels to issues based on keywords in the title or body." },
              { type: "auto-assign", title: "Auto-Assign PRs", desc: "Automatically assign pull requests to team members based on criteria." },
              { type: "welcome-comment", title: "Welcome New Contributors", desc: "Add a welcome comment to first-time contributors' issues or PRs." },
            ].map((template) => (
              <button
                key={template.type}
                onClick={() => createRuleFromTemplate(template.type)}
                className="bg-card border border-border rounded-xl p-5 text-left hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-sm font-semibold mb-1">{template.title}</h3>
                <p className="text-xs text-muted-foreground">{template.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Rules", value: ruleStats.total },
            { label: "Enabled", value: ruleStats.enabled, color: "text-green-600 dark:text-green-400" },
            { label: "Issue Rules", value: ruleStats.issues + ruleStats.both, color: "text-primary" },
            { label: "PR Rules", value: ruleStats.pullRequests + ruleStats.both, color: "text-purple-600 dark:text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-xl p-5">
          {activeTab === "rules" && (
            isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="medium" />
              </div>
            ) : (
              <RuleList onEdit={handleEditRule} />
            )
          )}

          {activeTab === "create" && (
            <RuleForm
              ruleId={selectedRuleId ?? undefined}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              templateType={templateType || undefined}
            />
          )}

          {activeTab === "details" && selectedRuleId && (
            <RuleDetails rule={rules.find(r => r.id === selectedRuleId)!} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function AutomationPage() {
  return (
    <Suspense>
      <AutomationPageContent />
    </Suspense>
  );
}
