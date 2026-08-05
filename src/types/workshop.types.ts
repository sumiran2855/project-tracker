import React from 'react';
import type { Task, Subtask, Comment } from '@/types/tasks.types';
import type { Issue } from '@/types/issues.types';

export interface Member {
  userId?: string;
  id?: string;
  name: string;
  initials: string;
  bg: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'In Review';
  progress: number;
  tags: string[];
  tasksCount: number;
  completedTasks: number;
  commentsCount: number;
  attachmentsCount: number;
  dueDate: string;
  members: Member[];
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
  startDate?: string;
  targetQuarter?: 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Future';
}

export type ViewMode = 'sheet' | 'kanban';

export interface CardDetailItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type?: string;
  dueDate?: string;
  startDate?: string;
  assignees: Member[];
  actualHours?: number;
  workLogs?: any[];
  comments: Comment[];
  subtasks?: Subtask[];
  itemType: 'task' | 'issue';
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  attachments?: string[];
  projectId?: string;
}

export interface WorkshopDetailDrawerProps {
  activeDetailItem: CardDetailItem | null;
  setActiveDetailItem: (item: CardDetailItem | null) => void;
  isClient: boolean;
  canEditHours: boolean;
  user: any;
  selectedProjTasks: Task[];
  handleUpdateStatus: (status: any) => Promise<void>;
  handleUpdatePriority: (priority: any) => Promise<void>;
  handleUpdateStartDate: (val: string) => Promise<void>;
  handleSaveHoursValue: (hours: number) => Promise<void>;
  handleUpdateTargetDate: (val: string) => Promise<void>;
  handleUpdateRelatedTask: (val: string) => Promise<void>;
  handleAddAttachment: (files: FileList | null) => Promise<void>;
  handleRemoveAttachment: (url: string) => Promise<void>;
  handleToggleSubtask: (subId: string) => Promise<void>;
  handleAddSubtask: () => Promise<void>;
  handleAddComment: () => Promise<void>;
  handleDeleteActiveItem: () => Promise<boolean>;
  newSubtaskText: string;
  setNewSubtaskText: (val: string) => void;
  newCommentText: string;
  setNewCommentText: (val: string) => void;
  uploadingImage: boolean;
}

export interface WorkshopFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  visibleColumns: {
    quarter: boolean;
    priority: boolean;
    status: boolean;
    progress: boolean;
    techStack: boolean;
    budget: boolean;
    team: boolean;
  };
  setVisibleColumns: (cols: any) => void;
  showColMenu: boolean;
  setShowColMenu: (val: boolean) => void;
}

export interface WorkshopSheetProps {
  filteredProjects: Project[];
  handleSort: (field: 'name' | 'progress' | 'priority' | 'status' | 'dueDate') => void;
  visibleColumns: {
    quarter: boolean;
    priority: boolean;
    status: boolean;
    progress: boolean;
    techStack: boolean;
    budget: boolean;
    team: boolean;
  };
  handleProjectClick: (project: Project) => void;
}

export interface WorkshopHoursModalProps {
  showHoursModal: boolean;
  hoursModalTarget: { id: string; type: 'task' | 'issue'; newStatus: string } | null;
  inputHours: string;
  setInputHours: (val: string) => void;
  handleSaveTransitionHours: () => void;
  setShowHoursModal: (val: boolean) => void;
  setHoursModalTarget: (val: any) => void;
}

export interface WorkshopKpisProps {
  totalProjects: number;
  inProgressCount: number;
  inReviewCount: number;
  planningCount: number;
  completedCount: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
  issues: Issue[];
}

export interface WorkshopKanbanBoardProps {
  kanbanLoading: boolean;
  kanbanColumns: KanbanColumn[];
  draggedOverCol: string | null;
  isClient: boolean;
  handleDragOver: (e: React.DragEvent, colId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, colId: string) => void;
  handleDragStart: (e: React.DragEvent, cardId: string, cardType: 'task' | 'issue') => void;
  handleCardClick: (cardId: string, cardType: 'task' | 'issue') => void;
}

export interface WorkshopHeaderProps {
  exportToCSV: () => void;
  canCreateProject: boolean;
  setActiveModal: (modal: 'project' | 'task' | 'issue' | null) => void;
}

export interface WorkshopKanbanHeaderProps {
  selectedProject: Project;
  setViewMode: (mode: 'sheet' | 'kanban') => void;
  handleRefreshKanban: () => void;
  isEmployee: boolean;
  setActiveModal: (modal: 'project' | 'task' | 'issue' | null) => void;
}
