import React from 'react';
import { Member, Employee, Project } from './projects.types';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
}

export interface WorkLog {
  id?: string;
  userId?: string;
  userName?: string;
  hours: number;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  startDate: string;
  dueDate: string;
  assignees: Member[];
  subtasks: Subtask[];
  comments: Comment[];
  projectId?: string;
  projectName?: string;
  attachmentsCount?: number;
  actualHours?: number;
  workLogs?: WorkLog[];
  newWorkLog?: { hours: number; date?: string; userName?: string; userId?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalTask extends Task {
  projectId: string;
  projectName: string;
}

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  availableMembers: any[];
  onSuccess?: () => void;
  defaultProjectId?: string;
}

export interface ProjectDetailAddTaskModalProps {
  onClose: () => void;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  newTaskDesc: string;
  setNewTaskDesc: (v: string) => void;
  newTaskStatus: Task['status'];
  setNewTaskStatus: (v: Task['status']) => void;
  newTaskPriority: Task['priority'];
  setNewTaskPriority: (v: Task['priority']) => void;
  newTaskStartDate: string;
  setNewTaskStartDate: (v: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (v: string) => void;
  newTaskAssignees: string[];
  setNewTaskAssignees: (v: string[]) => void;
  isEmployee: boolean;
  user: any;
  project: any;
  availableMembers: Employee[];
  onCreateTask: (e: React.FormEvent) => void;
}

export interface TasksTaskDetailDrawerProps {
  selectedTask: GlobalTask | null;
  setSelectedTask: (task: GlobalTask | null) => void;
  isClient: boolean;
  canEditHours: boolean;
  canDeleteTask: boolean;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (text: string) => void;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  user: any;
  handleUpdateTask: (task: GlobalTask) => void;
  handleDeleteTask: (taskId: string) => void;
  submitUpdateTask: (task: GlobalTask, hoursInput: number, isAdditional: boolean) => Promise<void>;
}

export interface ProjectDetailTaskDetailDrawerProps {
  selectedTask: Task;
  onClose: () => void;
  isClient: boolean;
  canEditHours: boolean;
  canDeleteTask: boolean;
  tasks: Task[];
  saveTasks: (t: Task[]) => void;
  onMoveTask: (taskId: string, targetStatus: Task['status']) => void;
  setSelectedTask: (task: Task | null) => void;
  onDeleteTask: (taskId: string) => void;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (v: string) => void;
  newCommentText: string;
  setNewCommentText: (v: string) => void;
  onAddSubtask: (e: React.FormEvent) => void;
  onToggleSubtask: (subId: string) => void;
  onDeleteSubtask: (subId: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  user: any;
}

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTaskProject: string;
  setNewTaskProject: (val: string) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskDesc: string;
  setNewTaskDesc: (val: string) => void;
  newTaskStatus: Task['status'];
  setNewTaskStatus: (val: Task['status']) => void;
  newTaskPriority: Task['priority'];
  setNewTaskPriority: (val: Task['priority']) => void;
  newTaskStartDate: string;
  setNewTaskStartDate: (val: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (val: string) => void;
  newTaskAssignees: string[];
  setNewTaskAssignees: (val: string[] | ((prev: string[]) => string[])) => void;
  projects: Project[];
  availableMembers: Employee[];
  user: any;
  isEmployee: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export interface TasksBoardProps {
  filteredTasks: GlobalTask[];
  isClient: boolean;
  canCreateTask: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  setNewTaskStatus: (status: Task['status']) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
  handleDrop: (e: React.DragEvent, targetStatus: Task['status']) => void;
  setSelectedTask: (task: GlobalTask) => void;
}

export interface TasksListProps {
  filteredTasks: GlobalTask[];
  canDeleteTask: boolean;
  handleUpdateTask: (task: GlobalTask) => void;
  handleDeleteTask: (taskId: string) => void;
  setSelectedTask: (task: GlobalTask) => void;
}

export interface TasksCalendarProps {
  filteredTasks: GlobalTask[];
  currentCalendarDate: Date;
  setCurrentCalendarDate: (date: Date) => void;
  setSelectedTask: (task: GlobalTask) => void;
}

export interface TasksKpisProps {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
}

export interface TasksTabsProps {
  activeTab: 'board' | 'list' | 'calendar';
  setActiveTab: (tab: 'board' | 'list' | 'calendar') => void;
}

export interface TasksHoursModalProps {
  isOpen: boolean;
  promptTask: GlobalTask | null;
  promptValue: string;
  setPromptValue: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export interface TasksHeaderProps {
  canCreateTask: boolean;
  projects: Project[];
  setNewTaskProject: (projectId: string) => void;
  setIsTaskModalOpen: (open: boolean) => void;
}

export interface TasksFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  projectFilter: string;
  setProjectFilter: (project: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  projects: Project[];
}

export interface TasksTimelineViewProps {
  displayTasks: Task[];
  onSelectTask: (task: Task) => void;
  getPriorityColor: (prio: Task['priority']) => string;
}

export interface ProjectTasksTabControllerProps {
  activeTab: 'kanban' | 'list' | 'timeline';
  setActiveTab: (val: 'kanban' | 'list' | 'timeline') => void;
  canCreateTask: boolean;
  onAddTaskClick: () => void;
}

export interface HoursPromptModalProps {
  promptValue: string;
  setPromptValue: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export interface TasksListViewProps {
  displayTasks: Task[];
  canDeleteTask: boolean;
  onMoveTask: (id: string, nextStatus: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (task: Task) => void;
  getPriorityColor: (prio: Task['priority']) => string;
}

export interface TasksKanbanViewProps {
  displayTasks: Task[];
  isClient: boolean;
  canCreateTask: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, status: Task['status']) => void;
  onSelectTask: (task: Task) => void;
  onAddTaskClick: (status: Task['status']) => void;
  getPriorityColor: (prio: Task['priority']) => string;
}


