import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/dal';
import {
  ArrowUpRight,
  TrendingUp,
  Plus,
  Play,
  Bug,
  MoreHorizontal,
  CalendarDays,
  Calendar,
} from 'lucide-react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/auth/permissions';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import { getTasksByProjectAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';

export const metadata: Metadata = {
  title: 'Dashboard — Project Tracker',
  description: 'Your Project Tracker dashboard.',
};

const stats = [
  { label: 'Active Projects', value: '12',   change: '+2',   iconName: 'Folder',       tint: '#6366f1', positive: true  },
  { label: 'Open Tasks',      value: '48',   change: '-5',   iconName: 'CheckCircle2', tint: '#3b82f6', positive: true  },
  { label: 'Open Bugs',       value: '7',    change: '+3',   iconName: 'AlertTriangle',tint: '#ef4444', positive: false },
  { label: 'Hours Logged',    value: '134h', change: '+18h', iconName: 'Clock',        tint: '#ec4899', positive: true  },
];


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

const recentProjects: any[] = [];



function getRelativeTimeString(dateStr: string | Date | undefined): string {
  if (!dateStr) return 'Unknown time';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown time';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

function formatDeadlineDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === 'No Due Date') return 'No Due Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isDeadlineUrgent(dateStr: string | undefined): boolean {
  if (!dateStr || dateStr === 'No Due Date') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
}

const team = [
  { name: 'Ava Chen', role: 'Frontend', load: 82, initials: 'AC' },
  { name: 'Marco Diaz', role: 'Backend', load: 64, initials: 'MD' },
  { name: 'Priya Rao', role: 'QA', load: 91, initials: 'PR' },
  { name: 'Sam Okafor', role: 'Design', load: 47, initials: 'SO' },
];

