import { getCurrentUser } from '@/lib/auth/dal';
import { hasPermission } from '@/lib/auth/permissions';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import { getTasksByProjectAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';

const recentProjects: any[] = [];

export function getRelativeTimeString(dateStr: string | Date | undefined): string {
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

export function formatDeadlineDate(dateStr: string | undefined): string {
  if (!dateStr || dateStr === 'No Due Date') return 'No Due Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isDeadlineUrgent(dateStr: string | undefined): boolean {
  if (!dateStr || dateStr === 'No Due Date') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
}

export function parseHoursFromBudget(budget: string | undefined): number {
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

export function getCurrentWeekDays() {
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

export async function getDashboardData() {
  const user = await getCurrentUser();
  const userRole = (user?.role || '').toLowerCase();
  const userId = user?.id || '';
  const canViewQuickActions = hasPermission(user?.role, 'dashboard:view-quick-actions');

  let activeProjects: any[] = [];
  let deadlines: { title: string; date: string; urgent: boolean }[] = [];
  let recentActivity: { text: string; time: string; dot: string }[] = [];
  let workloadData: { name: string; role: string; load: number; initials: string; bg?: string }[] = [];
  let hierarchyTree: any[] = [];
  let allEmployees: any[] = [];
  let weeklyHoursList: { day: string; fullDayLabel: string; dateFormatted: string; hours: number; projects: { projectName: string; hours: number }[]; employees: { employeeName: string; hours: number }[] }[] = [];
  let maxHours = 8;
  let uniqueLoggedProjects: string[] = [];
  let uniqueLoggedEmployees: string[] = [];
  let dailyCapacity = 8;
  let weeklyCapacity = 40;
  let allWorkItems: any[] = [];

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

        if (p.status !== 'Completed' && p.dueDate && p.dueDate !== 'No Due Date') {
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
            const taskLogsSum = (task.workLogs || []).reduce((sum: number, wl: any) => sum + (Number(wl.hours) || 0), 0);
            totalActualHours += taskLogsSum;

            if (task.status !== 'Done' && task.dueDate) {
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
                  dot: 'bg-emerald-550',
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
            const issueLogsSum = (issue.workLogs || []).reduce((sum: number, wl: any) => sum + (Number(wl.hours) || 0), 0);
            totalActualHours += issueLogsSum;

            if (issue.status !== 'Resolved' && issue.status !== 'Closed' && issue.dueDate) {
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

      allWorkItems = [];
      tasksResList.forEach(tRes => {
        if (tRes.success && tRes.data) {
          allWorkItems.push(...tRes.data.map((t: any) => ({ ...t, itemType: 'task' })));
        }
      });
      issuesResList.forEach(iRes => {
        if (iRes.success && iRes.data) {
          allWorkItems.push(...iRes.data.map((i: any) => ({ ...i, itemType: 'issue' })));
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
              } else if (Array.isArray(allEmployees)) {
                const matchedEmp = allEmployees.find((e: any) => String(e.id || e._id) === String(logUserId));
                if (matchedEmp) resolvedUserName = matchedEmp.name;
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

      // Use outer userRole
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
      dynamicStats[3].value = `${Math.round(roleFilteredTotalActualHours * 100) / 100}h`;
      dynamicStats[3].change = `+${Math.round(remainingHours * 100) / 100}h left`;

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

        // Calculate Hierarchy Tree
        const activeMembers = allEmployees.filter(e => {
          const r = (e.role || '').toLowerCase();
          return r === 'manager' || r === 'team lead' || r === 'employee';
        });

        if (userRole === 'admin') {
          const managers = activeMembers.filter(m => (m.role || '').toLowerCase() === 'manager');
          hierarchyTree = managers.map(mgr => {
            const mgrLeads = activeMembers.filter(e => e.manager === mgr.id && (e.role || '').toLowerCase().replace('-', ' ') === 'team lead');
            const mgrEmployees = activeMembers.filter(e => e.manager === mgr.id && (e.role || '').toLowerCase() === 'employee');

            const leadsTree = mgrLeads.map(lead => {
              const leadEmp = mgrEmployees.filter(emp => {
                const shares = activeProjects.some(p => 
                  p.members?.some((m: any) => m.userId?.toString() === lead.id) &&
                  p.members?.some((m: any) => m.userId?.toString() === emp.id)
                );
                return shares;
              });
              return { ...lead, children: leadEmp };
            });

            const standaloneEmp = mgrEmployees.filter(emp => {
              const underAnyLead = mgrLeads.some(lead => 
                activeProjects.some(p => 
                  p.members?.some((m: any) => m.userId?.toString() === lead.id) &&
                  p.members?.some((m: any) => m.userId?.toString() === emp.id)
                )
              );
              return !underAnyLead;
            });

            return {
              ...mgr,
              leads: leadsTree,
              standalone: standaloneEmp
            };
          });
        } else if (userRole === 'manager') {
          const mgr = activeMembers.find(m => m.id === userId) || {
            id: userId,
            name: user?.name || 'Manager',
            role: 'Manager',
            initials: user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'M',
            bg: 'bg-indigo-500'
          };

          const mgrLeads = activeMembers.filter(e => e.manager === userId && (e.role || '').toLowerCase().replace('-', ' ') === 'team lead');
          const mgrEmployees = activeMembers.filter(e => e.manager === userId && (e.role || '').toLowerCase() === 'employee');

          const leadsTree = mgrLeads.map(lead => {
            const leadEmp = mgrEmployees.filter(emp => {
              const shares = activeProjects.some(p => 
                p.members?.some((m: any) => m.userId?.toString() === lead.id) &&
                p.members?.some((m: any) => m.userId?.toString() === emp.id)
              );
              return shares;
            });
            return { ...lead, children: leadEmp };
          });

          const standaloneEmp = mgrEmployees.filter(emp => {
            const underAnyLead = mgrLeads.some(lead => 
              activeProjects.some(p => 
                p.members?.some((m: any) => m.userId?.toString() === lead.id) &&
                p.members?.some((m: any) => m.userId?.toString() === emp.id)
              )
            );
            return !underAnyLead;
          });

          hierarchyTree = [{
            ...mgr,
            leads: leadsTree,
            standalone: standaloneEmp
          }];
        } else if (userRole.replace('-', ' ') === 'team lead') {
          const managerId = user?.manager;
          if (!managerId || managerId === 'none') {
            hierarchyTree = [];
          } else {
            const mgr = activeMembers.find(m => m.id === managerId) || {
              id: managerId || '',
              name: 'Assigned Manager',
              role: 'Manager',
              initials: 'M',
              bg: 'bg-slate-400'
            };

            const lead = activeMembers.find(m => m.id === userId) || {
              id: userId,
              name: user?.name || 'Team Lead',
              role: 'Team Lead',
              initials: user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'TL',
              bg: 'bg-amber-500'
            };

            const leadEmp = activeMembers.filter(emp => {
              if ((emp.role || '').toLowerCase() !== 'employee') return false;
              const shares = activeProjects.some(p => 
                p.members?.some((m: any) => m.userId?.toString() === userId) &&
                p.members?.some((m: any) => m.userId?.toString() === emp.id)
              );
              return shares;
            });

            hierarchyTree = [{
              ...mgr,
              leads: [{ ...lead, children: leadEmp }],
              standalone: []
            }];
          }
        } else {
          // Employee
          const managerId = user?.manager;
          if (!managerId || managerId === 'none') {
            hierarchyTree = [];
          } else {
            const mgr = activeMembers.find(m => m.id === managerId) || {
              id: managerId || '',
              name: 'Assigned Manager',
              role: 'Manager',
              initials: 'M',
              bg: 'bg-slate-400'
            };

            const sharedLeads = activeMembers.filter(lead => {
              if ((lead.role || '').toLowerCase().replace('-', ' ') !== 'team lead') return false;
              const shares = activeProjects.some(p => 
                p.members?.some((m: any) => m.userId?.toString() === lead.id) &&
                p.members?.some((m: any) => m.userId?.toString() === userId)
              );
              return shares;
            });

            const emp = activeMembers.find(m => m.id === userId) || {
              id: userId,
              name: user?.name || 'Employee',
              role: 'Employee',
              initials: user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'E',
              bg: 'bg-emerald-500'
            };

            const leadsTree = sharedLeads.map(lead => {
              return { ...lead, children: [emp] };
            });

            const standalone = sharedLeads.length === 0 ? [emp] : [];

            hierarchyTree = [{
              ...mgr,
              leads: leadsTree,
              standalone
            }];
          }
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
      team: p.members.filter((m: any) => {
        const r = m.role?.toLowerCase();
        if (r === 'admin') return false;
        const nameLower = (m.name || '').toLowerCase();
        if (nameLower.includes('admin')) return false;
        return true;
      }).map((m: any) => ({
        initials: m.initials,
        name: m.name,
        bg: m.bg,
        role: m.role
      })),
      updatedAt: 'Just now',
    };
  }) : recentProjects;

  const isEmployeeRole = userRole === 'employee';

  return {
    user,
    userRole,
    canViewQuickActions,
    dynamicStats,
    weeklyHoursList,
    weeklyCapacity,
    dailyCapacity,
    isEmployeeRole,
    maxHours,
    uniqueLoggedProjects,
    uniqueLoggedEmployees,
    hierarchyTree,
    projectsToRender,
    deadlines,
    recentActivity,
    allEmployees,
    activeProjects,
    workloadData
  };
}
