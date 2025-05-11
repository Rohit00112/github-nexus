"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import MainLayout from "../components/layout/MainLayout";
import { useAutomation } from "../context/AutomationContext";
import RuleList from "../components/automation/RuleList";
import RuleForm from "../components/automation/RuleForm";
import { Button } from "@nextui-org/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function AutomationPage() {
  const { status } = useSession();
  const { rules, isLoading } = useAutomation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

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
          {!isCreating && !editingRuleId && (
            <Button 
              color="primary" 
              startContent={<PlusIcon className="h-5 w-5" />}
              onPress={() => setIsCreating(true)}
            >
              Create Rule
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Rule</h2>
            <RuleForm 
              onCancel={() => setIsCreating(false)}
              onSuccess={() => setIsCreating(false)}
            />
          </div>
        )}

        {editingRuleId && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Rule</h2>
            <RuleForm 
              ruleId={editingRuleId}
              onCancel={() => setEditingRuleId(null)}
              onSuccess={() => setEditingRuleId(null)}
            />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Automation Rules</h2>
            <RuleList 
              onEdit={(ruleId) => setEditingRuleId(ruleId)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
