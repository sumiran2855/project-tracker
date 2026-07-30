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
  targetQuarter?: string;
  createdAt?: string;
  updatedAt?: string;
}
