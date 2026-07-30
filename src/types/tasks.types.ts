import { Member } from './projects.types';

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
