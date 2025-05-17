"use client";

import { FC, useState, useEffect } from 'react';
import { Switch, Divider, Button, Checkbox, CheckboxGroup } from '@nextui-org/react';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOn: string[];
  digestFrequency: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: false,
  notifyOn: ['mentions', 'issues', 'pullRequests', 'releases'],
  digestFrequency: 'daily',
};

const NotificationSettings: FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('github-nexus-notification-preferences');
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('Error parsing notification preferences:', error);
        }
      }
    }
  }, []);

  const handleSwitchChange = (key: keyof NotificationPreferences) => (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleNotifyOnChange = (values: string[]) => {
    setPreferences(prev => ({
      ...prev,
      notifyOn: values
    }));
  };

  const handleDigestFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      digestFrequency: e.target.value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('github-nexus-notification-preferences', JSON.stringify(preferences));
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Notification preferences saved successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage how and when you receive notifications from GitHub Nexus
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                isSelected={preferences.emailNotifications}
                onValueChange={handleSwitchChange('emailNotifications')}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                isSelected={preferences.pushNotifications}
                onValueChange={handleSwitchChange('pushNotifications')}
              />
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Notification Types</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select which events should trigger notifications
          </p>
          
          <CheckboxGroup
            value={preferences.notifyOn}
            onValueChange={handleNotifyOnChange}
            className="gap-1"
          >
            <Checkbox value="mentions">@Mentions</Checkbox>
            <Checkbox value="issues">Issues</Checkbox>
            <Checkbox value="pullRequests">Pull Requests</Checkbox>
            <Checkbox value="reviews">Code Reviews</Checkbox>
            <Checkbox value="releases">Releases</Checkbox>
            <Checkbox value="discussions">Discussions</Checkbox>
            <Checkbox value="securityAlerts">Security Alerts</Checkbox>
          </CheckboxGroup>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Digest Frequency</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            How often would you like to receive notification digests?
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="realtime"
                name="digestFrequency"
                value="realtime"
                checked={preferences.digestFrequency === 'realtime'}
                onChange={handleDigestFrequencyChange}
                className="mr-2"
              />
              <label htmlFor="realtime">Real-time (as they happen)</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="hourly"
                name="digestFrequency"
                value="hourly"
                checked={preferences.digestFrequency === 'hourly'}
                onChange={handleDigestFrequencyChange}
                className="mr-2"
              />
              <label htmlFor="hourly">Hourly digest</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="daily"
                name="digestFrequency"
                value="daily"
                checked={preferences.digestFrequency === 'daily'}
                onChange={handleDigestFrequencyChange}
                className="mr-2"
              />
              <label htmlFor="daily">Daily digest</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="weekly"
                name="digestFrequency"
                value="weekly"
                checked={preferences.digestFrequency === 'weekly'}
                onChange={handleDigestFrequencyChange}
                className="mr-2"
              />
              <label htmlFor="weekly">Weekly digest</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          color="primary"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
