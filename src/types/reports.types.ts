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

export const WIDGET_COLORS = [
  { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-605', bar: 'bg-gradient-to-r from-indigo-500 to-violet-500', glow: 'shadow-indigo-500/20' },
  { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', bar: 'bg-gradient-to-r from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', bar: 'bg-gradient-to-r from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
  { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-650', bar: 'bg-gradient-to-r from-rose-500 to-pink-500', glow: 'shadow-rose-500/20' },
  { bg: 'bg-violet-50 border-violet-100', text: 'text-violet-600', bar: 'bg-gradient-to-r from-violet-500 to-purple-500', glow: 'shadow-violet-500/20' },
  { bg: 'bg-cyan-50 border-cyan-100', text: 'text-cyan-600', bar: 'bg-gradient-to-r from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
];
 
export const GRADIENT_PALETTE = [
  {
    bg: 'bg-gradient-to-t from-indigo-650 via-indigo-50 to-cyan-400',
    barBg: 'bg-gradient-to-r from-indigo-650 to-cyan-400',
    dotBg: 'bg-indigo-600',
    text: 'text-indigo-650',
    accent: '#4F46E5',
  },
  {
    bg: 'bg-gradient-to-t from-violet-600 via-purple-500 to-pink-400',
    barBg: 'bg-gradient-to-r from-violet-600 to-pink-400',
    dotBg: 'bg-violet-600',
    text: 'text-violet-650',
    accent: '#7C3AED',
  },
  {
    bg: 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400',
    barBg: 'bg-gradient-to-r from-emerald-600 to-cyan-400',
    dotBg: 'bg-emerald-600',
    text: 'text-emerald-650',
    accent: '#059669',
  },
  {
    bg: 'bg-gradient-to-t from-rose-600 via-pink-500 to-orange-400',
    barBg: 'bg-gradient-to-r from-rose-600 to-orange-400',
    dotBg: 'bg-rose-600',
    text: 'text-rose-650',
    accent: '#E11D48',
  },
  {
    bg: 'bg-gradient-to-t from-blue-600 via-sky-500 to-indigo-400',
    barBg: 'bg-gradient-to-r from-blue-600 to-indigo-400',
    dotBg: 'bg-blue-600',
    text: 'text-blue-650',
    accent: '#2563EB',
  },
  {
    bg: 'bg-gradient-to-t from-cyan-600 via-teal-500 to-emerald-400',
    barBg: 'bg-gradient-to-r from-cyan-600 to-emerald-400',
    dotBg: 'bg-cyan-600',
    text: 'text-cyan-655',
    accent: '#0891B2',
  },
  {
    bg: 'bg-gradient-to-t from-amber-600 via-amber-550 to-yellow-400',
    barBg: 'bg-gradient-to-r from-amber-600 to-yellow-400',
    dotBg: 'bg-amber-600',
    text: 'text-amber-650',
    accent: '#D97706',
  },
];
