'use client';

import { useProfileService } from '@/services/useProfileService';
import { ProfileHeaderBanner } from '@/components/profile/ProfileHeaderBanner';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { ProfileDetailsPanel } from '@/components/profile/ProfileDetailsPanel';
import { CollaboratorsPanel } from '@/components/profile/CollaboratorsPanel';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ManageCollaboratorsModal } from '@/components/profile/ManageCollaboratorsModal';
import { FeedbackModal } from '@/components/profile/FeedbackModal';

export default function ProfilePage() {
  const {
    user,
    profile,
    collabs,
    stats,
    isEditModalOpen,
    setIsEditModalOpen,
    isCollabModalOpen,
    setIsCollabModalOpen,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editRole,
    setEditRole,
    editLocation,
    setEditLocation,
    editDepartment,
    setEditDepartment,
    editSkills,
    newSkillText,
    setNewSkillText,
    systemEmployees,
    selectedColleagueId,
    setSelectedColleagueId,
    newCollabRole,
    setNewCollabName,
    setNewCollabRole,
    newCollabBg,
    setNewCollabBg,
    isAddingColleague,
    feedbackModal,
    setFeedbackModal,
    isEmployeeOrLead,
    isAdminOrManager,
    isAdmin,
    isClient,
    initials,
    openEditModal,
    handleSaveProfile,
    handleAddSkill,
    handleRemoveSkill,
    handleAddCollaborator,
    handleDeleteCollab,
    handleCopyClientInviteLink
  } = useProfileService();

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">

        {/* Header Banner */}
        <ProfileHeaderBanner
          profile={profile}
          initials={initials}
          onEditClick={openEditModal}
        />

        {/* Stats Counter Grid */}
        <ProfileStatsGrid
          stats={stats}
          isEmployeeOrLead={isEmployeeOrLead}
          isAdminOrManager={isAdminOrManager}
          isClient={isClient}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info & Skills */}
          <ProfileDetailsPanel profile={profile} />

          {/* Collaborators Column */}
          <CollaboratorsPanel
            collabs={collabs}
            isAdmin={isAdmin}
            lastLogin={user?.lastLogin}
            onManageClick={() => setIsCollabModalOpen(true)}
            onDeleteCollab={handleDeleteCollab}
            onCopyInviteLink={handleCopyClientInviteLink}
          />
        </div>

      </div>

      {/* modal - Edit Profile & Collaborators Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editRole={editRole}
        setEditRole={setEditRole}
        editLocation={editLocation}
        setEditLocation={setEditLocation}
        editDepartment={editDepartment}
        setEditDepartment={setEditDepartment}
        editSkills={editSkills}
        newSkillText={newSkillText}
        setNewSkillText={setNewSkillText}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        onSave={handleSaveProfile}
      />

      {/* modal - Manage Collaborators Modal */}
      <ManageCollaboratorsModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        userEmail={user?.email}
        systemEmployees={systemEmployees}
        selectedColleagueId={selectedColleagueId}
        setSelectedColleagueId={setSelectedColleagueId}
        newCollabRole={newCollabRole}
        setNewCollabName={setNewCollabName}
        setNewCollabRole={setNewCollabRole}
        newCollabBg={newCollabBg}
        setNewCollabBg={setNewCollabBg}
        isAddingColleague={isAddingColleague}
        collabs={collabs}
        onAddCollaborator={handleAddCollaborator}
        onDeleteCollab={handleDeleteCollab}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        title={feedbackModal.title}
        message={feedbackModal.message}
        type={feedbackModal.type}
      />
    </>
  );
}
