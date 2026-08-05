import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import { getTasksByProjectAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';

export function getDateRange(preset: string, customStart?: string, customEnd?: string) {
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

export function useReportsHoursService() {
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

    if (isEmployeeRole && user) {
      result = result.filter(log => {
        return (log.userName && user.name && log.userName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
               (log.userId && user.id && String(log.userId) === String(user.id));
      });
    }

    const { start, end } = getDateRange(presetFilter, customStartDate, customEndDate);
    result = result.filter(log => {
      const time = log.date.getTime();
      return time >= start.getTime() && time <= end.getTime();
    });

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(log =>
        log.itemName.toLowerCase().includes(q) ||
        log.projectName.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.getTime() - a.date.getTime();
      if (sortBy === 'date_asc') return a.date.getTime() - b.date.getTime();
      if (sortBy === 'hours_desc') return b.hours - a.hours;
      if (sortBy === 'hours_asc') return a.hours - b.hours;
      return b.date.getTime() - a.date.getTime();
    });

    return result;
  }, [allLogs, presetFilter, customStartDate, customEndDate, searchText, sortBy, isEmployeeRole, user]);

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

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [presetFilter, customStartDate, customEndDate, searchText, sortBy]);

  return {
    user,
    router,
    loading,
    activeTab,
    setActiveTab,
    presetFilter,
    setPresetFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    searchText,
    setSearchText,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    isEmployeeRole,
    filteredLogs,
    totalHours,
    uniqueLoggedProjectsReport,
    projectBreakdown,
    employeeBreakdown,
    dayBreakdown,
    mostActiveProject,
    avgDailyHours,
    totalPages,
    paginatedLogs,
    loadData,
  };
}
