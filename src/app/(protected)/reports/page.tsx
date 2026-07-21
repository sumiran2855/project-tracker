'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, usePermission } from '@/contexts/UserContext';
import { 
  BarChart3, 
  TrendingUp, 
  Folder, 
  CheckSquare, 
  AlertCircle,
  Printer,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { getProjectsAction } from '@/actions/projects';
import { getAllTasksAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';

const PROJECT_COLOR_PALETTE = [
  { bg: 'bg-indigo-500', text: 'text-indigo-500', hex: '#6366f1' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10b981' },
  { bg: 'bg-violet-500', text: 'text-violet-500', hex: '#8b5cf6' },
  { bg: 'bg-amber-500', text: 'text-amber-500', hex: '#f59e0b' },
  { bg: 'bg-rose-500', text: 'text-rose-500', hex: '#f43f5e' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', hex: '#06b6d4' },
  { bg: 'bg-purple-500', text: 'text-purple-500', hex: '#a855f7' },
];

function getProjColor(projName: string, allProjNames: string[]) {
  const idx = allProjNames.indexOf(projName);
  return PROJECT_COLOR_PALETTE[(idx >= 0 ? idx : 0) % PROJECT_COLOR_PALETTE.length];
}

// Types
interface Member {
  name: string;
  initials: string;
  bg: string;
}

interface Project {
  id: string;
  name: string;
  dueDate: string;
  members: Member[];
  status: string;
}

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  assignees: Member[];
}

interface ProjectStats {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

interface PriorityStats {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface TeamStats {
  name: string;
  initials: string;
  bg: string;
  taskCount: number;
  load: number; // percentage
}

// Fallbacks
const defaultProjects: Project[] = [];

const fallbackTasks: Record<string, Task[]> = {
  '1': [
    { id: 't1', title: 'Task 1', status: 'Done', priority: 'High', dueDate: '2026-07-06', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
    { id: 't2', title: 'Task 2', status: 'In Progress', priority: 'Medium', dueDate: '2026-07-12', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
    { id: 't3', title: 'Task 3', status: 'To Do', priority: 'Low', dueDate: '2026-07-20', assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }] },
    { id: 't4', title: 'Task 4', status: 'In Review', priority: 'High', dueDate: '2026-07-15', assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }] },
    { id: 't5', title: 'Task 5', status: 'To Do', priority: 'Urgent', dueDate: '2026-07-24', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
  ],
  '2': [
    { id: 't6', title: 'Task 6', status: 'Done', priority: 'High', dueDate: '2026-07-04', assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }] },
    { id: 't7', title: 'Task 7', status: 'In Progress', priority: 'Urgent', dueDate: '2026-07-12', assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }, { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }] },
    { id: 't8', title: 'Task 8', status: 'To Do', priority: 'Medium', dueDate: '2026-07-18', assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }] },
  ],
  '3': [
    { id: 't9', title: 'Task 9', status: 'In Progress', priority: 'Medium', dueDate: '2026-07-28', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
    { id: 't10', title: 'Task 10', status: 'To Do', priority: 'Low', dueDate: '2026-08-01', assignees: [{ name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' }] },
  ]
};

const defaultHours = [
  { day: 'Mon', hours: 12 },
  { day: 'Tue', hours: 16 },
  { day: 'Wed', hours: 10 },
  { day: 'Thu', hours: 15 },
  { day: 'Fri', hours: 18 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 2 },
];

export default function ReportsPage() {
  const { user } = useUser();
  const router = useRouter();
  const canViewReports = usePermission('report:view');

  useEffect(() => {
    if (user && !canViewReports) {
      router.push('/dashboard');
    }
  }, [user, canViewReports, router]);

  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  
function getCurrentWeekDays() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = now.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(now);
  monday.setDate(diffToMon);
  monday.setHours(0, 0, 0, 0);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return days.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const yearNum = d.getFullYear();
    const dateFormatted = `${dayNum}-${monthNum}-${yearNum}`;
    const shortLabel = `${dayName} (${dayNum}/${monthNum})`;
    const fullLabel = `${fullDays[idx]} (${dateFormatted})`;
    return {
      dayName,
      shortLabel,
      fullLabel,
      dateFormatted,
      dateObj: d,
    };
  });
}

  interface DayLog {
    day: string;
    fullDayLabel?: string;
    dateFormatted?: string;
    hours: number;
    projects: { projectName: string; hours: number }[];
    employees?: { employeeName: string; hours: number }[];
  }

  // Chart states
  const [projectStatsList, setProjectStatsList] = useState<ProjectStats[]>([]);
  const [priorityStatsList, setPriorityStatsList] = useState<PriorityStats[]>([]);
  const [teamStatsList, setTeamStatsList] = useState<TeamStats[]>([]);
  const [weeklyTimeLogs, setWeeklyTimeLogs] = useState<DayLog[]>([]);
  const [dailyCapacity, setDailyCapacity] = useState(8);
  const [weeklyCapacity, setWeeklyCapacity] = useState(40);

  // Load project & task data from backend / local storage and compute report metrics
  const loadReportData = async () => {
    let loadedProjects: any[] = [];
    let allTasks: any[] = [];

    const [projRes, tasksRes] = await Promise.all([getProjectsAction(), getAllTasksAction()]);

    if (projRes.success && projRes.data) {
      loadedProjects = projRes.data;
    } else {
      const storedProjects = localStorage.getItem('pwt_projects');
      if (storedProjects) {
        try {
          loadedProjects = JSON.parse(storedProjects);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (tasksRes.success && tasksRes.data && tasksRes.data.length > 0) {
      allTasks = tasksRes.data;
    } else {
      // Fallback from localStorage project task buckets if API returned empty
      loadedProjects.forEach(proj => {
        const storedTasksKey = `pwt_tasks_project_${proj.id || proj._id}`;
        const storedTasksStr = localStorage.getItem(storedTasksKey);
        if (storedTasksStr) {
          try {
            const parsed = JSON.parse(storedTasksStr);
            allTasks.push(...parsed);
          } catch (e) {}
        } else if (fallbackTasks[proj.id || proj._id]) {
          allTasks.push(...fallbackTasks[proj.id || proj._id]);
        }
      });
    }

    // Also fetch issues across projects to capture issue logged hours
    const issuesPromises = loadedProjects.map(p => getIssuesByProjectAction(p.id || p._id));
    const issuesResults = await Promise.all(issuesPromises);
    const allIssues: any[] = [];
    issuesResults.forEach(r => {
      if (r.success && r.data) {
        allIssues.push(...r.data);
      }
    });

    setProjectsCount(loadedProjects.length);

    let totalTasks = allTasks.length;
    let completedTasks = 0;
    let overdueTasks = 0;

    let urgent = 0, high = 0, medium = 0, low = 0;
    const memberTaskMap: Record<string, { initials: string; bg: string; count: number }> = {};
    const today = new Date().toISOString().split('T')[0];

    // Priority accumulation
    allTasks.forEach((task: any) => {
      const priorityStr = (task.priority || '').toString().toLowerCase();
      if (priorityStr === 'urgent') urgent++;
      else if (priorityStr === 'high') high++;
      else if (priorityStr === 'medium') medium++;
      else if (priorityStr === 'low') low++;
      else medium++; // default to medium if unspecified

      if (task.status === 'Done') {
        completedTasks++;
      } else if (task.dueDate && task.dueDate !== 'No Due Date' && task.dueDate < today) {
        overdueTasks++;
      }

      const assignees = Array.isArray(task.assignees) ? task.assignees : [];
      assignees.forEach((assignee: any) => {
        const name = typeof assignee === 'string' ? assignee : (assignee.name || 'Unassigned');
        const initials = typeof assignee === 'object' && assignee.initials ? assignee.initials : name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        const bg = typeof assignee === 'object' && assignee.bg ? assignee.bg : 'bg-indigo-500';

        if (memberTaskMap[name]) {
          memberTaskMap[name].count++;
        } else {
          memberTaskMap[name] = {
            initials,
            bg,
            count: 1
          };
        }
      });
    });

    // Project stats computation
    const projectStats: ProjectStats[] = loadedProjects.map((proj: any) => {
      const projId = proj.id || proj._id;
      const projTasks = allTasks.filter((t: any) => t.projectId === projId);
      const projTotal = projTasks.length;
      const projCompleted = projTasks.filter((t: any) => t.status === 'Done').length;
      return {
        id: projId,
        name: proj.name,
        totalTasks: projTotal,
        completedTasks: projCompleted,
        progress: projTotal > 0 ? Math.round((projCompleted / projTotal) * 100) : (proj.progress || 0)
      };
    });

    setTasksCount(totalTasks);
    setCompletedTasksCount(completedTasks);
    setOverdueTasksCount(overdueTasks);
    setCompletionRate(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
    setProjectStatsList(projectStats);

    // Calculate priority statistics
    const prioritySum = urgent + high + medium + low;
    setPriorityStatsList([
      { name: 'Urgent', value: urgent, color: 'stroke-red-500 fill-red-500 text-red-500', percentage: prioritySum > 0 ? Math.round((urgent / prioritySum) * 100) : 0 },
      { name: 'High', value: high, color: 'stroke-orange-500 fill-orange-500 text-orange-500', percentage: prioritySum > 0 ? Math.round((high / prioritySum) * 100) : 0 },
      { name: 'Medium', value: medium, color: 'stroke-indigo-500 fill-indigo-500 text-indigo-500', percentage: prioritySum > 0 ? Math.round((medium / prioritySum) * 100) : 0 },
      { name: 'Low', value: low, color: 'stroke-slate-400 fill-slate-400 text-slate-400', percentage: prioritySum > 0 ? Math.round((low / prioritySum) * 100) : 0 },
    ]);

    // Calculate team allocation load
    const teamStats: TeamStats[] = [];
    Object.keys(memberTaskMap).forEach(name => {
      const info = memberTaskMap[name];
      teamStats.push({
        name,
        initials: info.initials,
        bg: info.bg,
        taskCount: info.count,
        load: Math.min(100, Math.round((info.count / 8) * 100))
      });
    });
    setTeamStatsList(teamStats.sort((a, b) => b.taskCount - a.taskCount));

    // Calculate Logged Hours per day & per project with role filtering
    const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDays = getCurrentWeekDays();
    const dayMap: Record<string, { total: number; projects: Record<string, number>; employees: Record<string, number>; fullLabel: string; dateFormatted: string }> = {};
    weekDays.forEach(w => {
      dayMap[w.dayName] = { total: 0, projects: {}, employees: {}, fullLabel: w.fullLabel, dateFormatted: w.dateFormatted };
    });

    const currentUserRole = (user?.role || '').toLowerCase();
    const isEmployeeUser = currentUserRole === 'employee';
    const isClientUser = currentUserRole === 'client';

    const allWorkItems = [...allTasks, ...allIssues];

    allWorkItems.forEach((item: any) => {
      const assignees = Array.isArray(item.assignees) ? item.assignees : [];
      const isAssignedToUser = assignees.some((a: any) => {
        const aName = typeof a === 'string' ? a : a.name;
        const aId = typeof a === 'object' ? a.id || a.userId : null;
        return (aName && user?.name && aName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
               (aId && user?.id && String(aId) === String(user.id));
      });

      // Role-based filtering
      if (isEmployeeUser) {
        const hasUserWorkLog = Array.isArray(item.workLogs) && item.workLogs.some((wl: any) => {
          const wlName = wl.userName || wl.author || wl.name;
          const wlId = wl.userId || wl.id;
          return (wlName && user?.name && wlName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
                 (wlId && user?.id && String(wlId) === String(user.id));
        });
        if (!isAssignedToUser && !hasUserWorkLog) return;
      } else if (isClientUser) {
        const projId = item.projectId;
        const isClientProj = loadedProjects.some(p => (p.id || p._id) === projId);
        if (!isClientProj) return;
      }

      const itemActual = Number(item.actualHours) || 0;
      const projName = item.projectName || 'Project Workspace';

      const primaryAssigneeName = assignees.length > 0
        ? (typeof assignees[0] === 'string' ? assignees[0] : assignees[0].name)
        : (typeof item.assignee === 'string' ? item.assignee : (item.assignee?.name || item.updatedByUserName || item.createdByUserName));

      const logsToProcess: { hours: number; date: Date; userName?: string; userId?: string }[] = [];
      if (Array.isArray(item.workLogs) && item.workLogs.length > 0) {
        const totalLogHrs = item.workLogs.reduce((acc: number, wl: any) => acc + (Number(wl.hours) || 0), 0);
        const ratio = (totalLogHrs > 0 && itemActual >= 0) ? (itemActual / totalLogHrs) : 1;

        item.workLogs.forEach((wl: any) => {
          const rawH = Number(wl.hours) || 0;
          const scaledH = totalLogHrs > 0 ? rawH * ratio : rawH;

          let resolvedUserName = wl.userName || wl.author || wl.name;
          const logUserId = wl.userId || wl.id;

          if (!resolvedUserName && logUserId) {
            if (user?.id && String(user.id) === String(logUserId)) {
              resolvedUserName = user.name || undefined;
            }
          }

          if (!resolvedUserName) {
            resolvedUserName = primaryAssigneeName;
          }

          logsToProcess.push({
            hours: scaledH,
            date: new Date(wl.date || wl.createdAt || item.updatedAt || item.createdAt),
            userName: resolvedUserName,
            userId: logUserId,
          });
        });
      } else if (itemActual > 0) {
        logsToProcess.push({
          hours: itemActual,
          date: new Date(item.updatedAt || item.createdAt || item.dueDate || item.startDate),
          userName: primaryAssigneeName
        });
      }

      logsToProcess.forEach(log => {
        if (log.hours <= 0) return;

        if (isEmployeeUser) {
          if (log.userName || log.userId) {
            const isMyLog = (log.userName && user?.name && log.userName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
                            (log.userId && user?.id && String(log.userId) === String(user.id));
            if (!isMyLog) return;
          }
        }

        let matchedDay = weekDays.find(w => {
          return w.dateObj.getFullYear() === log.date.getFullYear() &&
                 w.dateObj.getMonth() === log.date.getMonth() &&
                 w.dateObj.getDate() === log.date.getDate();
        });

        if (!matchedDay) {
          const dayIndex = (log.date.getDay() + 6) % 7;
          matchedDay = weekDays[dayIndex];
        }

        if (matchedDay) {
          const dKey = matchedDay.dayName;
          let empName = log.userName ? log.userName.trim() : '';

          if (!empName || empName.toLowerCase() === 'team member') {
            if (log.userId && user?.id && String(log.userId) === String(user.id)) {
              empName = user.name || '';
            }
          }

          if (!empName || empName.toLowerCase() === 'team member') {
            if (primaryAssigneeName) {
              empName = primaryAssigneeName;
            } else if (isEmployeeUser && user?.name) {
              empName = user.name;
            } else {
              empName = 'Employee';
            }
          }

          dayMap[dKey].total += log.hours;
          dayMap[dKey].projects[projName] = (dayMap[dKey].projects[projName] || 0) + log.hours;
          dayMap[dKey].employees[empName] = (dayMap[dKey].employees[empName] || 0) + log.hours;
        }
      });
    });

    const calculatedLogs = weekDays.map(w => {
      const data = dayMap[w.dayName];
      const projects = Object.entries(data.projects).map(([projectName, hours]) => ({
        projectName,
        hours
      }));
      const employees = Object.entries(data.employees).map(([employeeName, hours]) => ({
        employeeName,
        hours
      }));
      return {
        day: w.shortLabel,
        fullDayLabel: w.fullLabel,
        dateFormatted: w.dateFormatted,
        hours: data.total,
        projects,
        employees
      };
    });

    const userRole = (user?.role || '').toLowerCase();
    let dailyCap = 8;
    let weeklyCap = 40;

    if (userRole === 'employee') {
      dailyCap = 8;
      weeklyCap = 40;
    } else if (userRole === 'admin' || userRole === 'manager' || userRole === 'client') {
      const empCount = Math.max(1, Object.keys(memberTaskMap).length || 1);
      dailyCap = empCount * 8;
      weeklyCap = empCount * 40;
    }

    setDailyCapacity(dailyCap);
    setWeeklyCapacity(weeklyCap);
    setWeeklyTimeLogs(calculatedLogs);
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Donut chart stroke dashes calculations
  let accumulatedPercent = 0;

  if (!user || !canViewReports) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Reports Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Workspace Metrics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 shadow-xs border border-indigo-100/30">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            Workspace Insights
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1">
            Realtime workload metrics, team capacity status, and sprint progression statistics.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={loadReportData}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-650 shadow-3xs cursor-pointer active:scale-98 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer active:scale-98 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, subtext: `${completedTasksCount} of ${tasksCount} tasks completed`, icon: TrendingUp, tint: 'bg-emerald-50 text-emerald-700 border-emerald-100/50' },
          { label: 'Active Initiatives', value: projectsCount, subtext: 'Total projects in pipeline', icon: Folder, tint: 'bg-indigo-50 text-indigo-700 border-indigo-100/50' },
          { label: 'Remaining Tasks', value: tasksCount - completedTasksCount, subtext: 'Tasks to be processed', icon: CheckSquare, tint: 'bg-blue-50 text-blue-700 border-blue-100/50' },
          { label: 'Overdue Bottlenecks', value: overdueTasksCount, subtext: 'Tasks past their due date', icon: AlertCircle, tint: cn(overdueTasksCount > 0 ? 'bg-red-50 text-red-700 border-red-150/40' : 'bg-slate-50 text-slate-500 border-slate-200/50') },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <div className={cn("p-1.5 rounded-lg border", stat.tint)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bento grid reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Project Workload Allocation (Double bar chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800">Project Workload Allocation</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Completed vs total task loads per project workspace</p>
          </div>

          <div className="flex-1 mt-4">
            {projectStatsList.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">No project metrics to plot.</div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {projectStatsList.map(proj => {
                  let progressColor = "bg-indigo-650";
                  let badgeStyles = "bg-indigo-50 text-indigo-700 border-indigo-100/50";
                  let statusLabel = "In Progress";
                  
                  if (proj.progress === 100) {
                    progressColor = "bg-emerald-500";
                    badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-100/50";
                    statusLabel = "Completed";
                  } else if (proj.progress === 0) {
                    progressColor = "bg-slate-200";
                    badgeStyles = "bg-slate-50 text-slate-500 border-slate-200/50";
                    statusLabel = "To Do";
                  } else if (proj.progress > 75) {
                    progressColor = "bg-purple-600";
                    badgeStyles = "bg-purple-50 text-purple-700 border-purple-100/50";
                    statusLabel = "In Review";
                  }

                  return (
                    <div 
                      key={proj.id} 
                      className="group flex flex-col md:flex-row md:items-center justify-between py-4 hover:bg-slate-50/60 px-3 -mx-3 rounded-2xl transition-all duration-200 gap-4"
                    >
                      {/* Left Side: Name + Details */}
                      <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-450 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100/60 transition-all duration-200">
                          <Folder className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-650 transition-colors duration-200">
                            {proj.name}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                            Active Initiative
                          </span>
                        </div>
                      </div>

                      {/* Middle: Progress Bar */}
                      <div className="flex-1 min-w-0 md:px-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                          <span>Progress</span>
                          <span className="font-extrabold text-slate-800">{proj.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500 ease-out", progressColor)}
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Right Side: Tasks Count + Status Badge */}
                      <div className="flex items-center gap-4 shrink-0 md:w-1/4 md:justify-end">
                        <span className="text-xs font-bold text-slate-700">
                          {proj.completedTasks} <span className="text-slate-400 font-semibold">/ {proj.totalTasks} Tasks</span>
                        </span>
                        <span className={cn("rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border", badgeStyles)}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Task Priorities distribution (SVG Donut Chart) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Task Priorities</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Breakdown of operational tasks by priority level</p>
          </div>

          <div className="flex flex-col items-center justify-center my-6 relative">
            
            {/* SVG Donut */}
            <svg width="150" height="150" viewBox="0 0 150 150" className="rotate-270">
              <circle cx="75" cy="75" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
              {(() => {
                let accumulatedPercent = 0;
                return priorityStatsList.map((stat, idx) => {
                  const radius = 50;
                  const circumference = 2 * Math.PI * radius; // ~314.16
                  const strokeDash = (stat.percentage / 100) * circumference;
                  const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
                  
                  // Accumulate percentage for the next offset
                  accumulatedPercent += stat.percentage;

                  return (
                    <circle
                      key={idx}
                      cx="75"
                      cy="75"
                      r={radius}
                      fill="transparent"
                      className={cn("transition-all duration-500", stat.color.split(' ')[0])}
                      strokeWidth="18"
                      strokeDasharray={`${strokeDash} ${circumference}`}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap={stat.percentage > 0 ? "round" : "butt"}
                    />
                  );
                });
              })()}
            </svg>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-800">{tasksCount}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Tasks</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[10px] font-bold">
            {priorityStatsList.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", stat.color.split(' ')[1])} />
                <span className="text-slate-500">{stat.name}:</span>
                <span className="text-slate-800 font-black ml-auto">{stat.value} ({stat.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Timesheet Logs (Vertical Bar Graph with Project / Employee Breakdown) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Logged Hours</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {(user?.role || '').toLowerCase() === 'employee' ? (
                <>Workspace activity log ({weeklyTimeLogs.reduce((acc, d) => acc + d.hours, 0)}h / {weeklyCapacity}h weekly capacity - {Math.round((weeklyTimeLogs.reduce((acc, d) => acc + d.hours, 0) / (weeklyCapacity || 1)) * 100)}%)</>
              ) : (
                <>Workspace activity log ({weeklyTimeLogs.reduce((acc, d) => acc + d.hours, 0)}h total logged across team this week)</>
              )}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 mt-6 border-b border-slate-150 pb-2">
            {weeklyTimeLogs.map((d) => {
              const isEmployeeRole = (user?.role || '').toLowerCase() === 'employee';
              const maxHours = Math.max(isEmployeeRole ? dailyCapacity : 1, ...weeklyTimeLogs.map(t => t.hours));
              const uniqueLoggedProjects = Array.from(new Set(weeklyTimeLogs.flatMap(item => item.projects.map(p => p.projectName))));
              const uniqueLoggedEmployees = Array.from(new Set(weeklyTimeLogs.flatMap(item => (item.employees || []).map(e => e.employeeName))));

              return (
                <div key={d.day} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* Detailed Tooltip on Hover */}
                  <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl whitespace-nowrap z-20 min-w-[140px] border border-slate-700">
                    <div className="font-black text-slate-200 border-b border-slate-700/80 pb-1 mb-1 flex items-center justify-between gap-3">
                      <span>{d.fullDayLabel || d.day}</span>
                      <span className="text-indigo-400 font-extrabold">
                        {isEmployeeRole ? `${d.hours}h / ${dailyCapacity}h (${Math.round((d.hours / (dailyCapacity || 1)) * 100)}%)` : `${d.hours}h logged`}
                      </span>
                    </div>
                    {isEmployeeRole ? (
                      d.projects.length > 0 ? (
                        d.projects.map((p) => {
                          const color = getProjColor(p.projectName, uniqueLoggedProjects);
                          return (
                            <div key={p.projectName} className="flex items-center justify-between gap-3 font-semibold text-[10px]">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className={cn("h-2 w-2 rounded-full shrink-0", color.bg)} />
                                <span>{p.projectName}</span>
                              </span>
                              <span className="font-bold text-white ml-auto">{p.hours}h</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-400 italic text-[9px]">No hours logged</div>
                      )
                    ) : (
                      (d.employees || []).length > 0 ? (
                        (d.employees || []).map((e) => {
                          const color = getProjColor(e.employeeName, uniqueLoggedEmployees);
                          return (
                            <div key={e.employeeName} className="flex items-center justify-between gap-3 font-semibold text-[10px]">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className={cn("h-2 w-2 rounded-full shrink-0", color.bg)} />
                                <span>{e.employeeName}</span>
                              </span>
                              <span className="font-bold text-white ml-auto">{e.hours}h</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-400 italic text-[9px]">No hours logged</div>
                      )
                    )}
                  </div>

                  <span className="text-[9px] font-black text-slate-700">
                    {isEmployeeRole ? `${d.hours}h / ${dailyCapacity}h` : `${d.hours}h`}
                  </span>

                  <div className="w-full bg-slate-50 border border-slate-150 rounded-t-lg h-36 flex flex-col-reverse justify-start overflow-hidden cursor-pointer hover:bg-slate-100/70 transition-colors p-0.5">
                    {isEmployeeRole ? (
                      d.projects.length > 0 ? (
                        d.projects.map((p) => {
                          const color = getProjColor(p.projectName, uniqueLoggedProjects);
                          const segmentPercent = maxHours > 0 ? (p.hours / maxHours) * 100 : 0;
                          return (
                            <div
                              key={p.projectName}
                              className={cn("w-full transition-all duration-500 rounded-xs border-t border-white/20 first:border-0", color.bg)}
                              style={{ height: `${segmentPercent}%` }}
                            />
                          );
                        })
                      ) : (
                        <div className="w-full h-full bg-slate-200/40 rounded-t-lg" />
                      )
                    ) : (
                      (d.employees || []).length > 0 ? (
                        (d.employees || []).map((e) => {
                          const color = getProjColor(e.employeeName, uniqueLoggedEmployees);
                          const segmentPercent = maxHours > 0 ? (e.hours / maxHours) * 100 : 0;
                          return (
                            <div
                              key={e.employeeName}
                              className={cn("w-full transition-all duration-500 rounded-xs border-t border-white/20 first:border-0", color.bg)}
                              style={{ height: `${segmentPercent}%` }}
                            />
                          );
                        })
                      ) : (
                        <div className="w-full h-full bg-slate-200/40 rounded-t-lg" />
                      )
                    )}
                  </div>

                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          {(() => {
            const isEmployeeRole = (user?.role || '').toLowerCase() === 'employee';
            if (isEmployeeRole) {
              const uniqueLoggedProjects = Array.from(new Set(weeklyTimeLogs.flatMap(item => item.projects.map(p => p.projectName))));
              if (uniqueLoggedProjects.length === 0) return null;
              return (
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Projects:</span>
                  {uniqueLoggedProjects.map((pName) => {
                    const color = getProjColor(pName, uniqueLoggedProjects);
                    return (
                      <div key={pName} className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className={cn("h-2.5 w-2.5 rounded-full", color.bg)} />
                        <span>{pName}</span>
                      </div>
                    );
                  })}
                </div>
              );
            } else {
              const uniqueLoggedEmployees = Array.from(new Set(weeklyTimeLogs.flatMap(item => (item.employees || []).map(e => e.employeeName))));
              if (uniqueLoggedEmployees.length === 0) return null;
              return (
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Employees:</span>
                  {uniqueLoggedEmployees.map((eName) => {
                    const color = getProjColor(eName, uniqueLoggedEmployees);
                    return (
                      <div key={eName} className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className={cn("h-2.5 w-2.5 rounded-full", color.bg)} />
                        <span>{eName}</span>
                      </div>
                    );
                  })}
                </div>
              );
            }
          })()}
        </div>

        {/* 4. Team Workload Capacity */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Team Allocation Capacity</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Tasks workload status per team member</p>
          </div>

          <div className="space-y-4 flex-1 mt-6">
            {teamStatsList.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">No member allocations tracked.</div>
            ) : (
              teamStatsList.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-3xs", member.bg)}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-800 truncate">{member.name}</span>
                      <span className="text-slate-450">{member.taskCount} tasks ({member.load}%)</span>
                    </div>
                    {/* Capacity progress */}
                    <div className="h-1.5 w-full bg-slate-50 border border-slate-150 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          member.taskCount > 6 ? 'bg-red-500' :
                          member.taskCount > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${member.load}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
