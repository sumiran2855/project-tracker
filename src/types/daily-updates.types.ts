export interface DailyUpdate {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userInitials?: string;
  userAvatarBg?: string;
  projectId: string;
  projectName: string;
  taskId?: string | null;
  taskTitle?: string;
  date: string;
  hoursSpent: number;
  summary: string;
  description: string;
  blockers?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyUpdateInput {
  projectId: string;
  taskId?: string | null;
  date?: string;
  hoursSpent?: number;
  summary: string;
  description: string;
  blockers?: string;
}

export interface DailyUpdateFilters {
  projectId?: string;
  userId?: string;
  date?: string;
  searchQuery?: string;
}
