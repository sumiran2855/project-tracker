import React from 'react';
import type { Task } from '@/types/tasks.types';

export interface SprintItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  startDate?: string;
  assignees: any[];
  actualHours?: number;
  workLogs?: any[];
  comments?: any[];
  projectId?: string;
  projectName?: string;
  itemType: 'task' | 'issue';
  // Issue specific
  type?: string;
  commentsCount?: number;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  attachments?: string[];
  // Task specific
  subtasks?: any[];
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface SprintFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterProject: string;
  setFilterProject: (project: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  projects: ProjectOption[];
  filteredCount: number;
}

export interface SprintDetailDrawerProps {
  isOpen: boolean;
  activeDetailItem: SprintItem | null;
  onClose: () => void;
  isClient: boolean;
  canEditHours: boolean;
  tasks: Task[];
  user: any;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  newSubtaskText: string;
  setNewSubtaskText: (text: string) => void;
  uploadingImage: boolean;
  handleUpdateStatus: (newStatus: string) => void;
  handleUpdatePriority: (newPriority: string) => void;
  handleUpdateTargetDate: (newVal: string) => void;
  handleSaveHoursValue: () => void;
  handleUpdateRelatedTask: (newTaskId: string) => void;
  handleAddAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAttachment: (urlToRemove: string) => void;
  handleAddComment: () => void;
  handleToggleSubtask: (subId: string) => void;
  handleAddSubtask: () => void;
  handleDeleteActiveItem: () => void;
}

export interface SprintKpisProps {
  completionPercentage: number;
  completedItems: number;
  totalItems: number;
  completedTasksCount: number;
  totalTasksCount: number;
  resolvedIssuesCount: number;
  totalIssuesCount: number;
  totalLoggedHours: number;
}

export interface SprintHeaderProps {
  weekRangeStr: string;
  viewMode: 'sheet' | 'board';
  setViewMode: (mode: 'sheet' | 'board') => void;
}

export interface HoursModalTarget {
  id: string;
  type: 'task' | 'issue';
  newStatus: string;
}

export interface SprintHoursModalProps {
  isOpen: boolean;
  hoursModalTarget: HoursModalTarget | null;
  inputHours: string;
  setInputHours: (hours: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export interface SprintSpreadsheetProps {
  filteredSprintItems: SprintItem[];
  monday: Date;
  handleItemClick: (item: SprintItem) => void;
}

export interface MemberAnalytic {
  id: string;
  name: string;
  email?: string;
  role?: string;
  initials: string;
  bg?: string;
  assignedCount: number;
  completedCount: number;
  pct: number;
}

export interface SprintWorkloadProps {
  memberAnalytics: MemberAnalytic[];
  setSelectedEmployee: (employee: any) => void;
}

export interface SprintBoardProps {
  filteredSprintItems: SprintItem[];
  columns: string[];
  draggedOverCol: string | null;
  isClient: boolean;
  monday: Date;
  handleDragOver: (e: React.DragEvent, col: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, col: string) => void;
  handleDragStart: (e: React.DragEvent, cardId: string, cardType: 'task' | 'issue') => void;
  handleItemClick: (item: SprintItem) => void;
  setSelectedEmployee: (employee: any) => void;
}
