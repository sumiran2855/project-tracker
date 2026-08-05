import React from 'react';
import type { Project } from './projects.types';

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  projectId: string;
  completed: boolean;
  assignedTo?: string;
}

export interface RoadmapControlsProps {
  activeTab: 'timeline' | 'board' | 'milestones';
  setActiveTab: (tab: 'timeline' | 'board' | 'milestones') => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  projectFilter: string;
  setProjectFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  projects: Project[];
  isEmployee: boolean;
}

export interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  newMilestoneTitle: string;
  setNewMilestoneTitle: (val: string) => void;
  newMilestoneDesc: string;
  setNewMilestoneDesc: (val: string) => void;
  newMilestoneDueDate: string;
  setNewMilestoneDueDate: (val: string) => void;
  newMilestoneProject: string;
  setNewMilestoneProject: (val: string) => void;
  newMilestoneAssignee: string;
  setNewMilestoneAssignee: (val: string) => void;
  projects: Project[];
  handleCreateMilestone: (e: React.FormEvent) => void;
}

export interface RoadmapHeaderProps {
  canManageRoadmap: boolean;
  projectsCount: number;
  onOpenMilestoneModal: () => void;
}

export interface RoadmapQuarterlyBoardProps {
  filteredProjects: Project[];
  milestones: MilestoneItem[];
  isEmployee: boolean;
  handleDragStart: (e: React.DragEvent, projectId: string) => void;
  handleDrop: (e: React.DragEvent, targetQuarter: Project['targetQuarter']) => void;
  handleDragOver: (e: React.DragEvent) => void;
  onOpenEditProjectModal: (project: Project) => void;
  getStatusStyles: (status: Project['status']) => string;
}

export interface RoadmapKpisProps {
  totalInitiatives: number;
  activeQuarters: number;
  completedMilestones: number;
  totalMilestones: number;
  onTrackInitiatives: number;
}

export interface RoadmapTimelineProps {
  filteredProjects: Project[];
  milestones: MilestoneItem[];
  isEmployee: boolean;
  onOpenEditProjectModal: (project: Project) => void;
  getStatusStyles: (status: Project['status']) => string;
}

export interface RoadmapMilestonesProps {
  filteredMilestones: MilestoneItem[];
  completedMilestones: number;
  totalMilestones: number;
  projects: Project[];
  canManageRoadmap: boolean;
  handleToggleMilestone: (id: string) => void;
  handleDeleteMilestone: (id: string) => void;
}

export const TIMELINE_START = new Date('2026-06-01');
export const TIMELINE_END = new Date('2026-11-30');
export const TOTAL_TIMELINE_DAYS = 183; // Approx days in 6 months (Jun-Nov)
