"use client";

import { FC, useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGitHub } from '../../context/GitHubContext';
import { Input, Button, Avatar, Divider } from '@nextui-org/react';
import Image from 'next/image';

const ProfileSettings: FC = () => {
  const { session } = useAuth();
  const { githubService } = useGitHub();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    bio: '',
    company: '',
    location: '',
    website: '',
    twitter: '',
  });

  useEffect(() => {
    async function fetchUserProfile() {
      if (!githubService) return;
      
      setIsLoading(true);
      try {
        const user = await githubService.getCurrentUser();
        setUserData({
          name: user.name || '',
          bio: user.bio || '',
          company: user.company || '',
          location: user.location || '',
          website: user.blog || '',
          twitter: user.twitter_username || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [githubService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!githubService) return;
    
    setIsSaving(true);
    try {
      await githubService.updateUser({
        name: userData.name,
        bio: userData.bio,
        company: userData.company,
        location: userData.location,
        blog: userData.website,
        twitter_username: userData.twitter,
      });
      // Show success message
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your GitHub profile information. These changes will be reflected on your GitHub account.
        </p>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Avatar
          src={session?.user?.image || undefined}
          className="w-20 h-20"
          alt="Profile"
        />
        <div>
          <p className="font-medium">{session?.user?.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Profile picture is managed by GitHub
          </p>
        </div>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <Input
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            placeholder="Your name"
            variant="bordered"
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company
          </label>
          <Input
            name="company"
            value={userData.company}
            onChange={handleInputChange}
            placeholder="Company or organization"
            variant="bordered"
            fullWidth
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <Input
            name="bio"
            value={userData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            variant="bordered"
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <Input
            name="location"
            value={userData.location}
            onChange={handleInputChange}
            placeholder="Your location"
            variant="bordered"
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website
          </label>
          <Input
            name="website"
            value={userData.website}
            onChange={handleInputChange}
            placeholder="https://example.com"
            variant="bordered"
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Twitter Username
          </label>
          <Input
            name="twitter"
            value={userData.twitter}
            onChange={handleInputChange}
            placeholder="@username"
            variant="bordered"
            fullWidth
            startContent={
              <span className="text-gray-400">@</span>
            }
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          color="primary"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
