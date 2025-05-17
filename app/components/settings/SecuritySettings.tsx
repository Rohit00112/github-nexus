"use client";

import { FC, useState, useEffect } from 'react';
import { Card, CardBody, Button, Switch, Divider, Input } from '@nextui-org/react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';

const SecuritySettings: FC = () => {
  const { session, signOut } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  const [activityLog, setActivityLog] = useState<string[]>([
    'Signed in from Chrome on macOS - 2 hours ago',
    'Changed notification settings - Yesterday',
    'Connected Slack integration - 3 days ago',
    'Updated profile information - 1 week ago',
    'First login - 2 weeks ago'
  ]);

  // Load saved security settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTwoFactor = localStorage.getItem('github-nexus-two-factor');
      const savedSessionTimeout = localStorage.getItem('github-nexus-session-timeout');
      const savedShowSensitiveData = localStorage.getItem('github-nexus-show-sensitive-data');
      
      if (savedTwoFactor) setTwoFactorEnabled(savedTwoFactor === 'true');
      if (savedSessionTimeout) setSessionTimeout(savedSessionTimeout);
      if (savedShowSensitiveData) setShowSensitiveData(savedShowSensitiveData === 'true');
    }
  }, []);

  // Save security settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('github-nexus-two-factor', String(twoFactorEnabled));
    localStorage.setItem('github-nexus-session-timeout', sessionTimeout);
    localStorage.setItem('github-nexus-show-sensitive-data', String(showSensitiveData));
  }, [twoFactorEnabled, sessionTimeout, showSensitiveData]);

  const handleSessionTimeoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSessionTimeout(e.target.value);
  };

  const handleRevokeAllSessions = () => {
    if (confirm('Are you sure you want to revoke all active sessions? You will be signed out.')) {
      // In a real app, this would call an API to revoke all sessions
      alert('All sessions have been revoked. You will now be signed out.');
      signOut();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your account security and privacy settings
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Account Security</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                isSelected={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
              />
            </div>

            <div>
              <p className="font-medium mb-2">Session Timeout</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Automatically sign out after a period of inactivity
              </p>
              <select
                value={sessionTimeout}
                onChange={handleSessionTimeoutChange}
                className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
                <option value="480">8 hours</option>
                <option value="never">Never</option>
              </select>
            </div>

            <Button
              color="danger"
              variant="flat"
              onClick={handleRevokeAllSessions}
            >
              Revoke All Active Sessions
            </Button>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Privacy</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Show Sensitive Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display sensitive repository and organization information
                </p>
              </div>
              <Switch
                isSelected={showSensitiveData}
                onValueChange={setShowSensitiveData}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Activity Tracking</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow GitHub Nexus to track your activity for better recommendations
                </p>
              </div>
              <Switch defaultSelected />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Usage Analytics</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share anonymous usage data to help improve GitHub Nexus
                </p>
              </div>
              <Switch defaultSelected />
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardBody className="p-0">
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {activityLog.map((activity, index) => (
                  <li key={index} className="px-4 py-3">
                    <p className="text-sm">{activity}</p>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          
          <div className="mt-4">
            <Link href="/settings/activity" className="text-blue-600 dark:text-blue-400 text-sm">
              View full activity log →
            </Link>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4 text-red-600 dark:text-red-500">Danger Zone</h3>
          
          <Card className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
            <CardBody className="p-4">
              <h4 className="font-medium mb-2">Delete Account</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Permanently delete your GitHub Nexus account and all associated data. This action cannot be undone.
              </p>
              <Button
                color="danger"
                variant="flat"
              >
                Delete Account
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
