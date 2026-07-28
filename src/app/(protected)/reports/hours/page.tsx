'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import {
  Clock,
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  User,
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
  X,
  Sparkles,
  PieChart,
  Briefcase,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import { getTasksByProjectAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';

// Enhanced color scheme for visual widgets
const WIDGET_COLORS = [
  { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600', bar: 'bg-gradient-to-r from-indigo-500 to-violet-500', glow: 'shadow-indigo-500/20' },
  { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', bar: 'bg-gradient-to-r from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', bar: 'bg-gradient-to-r from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
  { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600', bar: 'bg-gradient-to-r from-rose-500 to-pink-500', glow: 'shadow-rose-500/20' },
  { bg: 'bg-violet-50 border-violet-100', text: 'text-violet-600', bar: 'bg-gradient-to-r from-violet-500 to-purple-500', glow: 'shadow-violet-500/20' },
  { bg: 'bg-cyan-50 border-cyan-100', text: 'text-cyan-600', bar: 'bg-gradient-to-r from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
];

function getWidgetTheme(name: string, allNames: string[]) {
  const idx = allNames.indexOf(name);
  return WIDGET_COLORS[(idx >= 0 ? idx : 0) % WIDGET_COLORS.length];
}

function getDateRange(preset: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_week': {
      const day = now.getDay();
      const diffToMon = now.getDate() - (day === 0 ? 6 : day - 1);
      start.setDate(diffToMon);
      start.setHours(0, 0, 0, 0);
      end.setDate(diffToMon + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'prev_week': {
      const day = now.getDay();
      const diffToMon = now.getDate() - (day === 0 ? 6 : day - 1) - 7;
      start.setDate(diffToMon);
      start.setHours(0, 0, 0, 0);
      end.setDate(diffToMon + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'prev_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'custom':
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      } else {
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
      break;
  }
  return { start, end };
}

export default function EnhancedHoursReportPage() {
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [allWorkItems, setAllWorkItems] = useState<any[]>([]);

  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<'analytics' | 'ledger'>('analytics');

  // Filters State
  const [presetFilter, setPresetFilter] = useState('this_week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isEmployeeRole = (user?.role || '').toLowerCase() === 'employee';

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, empRes] = await Promise.all([
        getProjectsAction(),
        getEmployeesAction()
      ]);

      let projectsList: any[] = [];
      if (projRes.success && projRes.data) {
        projectsList = projRes.data;
        setActiveProjects(projectsList);
      }

      if (empRes.success && empRes.data) {
        setAllEmployees(empRes.data);
      }

      if (projectsList.length > 0) {
        const tasksPromises = projectsList.map(p => getTasksByProjectAction(p.id || p._id));
        const issuesPromises = projectsList.map(p => getIssuesByProjectAction(p.id || p._id));

        const [tasksResList, issuesResList] = await Promise.all([
          Promise.all(tasksPromises),
          Promise.all(issuesPromises)
        ]);

        const items: any[] = [];
        tasksResList.forEach((tRes, idx) => {
          if (tRes.success && tRes.data) {
            items.push(...tRes.data.map((t: any) => ({ ...t, itemType: 'task', projectName: projectsList[idx].name })));
          }
        });

        issuesResList.forEach((iRes, idx) => {
          if (iRes.success && iRes.data) {
            items.push(...iRes.data.map((i: any) => ({ ...i, itemType: 'issue', projectName: projectsList[idx].name })));
          }
        });

        setAllWorkItems(items);
      }
    } catch (err) {
      console.error("Error loading hours report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Flatten work logs from all tasks & issues
  const allLogs = useMemo(() => {
    const logs: any[] = [];
    allWorkItems.forEach((item: any) => {
      const assignees = Array.isArray(item.assignees) ? item.assignees : [];
      const primaryAssigneeName = assignees.length > 0
        ? (typeof assignees[0] === 'string' ? assignees[0] : assignees[0].name)
        : (typeof item.assignee === 'string' ? item.assignee : (item.assignee?.name || item.updatedByUserName || item.createdByUserName || ''));

      const projName = item.projectName || 'Project Workspace';
      const projId = item.projectId;
      const itemActual = Number(item.actualHours) || 0;

      if (Array.isArray(item.workLogs) && item.workLogs.length > 0) {
        item.workLogs.forEach((wl: any, idx: number) => {
          const rawH = Number(wl.hours) || 0;
          let resolvedUserName = wl.userName || wl.author || wl.name;
          const logUserId = wl.userId || wl.id;

          if (!resolvedUserName && logUserId) {
            if (user?.id && String(user.id) === String(logUserId)) {
              resolvedUserName = user.name;
            } else if (Array.isArray(allEmployees)) {
              const matchedEmp = allEmployees.find((e: any) => String(e.id || e._id) === String(logUserId));
              if (matchedEmp) resolvedUserName = matchedEmp.name;
            }
          }
          if (!resolvedUserName) {
            resolvedUserName = primaryAssigneeName || 'Employee';
          }

          logs.push({
            id: `${item.id || item._id}-log-${idx}`,
            itemId: item.id || item._id,
            itemName: item.title,
            itemType: item.itemType || 'task',
            hours: rawH,
            date: new Date(wl.date || wl.createdAt || item.updatedAt || item.createdAt),
            userName: resolvedUserName,
            userId: logUserId,
            projectName: projName,
            projectId: projId,
          });
        });
      }
    });
    return logs;
  }, [allWorkItems, allEmployees, user]);

  // Apply filters, search, and sorting
  const filteredLogs = useMemo(() => {
    let result = [...allLogs];

    // Filter by employee role
    if (isEmployeeRole && user) {
      result = result.filter(log => {
        return (log.userName && user.name && log.userName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
               (log.userId && user.id && String(log.userId) === String(user.id));
      });
    }

    // Filter by date range preset
    const { start, end } = getDateRange(presetFilter, customStartDate, customEndDate);
    result = result.filter(log => {
      const time = log.date.getTime();
      return time >= start.getTime() && time <= end.getTime();
    });

    // Filter by search query
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(log =>
        log.itemName.toLowerCase().includes(q) ||
        log.projectName.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.getTime() - a.date.getTime();
      if (sortBy === 'date_asc') return a.date.getTime() - b.date.getTime();
      if (sortBy === 'hours_desc') return b.hours - a.hours;
      if (sortBy === 'hours_asc') return a.hours - b.hours;
      return b.date.getTime() - a.date.getTime();
    });

    return result;
  }, [allLogs, presetFilter, customStartDate, customEndDate, searchText, sortBy, isEmployeeRole, user]);

  // Aggregate metrics & breakdowns
  const totalHours = useMemo(() => {
    const sum = filteredLogs.reduce((acc, log) => acc + log.hours, 0);
    return Math.round(sum * 100) / 100;
  }, [filteredLogs]);

  const uniqueLoggedProjectsReport = useMemo(() => {
    const set = new Set(filteredLogs.map(l => l.projectName));
    return Array.from(set);
  }, [filteredLogs]);

  const projectBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLogs.forEach(log => {
      map[log.projectName] = (map[log.projectName] || 0) + log.hours;
    });
    return Object.entries(map)
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredLogs]);

  const employeeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLogs.forEach(log => {
      map[log.userName] = (map[log.userName] || 0) + log.hours;
    });
    return Object.entries(map)
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredLogs]);

  const dayBreakdown = useMemo(() => {
    const map: Record<string, { date: Date; hours: number }> = {};
    filteredLogs.forEach(log => {
      const dateKey = log.date.toDateString();
      if (!map[dateKey]) {
        map[dateKey] = { date: log.date, hours: 0 };
      }
      map[dateKey].hours += log.hours;
    });
    return Object.values(map)
      .map(item => ({
        date: item.date,
        dateStr: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        hours: Math.round(item.hours * 100) / 100
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredLogs]);

  const mostActiveProject = useMemo(() => {
    if (projectBreakdown.length === 0) return 'None';
    return projectBreakdown[0].name;
  }, [projectBreakdown]);

  const avgDailyHours = useMemo(() => {
    if (dayBreakdown.length === 0) return 0;
    const total = dayBreakdown.reduce((acc, d) => acc + d.hours, 0);
    return Math.round((total / dayBreakdown.length) * 10) / 10;
  }, [dayBreakdown]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Reset pagination on filter adjustments
  useEffect(() => {
    setCurrentPage(1);
  }, [presetFilter, customStartDate, customEndDate, searchText, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      
      {/* Hero Header Section matching image layout */}
      <div className="px-6 sm:px-8 py-6">
        <div className="max-w-8xl mx-auto space-y-3.5">
          
          {/* Top Badge Category */}
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Time Management
          </div>

          {/* Main Title and Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Icon Container */}
              <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-3xs">
                <Clock className="h-5.5 w-5.5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Hours Logged Report
              </h1>
            </div>

            {/* Solid Indigo/Purple Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-3xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={cn("h-3 w-3 text-slate-400", loading && "animate-spin")} />
                Sync Data
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-3xl">
            Analyze aggregate team capacity, individual workloads, and historical time log entries across the lifecycle.
          </p>

        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="max-w-8xl mx-auto px-6 sm:px-8 py-6 space-y-6">
        
        {/* KPI Metrics Cards Grid styled exactly like the provided image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total Hours Logged */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-3xs flex flex-col justify-between hover:scale-[1.01] hover:shadow-xs transition-all duration-300">
            <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-550 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800 block tracking-tight">
                {totalHours}
              </span>
              <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mt-1">
                Total Hours Logged
              </span>
              <div className="w-8 h-0.5 bg-slate-300 mt-3 rounded-full" />
            </div>
          </div>

          {/* Card 2: Log Entries Recorded */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-3xs flex flex-col justify-between hover:scale-[1.01] hover:shadow-xs transition-all duration-300">
            <div className="h-9 w-9 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800 block tracking-tight">
                {filteredLogs.length}
              </span>
              <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mt-1">
                Log Entries Recorded
              </span>
              <div className="w-8 h-0.5 bg-indigo-300 mt-3 rounded-full" />
            </div>
          </div>

          {/* Card 3: Daily Average */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-3xs flex flex-col justify-between hover:scale-[1.01] hover:shadow-xs transition-all duration-300">
            <div className="h-9 w-9 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800 block tracking-tight">
                {avgDailyHours}h
              </span>
              <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mt-1">
                Daily Average
              </span>
              <div className="w-8 h-0.5 bg-emerald-300 mt-3 rounded-full" />
            </div>
          </div>

          {/* Card 4: Most Active Project */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-3xs flex flex-col justify-between hover:scale-[1.01] hover:shadow-xs transition-all duration-300">
            <div className="h-9 w-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="mt-4">
              <span className="text-lg font-black text-slate-800 block tracking-tight truncate max-w-full" title={mostActiveProject}>
                {mostActiveProject}
              </span>
              <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mt-1">
                Most Active Project
              </span>
              <div className="w-8 h-0.5 bg-amber-300 mt-3 rounded-full" />
            </div>
          </div>

        </div>

        {/* Dynamic Filters Widget Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Reporting Span:
            </span>

            <div className="relative">
              <select
                value={presetFilter}
                onChange={(e) => setPresetFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-3xs hover:bg-slate-100/50 transition-colors"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="prev_week">Previous Week</option>
                <option value="this_month">This Month</option>
                <option value="prev_month">Previous Month</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-450 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {presetFilter === 'custom' && (
              <div className="flex items-center gap-2 animate-fadeIn mt-1 sm:mt-0">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-750 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-3xs"
                />
                <span className="text-slate-400 font-bold text-xs">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-750 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-3xs"
                />
              </div>
            )}
          </div>

          {/* Right side Search bar & Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Search input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9.5 pr-8 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 placeholder-slate-400 transition-all shadow-3xs text-slate-750"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-750"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Tab switch buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  "flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  activeTab === 'analytics'
                    ? "bg-white text-slate-800 shadow-3xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <PieChart className="h-3.5 w-3.5" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={cn(
                  "flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  activeTab === 'ledger'
                    ? "bg-white text-slate-800 shadow-3xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Log Ledger
              </button>
            </div>

          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'analytics' ? (
          
          /* VIEW 1: ADVANCED VISUAL ANALYTICS */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Project Allocation Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="h-4 w-4 text-indigo-500" />
                  Project Allocations
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Distribution of time across projects</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4.5 pt-4.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {projectBreakdown.length > 0 ? (
                  projectBreakdown.map((proj) => {
                    const theme = getWidgetTheme(proj.name, uniqueLoggedProjectsReport);
                    const percent = totalHours > 0 ? Math.round((proj.hours / totalHours) * 100) : 0;
                    return (
                      <div key={proj.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("h-2 w-2 rounded-full shrink-0", theme.bar)} />
                            <span className="text-slate-800 truncate" title={proj.name}>{proj.name}</span>
                          </div>
                          <span className="text-slate-650 shrink-0 font-extrabold">{proj.hours}h ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-500", theme.bar, theme.glow)} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 italic text-xs gap-1.5">
                    <PieChart className="h-6 w-6 text-slate-300" />
                    <span>No project logs recorded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Employee Contribution Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4 text-emerald-500" />
                  Employee Share
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Logged hours by team members</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pt-4.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {employeeBreakdown.length > 0 ? (
                  employeeBreakdown.map((emp) => {
                    const theme = getWidgetTheme(emp.name, employeeBreakdown.map(e => e.name));
                    const initials = emp.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                    const percent = totalHours > 0 ? Math.round((emp.hours / totalHours) * 100) : 0;
                    return (
                      <div key={emp.name} className="flex items-center justify-between border border-slate-100 bg-slate-50/50 hover:bg-slate-50 px-4 py-2.5 rounded-2xl transition-all shadow-3xs text-xs font-bold">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8.5 w-8.5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-655 uppercase shadow-3xs shrink-0">
                            {initials}
                          </div>
                          <span className="text-slate-850 truncate">{emp.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn("font-black block", theme.text)}>{emp.hours}h</span>
                          <span className="text-[9px] text-slate-400 block font-bold">{percent}% share</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 italic text-xs gap-1.5">
                    <User className="h-6 w-6 text-slate-300" />
                    <span>No employee log shares</span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Distribution Timeline Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-rose-500" />
                  Logged Timeline
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">Day-by-day logs metrics</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pt-4.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {dayBreakdown.length > 0 ? (
                  dayBreakdown.map((day) => (
                    <div key={day.dateStr} className="flex items-center justify-between border border-slate-150 bg-slate-50/50 hover:bg-slate-50 px-4 py-3 rounded-2xl transition-all shadow-3xs text-xs font-bold">
                      <span className="text-slate-600">{day.dateStr}</span>
                      <span className="text-indigo-650 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-lg text-[10px] font-black">{day.hours} hrs</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 italic text-xs gap-1.5">
                    <Calendar className="h-6 w-6 text-slate-300" />
                    <span>No timeline entries recorded</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          
          /* VIEW 2: INTERACTIVE TIME LOG LEDGER */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-550" />
                  Time-Tracking Log Ledger
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Filter, search, and sort entries</p>
              </div>

              {/* Table sorting */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Filter className="h-3 w-3" />
                  Sort Order:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs hover:bg-slate-100/50 transition-all"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="hours_desc">Highest Hours</option>
                    <option value="hours_asc">Lowest Hours</option>
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-450 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-3xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black uppercase tracking-wider text-slate-450">
                    <th className="px-5 py-3.5">Logged Date</th>
                    <th className="px-5 py-3.5">Employee Name</th>
                    <th className="px-5 py-3.5">Project Path</th>
                    <th className="px-5 py-3.5">Sprints Task/Issue</th>
                    <th className="px-5 py-3.5 text-right">Time Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-20 text-center text-slate-450 italic">
                        <div className="flex flex-col items-center justify-center gap-2.5">
                          <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                          <span className="font-bold">Retrieving complete time logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      const dateObj = new Date(log.date);
                      const dateString = isNaN(dateObj.getTime())
                        ? 'Unknown'
                        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const timeString = isNaN(dateObj.getTime())
                        ? ''
                        : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                      const isIssue = log.itemType === 'issue';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                          
                          {/* Date string */}
                          <td className="px-5 py-4 font-semibold text-slate-750">
                            <div>{dateString}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{timeString}</div>
                          </td>

                          {/* Employee User */}
                          <td className="px-5 py-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="h-6.5 w-6.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-550 shrink-0 uppercase shadow-3xs">
                                {log.userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                              </div>
                              <span className="truncate max-w-[150px]">{log.userName}</span>
                            </div>
                          </td>

                          {/* Project Name */}
                          <td className="px-5 py-4 font-semibold text-slate-650">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Folder className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[140px]" title={log.projectName}>{log.projectName}</span>
                            </div>
                          </td>

                          {/* Task / Issue title */}
                          <td className="px-5 py-4 text-slate-755">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider shrink-0 border",
                                isIssue
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-indigo-50 text-indigo-650 border-indigo-100'
                              )}>
                                {log.itemType}
                              </span>
                              <span className="font-bold truncate max-w-[240px]" title={log.itemName}>
                                {log.itemName}
                              </span>
                            </div>
                          </td>

                          {/* Hours count */}
                          <td className="px-5 py-4 text-right font-black text-slate-850 text-sm">
                            {log.hours}h
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-20 text-center text-slate-405 italic">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-7 w-7 text-slate-300" />
                          <span className="font-semibold">No work logs matching current search filters</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Displaying {paginatedLogs.length} of {filteredLogs.length} logs (Page {currentPage} of {totalPages})
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-3xs"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-650" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-3xs"
                >
                  <ChevronRight className="h-4 w-4 text-slate-650" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
