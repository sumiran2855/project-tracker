import React from 'react';

export interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
  } | null;
  children: React.ReactNode;
}

export interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onClose?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export interface QuickActionsPanelProps {
  projects: any[];
  employees: any[];
}

export interface TeamMember {
  initials: string;
  name: string;
  bg: string;
}

export interface DashboardProject {
  id?: string;
  name: string;
  category: string;
  status: string;
  progress: number;
  due: string;
  bar: string;
  tasks: { completed: number; total: number };
  team: TeamMember[];
  updatedAt: string;
}

export interface HoursLoggedCardProps {
  weeklyHoursList: any[];
  weeklyCapacity: number;
  dailyCapacity: number;
  isEmployeeRole: boolean;
  canViewWorkload: boolean;
  maxHours: number;
  uniqueLoggedProjects: string[];
  uniqueLoggedEmployees: string[];
}

export interface TeamHierarchyCardProps {
  hierarchyTree: any[];
}

export interface StatCardProps {
  label: string;
  value: string;
  change: string;
  iconName: string;
  tint: string;
  positive?: boolean;
}

export interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id?: string;
    name: string;
    email?: string;
    role?: string;
    initials?: string;
    bg?: string;
  } | null;
  assignedItems?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    actualHours?: number;
    itemType?: 'task' | 'issue';
    projectName?: string;
  }>;
  onSelectWorkItem?: (item: any) => void;
}
