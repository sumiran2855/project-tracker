import React from 'react';
import { Member } from './projects.types';
import { Comment } from './tasks.types';

export interface WorkLog {
  id?: string;
  userId?: string;
  userName?: string;
  hours: number;
  date: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Bug' | 'Task' | 'Improvement' | 'Security';
  projectId: string;
  projectName: string;
  dueDate: string;
  assignees: Member[];
  commentsCount: number;
  comments?: Comment[];
  actualHours?: number;
  workLogs?: WorkLog[];
  newWorkLog?: { hours: number; date?: string; userName?: string; userId?: string };
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AddIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  availableMembers: any[];
  onSuccess?: () => void;
  defaultType?: 'Bug' | 'Security' | 'Improvement' | 'Task';
  defaultStatus?: Issue['status'];
}

export interface IssueDetailDrawerProps {
  activeDetailItem: any | null;
  onClose: () => void;
  isClient: boolean;
  canEditHours: boolean;
  activeProjectTasks: any[];
  uploadingImage: boolean;
  user: any;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  handleUpdateStatus: (status: Issue['status']) => void;
  handleUpdatePriority: (priority: Issue['priority']) => void;
  handleUpdateType: (type: Issue['type']) => void;
  handleUpdateTargetDate: (date: string) => void;
  handleUpdateRelatedTask: (taskId: string) => void;
  handleAddAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAttachment: (url: string) => void;
  handleLogHours: (hours: number) => Promise<boolean>;
  handleAddComment: () => void;
  handleDeleteActiveItem: () => void;
}

export interface IssuesBoardViewProps {
  filteredIssues: Issue[];
  isClient: boolean;
  handleDragStart: (e: React.DragEvent, issueId: string) => void;
  handleDrop: (e: React.DragEvent, targetStatus: Issue['status']) => void;
  handleCardClick: (issue: Issue) => void;
  setModalStatus: (status: Issue['status']) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export interface IssuesListViewProps {
  filteredIssues: Issue[];
  canDeleteIssue: boolean;
  handleToggleStatus: (issue: Issue, e: React.MouseEvent) => void;
  handleCardClick: (issue: Issue) => void;
  handleDeleteIssue: (id: string, e: React.MouseEvent) => void;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

