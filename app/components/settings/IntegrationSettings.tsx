"use client";

import { FC, useState, useEffect } from 'react';
import { Card, CardBody, Button, Switch, Divider, Input } from '@nextui-org/react';
import { useAuth } from '../../hooks/useAuth';

interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: string;
}

const IntegrationSettings: FC = () => {
  const { session } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Receive notifications and updates in your Slack workspace',
      connected: false,
      icon: '/icons/slack.svg'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connect your Discord server for notifications and updates',
      connected: false,
      icon: '/icons/discord.svg'
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Link GitHub issues and pull requests with Jira tickets',
      connected: false,
      icon: '/icons/jira.svg'
    },
    {
      id: 'vscode',
      name: 'VS Code',
      description: 'Integrate with VS Code for a seamless development experience',
      connected: false,
      icon: '/icons/vscode.svg'
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      description: 'Connect your Jenkins CI/CD pipelines',
      connected: false,
      icon: '/icons/jenkins.svg'
    }
  ]);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Load saved integrations from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIntegrations = localStorage.getItem('github-nexus-integrations');
      const savedWebhookUrl = localStorage.getItem('github-nexus-webhook-url');
      
      if (savedIntegrations) {
        try {
          setIntegrations(JSON.parse(savedIntegrations));
        } catch (error) {
          console.error('Error parsing integrations:', error);
        }
      }
      
      if (savedWebhookUrl) {
        setWebhookUrl(savedWebhookUrl);
      }
    }
  }, []);

  // Save integrations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('github-nexus-integrations', JSON.stringify(integrations));
  }, [integrations]);

  // Save webhook URL to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('github-nexus-webhook-url', webhookUrl);
  }, [webhookUrl]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, connected: !integration.connected } 
          : integration
      )
    );
  };

  const handleWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookUrl(e.target.value);
  };

  const saveWebhookUrl = () => {
    // Save webhook URL (already saved in useEffect)
    alert('Webhook URL saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Integration Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect GitHub Nexus with other tools and services
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Connected Services</h3>
          <div className="space-y-4">
            {integrations.map(integration => (
              <Card key={integration.id} className="border border-gray-200 dark:border-gray-800">
                <CardBody className="flex flex-row items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                      {/* Placeholder for icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm ${integration.connected ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {integration.connected ? 'Connected' : 'Not connected'}
                    </span>
                    <Switch
                      isSelected={integration.connected}
                      onValueChange={() => toggleIntegration(integration.id)}
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Webhook Configuration</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Configure a webhook URL to receive events from GitHub Nexus
          </p>
          
          <div className="space-y-4">
            <Input
              label="Webhook URL"
              placeholder="https://example.com/webhook"
              value={webhookUrl}
              onChange={handleWebhookUrlChange}
              variant="bordered"
              fullWidth
            />
            
            <Button
              color="primary"
              onClick={saveWebhookUrl}
            >
              Save Webhook
            </Button>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">API Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage API tokens and access for external applications
          </p>
          
          <div className="space-y-4">
            <Card className="border border-gray-200 dark:border-gray-800">
              <CardBody className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">GitHub Access Token</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session?.accessToken 
                        ? 'Token is active and configured' 
                        : 'No token configured'}
                    </p>
                  </div>
                  <Button
                    color="primary"
                    variant="flat"
                    size="sm"
                  >
                    Manage
                  </Button>
                </div>
              </CardBody>
            </Card>
            
            <Button
              variant="bordered"
              fullWidth
            >
              Generate New API Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
