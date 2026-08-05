import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { updateProfileAction, updatePreferencesAction } from '@/actions/auth';
import type { WorkspacePrefs, NotificationPrefs } from '@/types/auth.types';
import { defaultNotifications, defaultWorkspace } from '@/types/settings.types';

export function useSettingsService() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'workspace' | 'data'>('profile');

  // Profile fields — seeded from real user context
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  const [notifications, setNotifications] = useState<NotificationPrefs>(defaultNotifications);
  const [workspace, setWorkspace] = useState<WorkspacePrefs>(defaultWorkspace);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [prefsSaveError, setPrefsSaveError] = useState('');

  // Keep profile & preferences fields in sync when user context loads/updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      if (user.workspacePrefs) {
        setWorkspace(user.workspacePrefs);
      }
      if (user.notificationPrefs) {
        setNotifications(user.notificationPrefs);
      }
    }
  }, [user]);

  // Load non-profile configuration from localStorage as fallback
  useEffect(() => {
    const savedNotifications = localStorage.getItem('pwt_settings_notifications');
    if (savedNotifications && !user?.notificationPrefs) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedWorkspace = localStorage.getItem('pwt_settings_workspace');
    if (savedWorkspace && !user?.workspacePrefs) {
      setWorkspace(JSON.parse(savedWorkspace));
    }
  }, [user?.notificationPrefs, user?.workspacePrefs]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    setProfileSaveError('');
    const res = await updateProfileAction({
      name: profileName,
      email: profileEmail,
      role: user.role || '',
      location: user.location || '',
      department: user.department || '',
      skills: user.skills || [],
      collaborators: user.collaborators || [],
    });
    setIsSavingProfile(false);
    if (res.success && res.data) {
      setUser(res.data);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } else {
      setProfileSaveError(res.error || 'Failed to save profile');
    }
  };

  const handleSave = async () => {
    setIsSavingPrefs(true);
    setPrefsSaveError('');

    // Save to local storage for immediate fallback access
    localStorage.setItem('pwt_settings_notifications', JSON.stringify(notifications));
    localStorage.setItem('pwt_settings_workspace', JSON.stringify(workspace));

    // Save to backend database
    const res = await updatePreferencesAction({
      workspacePrefs: workspace,
      notificationPrefs: notifications,
    });

    setIsSavingPrefs(false);

    if (res.success && res.data) {
      setUser(res.data);
    } else if (res.error) {
      setPrefsSaveError(res.error);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all workspace data? This will clear all projects, tasks, issues, and reset to defaults.')) {
      localStorage.clear();
      // Reload page to re-trigger default datasets
      window.location.reload();
    }
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return {
    user,
    activeTab,
    setActiveTab,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    isSavingProfile,
    profileSaveSuccess,
    profileSaveError,
    notifications,
    setNotifications,
    workspace,
    setWorkspace,
    isSavingPrefs,
    saveSuccess,
    prefsSaveError,
    handleSaveProfile,
    handleSave,
    handleResetData,
    toggleNotification,
  };
}
