import { Member } from './projects.types';

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
  actualHours?: number;
  workLogs?: WorkLog[];
  newWorkLog?: { hours: number; date?: string; userName?: string; userId?: string };
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}
