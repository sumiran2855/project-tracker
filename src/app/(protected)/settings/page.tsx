'use client';

import React from 'react';
import { useSettingsService } from '@/services/useSettingsService';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { SettingsNavigation } from '@/components/settings/SettingsNavigation';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { NotificationsSection } from '@/components/settings/NotificationsSection';
import { WorkspaceSection } from '@/components/settings/WorkspaceSection';
import { DataSection } from '@/components/settings/DataSection';
import { SettingsFooter } from '@/components/settings/SettingsFooter';

export default function SettingsPage() {
  const service = useSettingsService();

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Header */}
      <SettingsHeader />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        
        {/* Navigation Tabs Card */}
        <SettingsNavigation
          activeTab={service.activeTab}
          setActiveTab={service.setActiveTab}
        />

        {/* Content Box */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[420px]">
          
          {/* Main Area */}
          <div className="p-6 sm:p-8 flex-1 space-y-6">
            
            {/* 1. Profile Section */}
            {service.activeTab === 'profile' && (
              <ProfileSection
                user={service.user}
                profileName={service.profileName}
                setProfileName={service.setProfileName}
                profileEmail={service.profileEmail}
                setProfileEmail={service.setProfileEmail}
                isSavingProfile={service.isSavingProfile}
                profileSaveSuccess={service.profileSaveSuccess}
                profileSaveError={service.profileSaveError}
                handleSaveProfile={service.handleSaveProfile}
              />
            )}

            {/* 2. Notifications Section */}
            {service.activeTab === 'notifications' && (
              <NotificationsSection
                notifications={service.notifications}
                toggleNotification={service.toggleNotification}
              />
            )}

            {/* 3. Workspace Preferences Section */}
            {service.activeTab === 'workspace' && (
              <WorkspaceSection
                workspace={service.workspace}
                setWorkspace={service.setWorkspace}
              />
            )}

            {/* 4. Storage Section */}
            {service.activeTab === 'data' && (
              <DataSection
                handleResetData={service.handleResetData}
              />
            )}

          </div>

          {/* Footer bar — only for notifications & workspace tabs */}
          {(service.activeTab === 'notifications' || service.activeTab === 'workspace') && (
            <SettingsFooter
              isSavingPrefs={service.isSavingPrefs}
              saveSuccess={service.saveSuccess}
              prefsSaveError={service.prefsSaveError}
              handleSave={service.handleSave}
            />
          )}

        </div>
      </div>
    </div>
  );
}