function parseHoursFromBudget(budget: string | undefined): number {
  if (!budget) return 0;
  if (budget.includes('$')) return 0;
  const matches = budget.match(/(\d+)\s*(h|hour|hours|hrs|hr)?/i);
  if (matches) {
    return parseInt(matches[1], 10);
  }
  const num = parseInt(budget.trim(), 10);
  if (!isNaN(num)) {
    return num;
  }
  return 0;
}

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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const canViewWorkload = hasPermission(user?.role, 'dashboard:view-team-workload');
  const canViewQuickActions = hasPermission(user?.role, 'dashboard:view-quick-actions');

  let activeProjects: any[] = [];
  let deadlines: { title: string; date: string; urgent: boolean }[] = [];
  let recentActivity: { text: string; time: string; dot: string }[] = [];
  let workloadData: { name: string; role: string; load: number; initials: string; bg?: string }[] = team;
  let allEmployees: any[] = [];
  let weeklyHoursList: { day: string; fullDayLabel: string; dateFormatted: string; hours: number; projects: { projectName: string; hours: number }[]; employees: { employeeName: string; hours: number }[] }[] = [];
  let maxHours = 8;
  let uniqueLoggedProjects: string[] = [];
  let uniqueLoggedEmployees: string[] = [];
  let dailyCapacity = 8;
  let weeklyCapacity = 40;

  const dynamicStats = [
    { label: 'Active Projects', value: '0',   change: '+2',   iconName: 'Folder',       tint: '#6366f1', positive: true  },
    { label: 'Open Tasks',      value: '0',   change: '-5',   iconName: 'CheckCircle2', tint: '#3b82f6', positive: true  },
    { label: 'Open Bugs',       value: '0',   change: '+3',   iconName: 'AlertTriangle',tint: '#ef4444', positive: false },
    { label: 'Hours Logged',    value: '0h',  change: '+18h', iconName: 'Clock',        tint: '#ec4899', positive: true  },
  ];

  let openTasksCount = 0;
  let openBugsCount = 0;
  let totalAssignedHours = 0;
  let totalActualHours = 0;

  try {
    const res = await getProjectsAction();
    if (res.success && res.data) {
      activeProjects = res.data;
      dynamicStats[0].value = String(activeProjects.length);

      const gatheredDeadlines: { title: string; date: string; urgent: boolean; rawDate: Date }[] = [];
      const gatheredActivities: { text: string; time: string; dot: string; rawDate: Date }[] = [];

      activeProjects.forEach(p => {
        totalAssignedHours += parseHoursFromBudget(p.budget);

        if (p.dueDate && p.dueDate !== 'No Due Date') {
          const d = new Date(p.dueDate);
          if (!isNaN(d.getTime())) {
            gatheredDeadlines.push({
              title: `Project: ${p.name}`,
              date: formatDeadlineDate(p.dueDate),
              urgent: isDeadlineUrgent(p.dueDate),
              rawDate: d
            });
          }
        }

        if (p.createdAt) {
          const d = new Date(p.createdAt);
          if (!isNaN(d.getTime())) {
            gatheredActivities.push({
              text: `Project "${p.name}" was created`,
              time: getRelativeTimeString(p.createdAt),
              dot: 'bg-indigo-500',
              rawDate: d
            });
          }
        }
        if (p.updatedAt && p.updatedAt !== p.createdAt) {
          const d = new Date(p.updatedAt);
          if (!isNaN(d.getTime())) {
            gatheredActivities.push({
              text: `Project "${p.name}" updated to status ${p.status}`,
              time: getRelativeTimeString(p.updatedAt),
              dot: 'bg-purple-500',
              rawDate: d
            });
          }
        }
      });

      const tasksPromises = activeProjects.map(p => getTasksByProjectAction(p.id));
      const issuesPromises = activeProjects.map(p => getIssuesByProjectAction(p.id));

      const [tasksResList, issuesResList] = await Promise.all([
        Promise.all(tasksPromises),
        Promise.all(issuesPromises)
      ]);

      tasksResList.forEach(tRes => {
        if (tRes.success && tRes.data) {
          tRes.data.forEach(task => {
            if (task.status !== 'Done') {
              openTasksCount++;
            }
            totalActualHours += task.actualHours || 0;

            if (task.dueDate) {
              const d = new Date(task.dueDate);
              if (!isNaN(d.getTime())) {
                gatheredDeadlines.push({
                  title: `Task: ${task.title} (${task.projectName || 'Project'})`,
                  date: formatDeadlineDate(task.dueDate),
                  urgent: isDeadlineUrgent(task.dueDate),
                  rawDate: d
                });
              }
            }

            if (task.createdAt) {
              const d = new Date(task.createdAt);
              if (!isNaN(d.getTime())) {
                gatheredActivities.push({
                  text: `New task "${task.title}" added to ${task.projectName || 'Project'}`,
                  time: getRelativeTimeString(task.createdAt),
                  dot: 'bg-blue-500',
                  rawDate: d
                });
              }
            }
            if (task.status === 'Done' && task.updatedAt) {
              const d = new Date(task.updatedAt);
              if (!isNaN(d.getTime())) {
                gatheredActivities.push({
                  text: `Task "${task.title}" completed`,
                  time: getRelativeTimeString(task.updatedAt),
                  dot: 'bg-emerald-500',
                  rawDate: d
                });
              }
            }
          });
        }
      });

      issuesResList.forEach(iRes => {
        if (iRes.success && iRes.data) {
          iRes.data.forEach(issue => {
            if (issue.status !== 'Resolved' && issue.status !== 'Closed' && issue.type === 'Bug') {
              openBugsCount++;
            }
            totalActualHours += issue.actualHours || 0;

            if (issue.dueDate) {
              const d = new Date(issue.dueDate);
              if (!isNaN(d.getTime())) {
                gatheredDeadlines.push({
                  title: `Issue: ${issue.title} (${issue.projectName || 'Project'})`,
                  date: formatDeadlineDate(issue.dueDate),
                  urgent: isDeadlineUrgent(issue.dueDate),
                  rawDate: d
                });
              }
            }

            if (issue.createdAt) {
              const d = new Date(issue.createdAt);
              if (!isNaN(d.getTime())) {
                gatheredActivities.push({
                  text: `New issue "${issue.title}" created in ${issue.projectName || 'Project'}`,
                  time: getRelativeTimeString(issue.createdAt),
                  dot: 'bg-red-500',
                  rawDate: d
                });
              }
            }
            if ((issue.status === 'Resolved' || issue.status === 'Closed') && issue.updatedAt) {
              const d = new Date(issue.updatedAt);
              if (!isNaN(d.getTime())) {
                gatheredActivities.push({
                  text: `Issue "${issue.title}" resolved`,
                  time: getRelativeTimeString(issue.updatedAt),
                  dot: 'bg-teal-500',
                  rawDate: d
                });
              }
            }
          });
        }
      });

      const remainingHours = Math.max(0, totalAssignedHours - totalActualHours);

      const allWorkItems: any[] = [];
      tasksResList.forEach(tRes => {
        if (tRes.success && tRes.data) {
          allWorkItems.push(...tRes.data);
        }
      });
      issuesResList.forEach(iRes => {
        if (iRes.success && iRes.data) {
          allWorkItems.push(...iRes.data);
        }
      });

      const weekDays = getCurrentWeekDays();
      const dayMap: Record<string, { total: number; projects: Record<string, number>; employees: Record<string, number>; fullLabel: string; dateFormatted: string }> = {};
      weekDays.forEach(w => {
        dayMap[w.dayName] = { total: 0, projects: {}, employees: {}, fullLabel: w.fullLabel, dateFormatted: w.dateFormatted };
      });

      const currentUserRole = (user?.role || '').toLowerCase();
      const isEmployeeUser = currentUserRole === 'employee';
      const isClientUser = currentUserRole === 'client';

      let roleFilteredTotalActualHours = 0;

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
          const isClientProj = activeProjects.some(p => p.id === projId || (p as any)._id === projId);
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
              } else if (Array.isArray(allEmployees)) {
                const matchedEmp = allEmployees.find((e: any) => String(e.id || e._id) === String(logUserId));
                if (matchedEmp) resolvedUserName = matchedEmp.name;
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

          // If current logged-in user is an employee, filter out worklogs created by other users
          if (isEmployeeUser) {
            if (log.userName || log.userId) {
              const isMyLog = (log.userName && user?.name && log.userName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
                              (log.userId && user?.id && String(log.userId) === String(user.id));
              if (!isMyLog) return;
            }
          }

          roleFilteredTotalActualHours += log.hours;

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
              } else if (log.userId && Array.isArray(allEmployees)) {
                const matchedEmp = allEmployees.find((e: any) => String(e.id || e._id) === String(log.userId));
                if (matchedEmp) empName = matchedEmp.name || '';
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

      weeklyHoursList = weekDays.map(w => {
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
      if (userRole === 'employee') {
        dailyCapacity = 8;
        weeklyCapacity = 40;
      } else if (userRole === 'admin' || userRole === 'manager') {
        const empCount = Math.max(1, (allEmployees || []).filter((e: any) => e.role?.toLowerCase() === 'employee').length || 1);
        dailyCapacity = empCount * 8;
        weeklyCapacity = empCount * 40;
      } else if (userRole === 'client') {
        const clientMembers = new Set();
        activeProjects.forEach(p => {
          (p.members || []).forEach((m: any) => clientMembers.add(m.name || m.id));
        });
        const memberCount = Math.max(1, clientMembers.size || 1);
        dailyCapacity = memberCount * 8;
        weeklyCapacity = memberCount * 40;
      }

      maxHours = Math.max(isEmployeeUser ? dailyCapacity : 1, ...weeklyHoursList.map(d => d.hours));
      uniqueLoggedProjects = Array.from(new Set(weeklyHoursList.flatMap(d => d.projects.map(p => p.projectName))));
      uniqueLoggedEmployees = Array.from(new Set(weeklyHoursList.flatMap(d => d.employees.map(e => e.employeeName))));

      dynamicStats[1].value = String(openTasksCount);
      dynamicStats[2].value = String(openBugsCount);
      dynamicStats[3].value = `${roleFilteredTotalActualHours}h`;
      dynamicStats[3].change = `+${remainingHours}h left`;

      deadlines = gatheredDeadlines
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
        .slice(0, 4)
        .map(d => ({ title: d.title, date: d.date, urgent: d.urgent }));

      recentActivity = gatheredActivities
        .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
        .slice(0, 5)
        .map(a => ({ text: a.text, time: a.time, dot: a.dot }));

      if (deadlines.length === 0) {
        deadlines = [
          { title: 'No upcoming deadlines', date: 'None', urgent: false }
        ];
      }
      if (recentActivity.length === 0) {
        recentActivity = [
          { text: 'No recent activity recorded yet', time: 'Just now', dot: 'bg-slate-400' }
        ];
      }

      // Fetch employees & calculate workload dynamically
      const employeesRes = await getEmployeesAction();
      if (employeesRes.success && employeesRes.data) {
        allEmployees = employeesRes.data;
        const employees = employeesRes.data.filter(emp => emp.role.toLowerCase() === 'employee');
        
        const calculatedWorkloads = employees.map(emp => {
          let assignedHours = 0;
          
          // 1. Project allocation
          activeProjects.forEach(p => {
            const isMember = p.members.some((m: any) => m.name === emp.name || m.userId === emp.id);
            if (isMember) {
              const projHours = parseHoursFromBudget(p.budget) || 40; // Default to 40 hours if budget unspecified
              const memberCount = p.members.length || 1;
              let share = projHours / memberCount;
              
              // Project urgency weight multiplier
              if (p.dueDate && p.dueDate !== 'No Due Date') {
                const diffMs = new Date(p.dueDate).getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays <= 3 && diffDays >= 0) {
                  share *= 1.5; // increase weight by 50% for tight deadline
                } else if (diffDays < 0) {
                  share *= 2.0; // double weight for overdue projects
                }
              }
              assignedHours += share;
            }
          });

          // 2. Active tasks allocation
          tasksResList.forEach(tRes => {
            if (tRes.success && tRes.data) {
              tRes.data.forEach(task => {
                if (task.status !== 'Done') {
                  const isAssigned = task.assignees.some((a: any) => a.name === emp.name || a.userId === emp.id);
                  if (isAssigned) {
                    assignedHours += 10; // estimate 10 hours per active task
                    
                    // Task urgency burden
                    if (task.dueDate) {
                      const diffMs = new Date(task.dueDate).getTime() - new Date().getTime();
                      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                      if (diffDays <= 2 && diffDays >= 0) {
                        assignedHours += 15;
                      } else if (diffDays < 0) {
                        assignedHours += 25;
                      }
                    }
                  }
                }
              });
            }
          });

          // Scale capacity based on standard 80 hours capacity (2 weeks work cycle)
          const loadPercent = Math.min(100, Math.round((assignedHours / 80) * 100));

          return {
            name: emp.name,
            role: emp.role,
            load: loadPercent || 15, // fallback to min 15% to represent baseline activity
            initials: emp.initials || emp.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            bg: emp.bg
          };
        });

        if (calculatedWorkloads.length > 0) {
          workloadData = calculatedWorkloads;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load projects in dashboard:', error);
  }

  const projectsToRender = activeProjects.length > 0 ? activeProjects.slice(0, 12).map(p => {
    const barColors: Record<string, string> = {
      'Planning': '#06b6d4',
      'In Progress': '#6366f1',
      'In Review': '#8b5cf6',
      'Completed': '#10b981',
    };
    return {
      id: p.id,
      name: p.name,
      category: p.techStack && p.techStack.length > 0 ? p.techStack.slice(0, 2).join(', ') : 'General Workspace',
      status: p.status,
      progress: p.progress,
      due: p.dueDate || 'No Due Date',
      bar: barColors[p.status] || '#6366f1',
      tasks: { completed: p.completedTasks || 0, total: p.tasksCount || 0 },
      team: p.members.filter((m: any) => m.role?.toLowerCase() !== 'admin').map((m: any) => ({
        initials: m.initials,
        name: m.name,
        bg: m.bg,
        role: m.role
      })),
      updatedAt: 'Just now',
    };
  }) : recentProjects;

  const isEmployeeRole = (user?.role || '').toLowerCase() === 'employee';

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8 lg:p-10">
      {/* Hero banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-[#1F4D3E] px-7 py-7 md:px-9 md:py-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#F4A340]/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              <TrendingUp className="h-3 w-3" /> Performance up 12%
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
              Good to see you, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              Here&apos;s what&apos;s happening across your projects today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dynamicStats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            change={s.change}
            iconName={s.iconName}
            tint={s.tint}
            positive={s.positive}
          />
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Weekly hours chart — spans 2 or 3 depending on workload visibility */}
        <div className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between", canViewWorkload ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Hours Logged This Week</h2>
              <p className="text-xs text-slate-450 mt-0.5">
                {isEmployeeRole ? (
                  <>{weeklyHoursList.reduce((acc, d) => acc + d.hours, 0)}h / {weeklyCapacity}h weekly capacity ({Math.round((weeklyHoursList.reduce((acc, d) => acc + d.hours, 0) / (weeklyCapacity || 1)) * 100)}%)</>
                ) : (
                  <>{weeklyHoursList.reduce((acc, d) => acc + d.hours, 0)}h total logged across team this week</>
                )}
              </p>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-end justify-between gap-3 h-44 mt-2">
            {weeklyHoursList.map((d) => (
              <div key={d.day} className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
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
                    d.employees.length > 0 ? (
                      d.employees.map((e) => {
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

                {/* Total hours label showing out of max capacity */}
                <span className="text-[9px] font-black text-slate-700">
                  {isEmployeeRole ? `${d.hours}h / ${dailyCapacity}h` : `${d.hours}h`}
                </span>

                {/* Stacked Project / Employee Bar */}
                <div className="w-full h-32 flex flex-col-reverse justify-start rounded-xl bg-slate-50 border border-slate-150 overflow-hidden cursor-pointer hover:bg-slate-100/70 transition-colors p-0.5">
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
                      <div className="w-full h-full bg-slate-200/40 rounded-lg" />
                    )
                  ) : (
                    d.employees.length > 0 ? (
                      d.employees.map((e) => {
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
                      <div className="w-full h-full bg-slate-200/40 rounded-lg" />
                    )
                  )}
                </div>

                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{d.day}</span>
              </div>
            ))}
          </div>

          {/* Color Legend */}
          {isEmployeeRole ? (
            uniqueLoggedProjects.length > 0 ? (
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
            ) : null
          ) : (
            uniqueLoggedEmployees.length > 0 ? (
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
            ) : null
          )}
        </div>

        {/* Team workload */}
        {canViewWorkload && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-1">Team Workload</h2>
            <p className="text-xs text-slate-400 mb-5">Capacity this sprint</p>
            <div className="space-y-4">
              {workloadData.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border border-slate-100 shadow-3xs", t.bg || "bg-indigo-50 text-indigo-650 border border-indigo-100/50")}>
                    {t.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">{t.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{t.load}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${t.load}%`,
                          backgroundColor: t.load > 85 ? '#ef4444' : t.load > 60 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent projects — spans 2 or 3 */}
        <div className={cn("rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col", canViewQuickActions ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recent Projects</h2>
              <p className="text-xs text-slate-450 mt-0.5">Your most active development tracks</p>
            </div>
            <a href="/projects" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-650 hover:bg-slate-50 transition-all shadow-xs whitespace-nowrap shrink-0">
              View all
            </a>
          </div>
          <div className="max-h-[580px] overflow-y-auto p-6 bg-slate-50/30 flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsToRender.map((p) => (
                <ProjectCard key={p.name} p={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Right rail: Deadlines + Activity + Quick actions */}
        <div className={cn("space-y-5", !canViewQuickActions && "lg:col-span-3 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0")}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h2>
            </div>
            <div className="space-y-3">
              {deadlines.map((d) => (
                <div key={d.title} className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-650 leading-snug">{d.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      d.urgent ? 'bg-red-50 text-red-650 border border-red-150/30' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {d.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Recent Activity</h2>
            <div className="relative border-l-2 border-slate-100 pl-5 space-y-5">
              {recentActivity.map((a, i) => (
                <div key={i} className="relative">
                  <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white ${a.dot}`} />
                  <p className="text-xs font-semibold text-slate-650 leading-snug">{a.text}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 font-medium">{a.time}</p>
                </div>
              ))}
            </div>
          </div>

          {canViewQuickActions && (
            <QuickActionsPanel projects={activeProjects} employees={allEmployees} />
          )}
        </div>
      </div>
    </div>
  );
}