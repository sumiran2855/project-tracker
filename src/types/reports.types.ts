import React from 'react';

export interface Member {
  name: string;
  initials: string;
  bg: string;
}

export interface Project {
  id: string;
  name: string;
  dueDate: string;
  members: Member[];
  status: string;
  priority?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  assignees: Member[];
}

export interface ProjectStats {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface PriorityStats {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TeamStats {
  name: string;
  initials: string;
  bg: string;
  taskCount: number;
  load: number;
}

export interface DayLog {
  day: string;
  shortLabel?: string;
  fullDayLabel?: string;
  dateFormatted?: string;
  hours: number;
  projects: { projectName: string; hours: number }[];
  employees?: { employeeName: string; hours: number }[];
}

// Component Prop Interfaces
export interface LoggedHoursBarChartProps {
  user: any;
  router: any;
  weeklyTimeLogs: DayLog[];
  dailyCapacity: number;
  weeklyCapacity: number;
  isHoursMenuOpen: boolean;
  setIsHoursMenuOpen: (val: boolean) => void;
  hoveredHoursIndex: number | null;
  setHoveredHoursIndex: (idx: number | null) => void;
}

export interface ProjectWorkloadAllocationProps {
  projectStatsList: ProjectStats[];
}

export interface ReportsHeaderProps {
  onRefresh: () => void;
  onPrint: () => void;
}

export interface ReportsKpisProps {
  completionRate: number;
  completedTasksCount: number;
  tasksCount: number;
  projectsCount: number;
  overdueTasksCount: number;
}

export interface TaskPrioritiesChartProps {
  tasksCount: number;
  priorityStatsList: PriorityStats[];
}

export interface TeamCapacityListProps {
  teamStatsList: TeamStats[];
}

export interface ReportsHoursAnalyticsProps {
  projectBreakdown: { name: string; hours: number }[];
  totalHours: number;
  uniqueLoggedProjectsReport: string[];
  employeeBreakdown: { name: string; hours: number }[];
  dayBreakdown: { date: Date; dateStr: string; hours: number }[];
}

export interface ReportsHoursFiltersProps {
  presetFilter: string;
  setPresetFilter: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  searchText: string;
  setSearchText: (val: string) => void;
  activeTab: 'analytics' | 'ledger';
  setActiveTab: (val: 'analytics' | 'ledger') => void;
}

export interface ReportsHoursHeaderProps {
  loading: boolean;
  onSync: () => void;
  onBack: () => void;
}

export interface ReportsHoursKpisProps {
  totalHours: number;
  entriesCount: number;
  avgDailyHours: number;
  mostActiveProject: string;
}

export interface ReportsHoursLedgerProps {
  loading: boolean;
  sortBy: string;
  setSortBy: (val: string) => void;
  paginatedLogs: any[];
  filteredLogs: any[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}
