import React from 'react';

export interface Member {
  userId?: string;
  id?: string;
  name: string;
  initials: string;
  bg: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  bg: string;
  manager?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'In Review' | 'Completed';
  progress: number;
  tags: string[];
  tasksCount: number;
  completedTasks: number;
  commentsCount: number;
  attachmentsCount: number;
  dueDate: string;
  members: Member[];
  managerId?: string;
  teamLeadId?: string;
  clientId?: string;
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
  startDate?: string;
  targetQuarter?: 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Future';
  createdAt?: string;
  updatedAt?: string;
}

export interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: any[];
  onSuccess?: () => void;
  projectToEdit?: any;
}

export interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  editStartDate: string;
  setEditStartDate: (val: string) => void;
  editDueDate: string;
  setEditDueDate: (val: string) => void;
  editQuarter: Project['targetQuarter'];
  setEditQuarter: (val: Project['targetQuarter']) => void;
  handleSaveProjectDates: (e: React.FormEvent) => void;
}

export interface ProjectsListGridProps {
  filteredProjects: Project[];
  canDeleteProject: boolean;
  onDeleteProject: (id: string, e: React.MouseEvent) => Promise<void>;
  getStatusStyles: (status: Project['status']) => string;
  getPriorityStyles: (priority?: Project['priority']) => string;
  formatDate: (dateStr: string) => string;
}

export interface ProjectsStatsGridProps {
  totalProjects: number;
  inProgressCount: number;
  inReviewCount: number;
  planningCount: number;
  completedCount: number;
}

export interface ProjectsHeaderProps {
  canCreateProject: boolean;
  onNewProjectClick: () => void;
}

export interface ProjectsFilterRowProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export interface ProjectDetailHeaderProps {
  project: Project;
  isEmployee: boolean;
  onBackToHub: () => void;
  onUpdateStatus: (val: any) => void;
  onEditDetailsClick: () => void;
  getProjectStatusBadge: (status: any) => string;
}

export interface ProjectStatsRibbonProps {
  project: Project;
  projectBudgetHours: number;
  totalLoggedProjectHours: number;
  remainingProjectHours: number;
  getPriorityColor: (prio: any) => string;
}

