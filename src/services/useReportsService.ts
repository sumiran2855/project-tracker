import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction } from '@/actions/projects';
import { getAllTasksAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';
import type { ProjectStats, PriorityStats, TeamStats, DayLog } from '@/types/reports.types';

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

export function useReportsService() {
  const { user } = useUser();
  const router = useRouter();
  const canViewReports = usePermission('report:view');

  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  const [projectStatsList, setProjectStatsList] = useState<ProjectStats[]>([]);
  const [priorityStatsList, setPriorityStatsList] = useState<PriorityStats[]>([]);
  const [teamStatsList, setTeamStatsList] = useState<TeamStats[]>([]);
  const [weeklyTimeLogs, setWeeklyTimeLogs] = useState<DayLog[]>([]);
  const [dailyCapacity, setDailyCapacity] = useState(8);
  const [weeklyCapacity, setWeeklyCapacity] = useState(40);
  const [isHoursMenuOpen, setIsHoursMenuOpen] = useState(false);
  const [hoveredHoursIndex, setHoveredHoursIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user && !canViewReports) {
      router.push('/dashboard');
    }
  }, [user, canViewReports, router]);

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
      loadedProjects.forEach(proj => {
        const storedTasksKey = `pwt_tasks_project_${proj.id || proj._id}`;
        const storedTasksStr = localStorage.getItem(storedTasksKey);
        if (storedTasksStr) {
          try {
            const parsed = JSON.parse(storedTasksStr);
            allTasks.push(...parsed);
          } catch (e) {
            console.error(e);
          }
        }
      });
    }

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

    allTasks.forEach((task: any) => {
      const priorityStr = (task.priority || '').toString().toLowerCase();
      if (priorityStr === 'urgent') urgent++;
      else if (priorityStr === 'high') high++;
      else if (priorityStr === 'medium') medium++;
      else if (priorityStr === 'low') low++;
      else medium++;

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
          memberTaskMap[name] = { initials, bg, count: 1 };
        }
      });
    });

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

    const prioritySum = urgent + high + medium + low;
    setPriorityStatsList([
      { name: 'Urgent', value: urgent, color: 'stroke-red-500 fill-red-500 text-red-500', percentage: prioritySum > 0 ? Math.round((urgent / prioritySum) * 100) : 0 },
      { name: 'High', value: high, color: 'stroke-orange-500 fill-orange-500 text-orange-500', percentage: prioritySum > 0 ? Math.round((high / prioritySum) * 100) : 0 },
      { name: 'Medium', value: medium, color: 'stroke-indigo-500 fill-indigo-500 text-indigo-500', percentage: prioritySum > 0 ? Math.round((medium / prioritySum) * 100) : 0 },
      { name: 'Low', value: low, color: 'stroke-slate-400 fill-slate-400 text-slate-400', percentage: prioritySum > 0 ? Math.round((low / prioritySum) * 100) : 0 },
    ]);

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

      const projName = item.projectName || 'Project Workspace';
      const primaryAssigneeName = assignees.length > 0
        ? (typeof assignees[0] === 'string' ? assignees[0] : assignees[0].name)
        : (typeof item.assignee === 'string' ? item.assignee : (item.assignee?.name || item.updatedByUserName || item.createdByUserName));

      const logsToProcess: { hours: number; date: Date; userName?: string; userId?: string }[] = [];
      if (Array.isArray(item.workLogs) && item.workLogs.length > 0) {
        item.workLogs.forEach((wl: any) => {
          const rawH = Number(wl.hours) || 0;
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
            hours: rawH,
            date: new Date(wl.date || wl.createdAt || item.updatedAt || item.createdAt),
            userName: resolvedUserName,
            userId: logUserId,
          });
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
        hours: Math.round(hours * 100) / 100
      }));
      const employees = Object.entries(data.employees).map(([employeeName, hours]) => ({
        employeeName,
        hours: Math.round(hours * 100) / 100
      }));
      return {
        day: w.shortLabel,
        fullDayLabel: w.fullLabel,
        dateFormatted: w.dateFormatted,
        hours: Math.round(data.total * 100) / 100,
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
    if (user && canViewReports) {
      loadReportData();
    }
  }, [user, canViewReports]);

  return {
    user,
    router,
    canViewReports,
    projectsCount,
    tasksCount,
    completedTasksCount,
    overdueTasksCount,
    completionRate,
    projectStatsList,
    priorityStatsList,
    teamStatsList,
    weeklyTimeLogs,
    dailyCapacity,
    weeklyCapacity,
    isHoursMenuOpen,
    setIsHoursMenuOpen,
    hoveredHoursIndex,
    setHoveredHoursIndex,
    loadReportData,
  };
}
