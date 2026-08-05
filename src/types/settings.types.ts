import React from 'react';
import type { WorkspacePrefs, NotificationPrefs } from './auth.types';

export type TabType = 'profile' | 'notifications' | 'workspace' | 'data';

export interface WorkspaceSectionProps {
  workspace: WorkspacePrefs;
  setWorkspace: React.Dispatch<React.SetStateAction<WorkspacePrefs>>;
}

export interface NotificationsSectionProps {
  notifications: NotificationPrefs;
  toggleNotification: (key: keyof NotificationPrefs) => void;
}

export interface DataSectionProps {
  handleResetData: () => void;
}

export interface SettingsNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export interface SettingsFooterProps {
  isSavingPrefs: boolean;
  saveSuccess: boolean;
  prefsSaveError: string;
  handleSave: () => void;
}

export interface ProfileSectionProps {
  user: any;
  profileName: string;
  setProfileName: (val: string) => void;
  profileEmail: string;
  setProfileEmail: (val: string) => void;
  isSavingProfile: boolean;
  profileSaveSuccess: boolean;
  profileSaveError: string;
  handleSaveProfile: (e: React.FormEvent) => void;
}

export const defaultNotifications: NotificationPrefs = {
  emailTasks: true,
  emailDueDates: true,
  emailDigests: false,
  pushMentions: true,
  pushStatusChanges: false,
  soundAlerts: true
};

export const defaultWorkspace: WorkspacePrefs = {
  defaultView: 'Dashboard',
  theme: 'light',
  weekStart: 'Monday',
  accentTint: '#6366f1'
};
