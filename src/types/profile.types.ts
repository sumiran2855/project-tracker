import React from 'react';
import type { Employee } from '@/types/projects.types';

export interface Member {
  name: string;
  initials: string;
  bg: string;
  role: string;
  email?: string;
  status?: 'Pending' | 'Accepted';
}

export interface ProjectStats {
  assignedTasks: number;
  completedTasks: number;
  loggedIssues: number;
  projectsCount: number;

  totalProjects: number;
  totalEmployees: number;
  totalPendingTasks: number;
  totalActiveIssues: number;

  clientProjectsCount: number;
  clientTasksCount: number;
  clientEmployeesCount: number;
  clientIssuesCount: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  department: string;
  joinDate: string;
  skills: string[];
}

export interface ManageCollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  systemEmployees: Employee[];
  selectedColleagueId: string;
  setSelectedColleagueId: (val: string) => void;
  newCollabRole: string;
  setNewCollabName: (val: string) => void;
  setNewCollabRole: (val: string) => void;
  newCollabBg: string;
  setNewCollabBg: (val: string) => void;
  isAddingColleague: boolean;
  collabs: Member[];
  onAddCollaborator: (e: React.FormEvent) => Promise<void>;
  onDeleteCollab: (name: string) => Promise<void>;
}

export interface ProfileDetailsPanelProps {
  profile: UserProfile;
}

export interface ProfileHeaderBannerProps {
  profile: UserProfile;
  initials: string;
  onEditClick: () => void;
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

export interface ProfileStatsGridProps {
  stats: ProjectStats;
  isEmployeeOrLead: boolean;
  isAdminOrManager: boolean;
  isClient: boolean;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editName: string;
  setEditName: (val: string) => void;
  editEmail: string;
  setEditEmail: (val: string) => void;
  editRole: string;
  setEditRole: (val: string) => void;
  editLocation: string;
  setEditLocation: (val: string) => void;
  editDepartment: string;
  setEditDepartment: (val: string) => void;
  editSkills: string[];
  newSkillText: string;
  setNewSkillText: (val: string) => void;
  onAddSkill: (e: React.KeyboardEvent) => void;
  onRemoveSkill: (skill: string) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
}

export interface CollaboratorsPanelProps {
  collabs: Member[];
  isAdmin: boolean;
  lastLogin?: string;
  onManageClick: () => void;
  onDeleteCollab: (name: string) => Promise<void>;
  onCopyInviteLink: () => Promise<void>;
}
