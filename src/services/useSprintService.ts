import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { useUser } from '@/contexts/UserContext';
import { getEmployeesAction } from '@/actions/projects';
import { updateTaskAction, deleteTaskAction } from '@/actions/tasks';
import { updateIssueAction, deleteIssueAction, uploadIssueAttachmentAction } from '@/actions/issues';
import { fetchAllSprintData, clearSprintDataCache } from '@/lib/sprintLoader';
import { getCurrentWeekBounds, isItemInSprint } from '@/lib/utils';
import type { Task, Subtask } from '@/types/tasks.types';
import type { Issue } from '@/types/issues.types';
import type { SprintItem } from '@/types/sprint.types';

export function getAttachmentUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api$/, '');
  return `${serverBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function useSprintService() {
  const { user } = useUser();
  const isClient = user?.role?.toLowerCase() === 'client';
  const canEditHours = user?.role?.toLowerCase() === 'team lead' || user?.role?.toLowerCase() === 'employee';

  // Data loading states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters and Views
  const [viewMode, setViewMode] = useState<'sheet' | 'board'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [filterType, setFilterType] = useState('All'); // All, Tasks, Issues
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  // Hours Modal States
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [hoursModalTarget, setHoursModalTarget] = useState<{ id: string; type: 'task' | 'issue'; newStatus: string } | null>(null);
  const [inputHours, setInputHours] = useState('');

  // Detailed Drawer States
  const [activeDetailItem, setActiveDetailItem] = useState<any | null>(null);
  const [tempHours, setTempHours] = useState('0');
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Employee Detail Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  // Current Week Bounds
  const { monday, sunday } = getCurrentWeekBounds();
  const weekRangeStr = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Load Data
  const loadSprintData = async () => {
    setLoading(true);
    try {
      const { tasks: allTasks, issues: allIssues, projects: allProjs } = await fetchAllSprintData();
      setTasks(allTasks);
      setIssues(allIssues);
      setProjects(allProjs);

      const empRes = await getEmployeesAction();
      if (empRes.success && empRes.data && empRes.data.length > 0) {
        setMembers(empRes.data);
      } else {
        const uniqueAssigneesMap = new Map<string, any>();
        allTasks.concat(allIssues as any[]).forEach(item => {
          (item.assignees || []).forEach((a: any) => {
            if (a.name && !uniqueAssigneesMap.has(a.name)) {
              uniqueAssigneesMap.set(a.name, {
                id: a.userId || a.id || a.name,
                name: a.name,
                email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                role: 'Employee',
                initials: a.initials || a.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
                bg: a.bg || 'bg-indigo-600'
              });
            }
          });
        });
        setMembers(Array.from(uniqueAssigneesMap.values()));
      }
    } catch (err) {
      console.error("Error loading sprint page data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSprintData();

    // Listen for storage updates
    const handleStorageChange = () => {
      loadSprintData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pwt_update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pwt_update', handleStorageChange);
    };
  }, []);

  // Helper to check if item is assigned to current user
  const isAssignedToUser = (item: any) => {
    if (!user) return false;
    const assignees = Array.isArray(item.assignees) ? item.assignees : [];
    return assignees.some((a: any) => {
      if (!a) return false;
      const aName = typeof a === 'string' ? a : a.name;
      const aId = typeof a === 'object' ? a.id || a.userId : null;
      const aEmail = typeof a === 'object' ? a.email : null;

      const matchName = aName && user.name && aName.toLowerCase().trim() === user.name.toLowerCase().trim();
      const matchId = aId && user.id && String(aId) === String(user.id);
      const matchEmail = aEmail && user.email && aEmail.toLowerCase().trim() === user.email.toLowerCase().trim();

      return matchName || matchId || matchEmail;
    });
  };

  const isEmployeeRole = user?.role === 'Employee';
  const isClientRole = user?.role === 'Client';

  const clientProjectIds = new Set(
    projects
      .filter(p => (p.members || []).some((m: any) => {
        const mName = m.name;
        const mId = m.userId || m.id;
        return (mName && user?.name && mName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
          (mId && user?.id && String(mId) === String(user.id));
      }))
      .map(p => p.id)
  );

  // Filter tasks and issues down to just sprint items
  const sprintTasks = tasks.filter(t => isItemInSprint(t.dueDate, t.status));
  const sprintIssues = issues.filter(i => isItemInSprint(i.dueDate, i.status));

  // Convert tasks and issues into a unified SprintItem array
  const rawSprintItems: SprintItem[] = [
    ...sprintTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      startDate: t.startDate,
      assignees: t.assignees || [],
      actualHours: t.actualHours || 0,
      workLogs: t.workLogs || [],
      comments: t.comments || [],
      projectId: t.projectId,
      projectName: t.projectName,
      itemType: 'task' as const,
      subtasks: t.subtasks || []
    })),
    ...sprintIssues.map(i => {
      return {
        id: i.id,
        title: i.title,
        description: i.description || '',
        status: i.status === 'Open' ? 'To Do' : i.status === 'In Progress' ? 'In Progress' : i.status === 'Resolved' ? 'In Review' : 'Done',
        priority: i.priority === 'Critical' ? 'Urgent' : i.priority,
        dueDate: i.dueDate,
        assignees: i.assignees || [],
        actualHours: (i as any).actualHours || 0,
        workLogs: (i as any).workLogs || [],
        comments: i.comments || [],
        projectId: i.projectId,
        projectName: i.projectName,
        itemType: 'issue' as const,
        type: i.type,
        commentsCount: i.commentsCount || 0,
        relatedTaskId: (i as any).relatedTaskId || '',
        relatedTaskTitle: (i as any).relatedTaskTitle || '',
        attachments: (i as any).attachments || []
      };
    })
  ];

  // Role-filtered sprint items
  const sprintItems = rawSprintItems.filter(item => {
    if (isEmployeeRole) {
      return isAssignedToUser(item);
    }
    if (isClientRole && clientProjectIds.size > 0 && item.projectId) {
      return clientProjectIds.has(item.projectId);
    }
    return true;
  });

  // Apply project, type & search filters
  const filteredSprintItems = sprintItems.filter(item => {
    const matchesProject = filterProject === 'All' || item.projectId === filterProject;
    const matchesType = filterType === 'All' ||
      (filterType === 'Tasks' && item.itemType === 'task') ||
      (filterType === 'Issues' && item.itemType === 'issue');
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProject && matchesType && matchesSearch;
  });

  // Calculate Metrics
  const totalItems = sprintItems.length;
  const completedItems = sprintItems.filter(item => item.status === 'Done').length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;

  const totalTasksCount = sprintTasks.length;
  const completedTasksCount = sprintTasks.filter(t => t.status === 'Done').length;

  const totalIssuesCount = sprintIssues.length;
  const resolvedIssuesCount = sprintIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;

  const totalLoggedHours = sprintItems.reduce((acc, item) => {
    const logsSum = (item.workLogs || []).reduce((sum: number, wl: any) => sum + (Number(wl.hours) || 0), 0);
    return acc + logsSum;
  }, 0);

  // Detail item handler
  const handleItemClick = (item: SprintItem) => {
    setActiveDetailItem(item);
    setTempHours(String(item.actualHours || 0));
    setIsEditingHours(false);
    setNewCommentText('');
    setNewSubtaskText('');
  };

  // Dispatch update event
  const dispatchUpdate = () => {
    clearSprintDataCache();
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('pwt_update'));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUpdateRelatedTask = async (newTaskId: string) => {
    if (!activeDetailItem) return;
    const task = tasks.find(t => t.id === newTaskId);
    const newTitle = task ? task.title : '';

    const res = await updateIssueAction(activeDetailItem.id, {
      relatedTaskId: newTaskId || null as any,
      relatedTaskTitle: newTitle || null as any
    });

    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : null);
      dispatchUpdate();
    }
  };

  const handleAddAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeDetailItem) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const nextAttachments = [...(activeDetailItem.attachments || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadIssueAttachmentAction(formData);
      if (res.success && res.url) {
        nextAttachments.push(res.url);
      }
    }

    const resUpdate = await updateIssueAction(activeDetailItem.id, { attachments: nextAttachments });
    if (resUpdate.success && resUpdate.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, attachments: nextAttachments } : null);
      dispatchUpdate();
    }
    setUploadingImage(false);
  };

  const handleRemoveAttachment = async (urlToRemove: string) => {
    if (!activeDetailItem) return;
    const nextAttachments = (activeDetailItem.attachments || []).filter((url: string) => url !== urlToRemove);

    const res = await updateIssueAction(activeDetailItem.id, { attachments: nextAttachments });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, attachments: nextAttachments } : null);
      dispatchUpdate();
    }
  };

  // State update handlers
  const handleUpdateStatus = async (newStatus: any) => {
    if (!activeDetailItem) return;

    // Status translation for issue
    let issueStatus = newStatus;
    if (activeDetailItem.itemType === 'issue') {
      if (newStatus === 'To Do') issueStatus = 'Open';
      else if (newStatus === 'In Progress') issueStatus = 'In Progress';
      else if (newStatus === 'In Review') issueStatus = 'Resolved';
      else if (newStatus === 'Done') issueStatus = 'Closed';
    }

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { status: newStatus });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, status: newStatus } : null);
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { status: issueStatus });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, status: newStatus } : null);
        dispatchUpdate();
      }
    }
  };

  const handleUpdatePriority = async (newPriority: any) => {
    if (!activeDetailItem) return;

    // Issue priority
    let issuePriority = newPriority;
    if (activeDetailItem.itemType === 'issue' && newPriority === 'Urgent') {
      issuePriority = 'Critical';
    }

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { priority: newPriority });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, priority: newPriority } : null);
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { priority: issuePriority });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, priority: newPriority } : null);
        dispatchUpdate();
      }
    }
  };

  const handleUpdateTargetDate = async (newVal: string) => {
    if (!activeDetailItem) return;
    const valueToSave = newVal || 'No Due Date';

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { dueDate: valueToSave });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, dueDate: valueToSave } : null);
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { dueDate: valueToSave });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, dueDate: valueToSave } : null);
        dispatchUpdate();
      }
    }
  };

  const handleSaveHoursValue = async () => {
    if (!activeDetailItem) return;
    const input = document.getElementById('sprint-log-hours-input') as HTMLInputElement;
    const numHours = parseFloat(input?.value || '0');
    if (numHours <= 0) return;

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { newWorkLog: { hours: numHours } });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: res.data!.actualHours, workLogs: res.data!.workLogs } : null);
        setTasks(prev => prev.map(t => t.id === activeDetailItem.id ? res.data! : t));
        if (input) input.value = '';
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { newWorkLog: { hours: numHours } } as any);
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: res.data!.actualHours, workLogs: res.data!.workLogs } : null);
        setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? res.data! : i));
        if (input) input.value = '';
        dispatchUpdate();
      }
    }
  };

  const handleAddComment = async () => {
    if (!activeDetailItem || !newCommentText.trim()) return;
    const newComment = {
      id: 'comment_' + Date.now(),
      author: user?.name || 'PWT Team Member',
      initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'ME',
      text: newCommentText.trim(),
      time: new Date().toISOString()
    };
    const nextComments = [newComment, ...(activeDetailItem.comments || [])];

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { comments: nextComments });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments } : null);
        setNewCommentText('');
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { comments: nextComments });
      if (res.success) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments, commentsCount: nextComments.length } : null);
        setNewCommentText('');
        dispatchUpdate();
      }
    }
  };

  const handleToggleSubtask = async (subId: string) => {
    if (!activeDetailItem || activeDetailItem.itemType !== 'task' || !activeDetailItem.subtasks) return;
    const nextSubtasks = activeDetailItem.subtasks.map((s: any) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );

    const res = await updateTaskAction(activeDetailItem.id, { subtasks: nextSubtasks });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, subtasks: nextSubtasks } : null);
      dispatchUpdate();
    }
  };

  const handleAddSubtask = async () => {
    if (!activeDetailItem || activeDetailItem.itemType !== 'task' || !newSubtaskText.trim()) return;
    const newSub: Subtask = {
      id: 'sub_' + Date.now(),
      title: newSubtaskText.trim(),
      completed: false
    };
    const nextSubtasks = [...(activeDetailItem.subtasks || []), newSub];

    const res = await updateTaskAction(activeDetailItem.id, { subtasks: nextSubtasks });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, subtasks: nextSubtasks } : null);
      setNewSubtaskText('');
      dispatchUpdate();
    }
  };

  const handleDeleteActiveItem = async () => {
    if (!activeDetailItem) return;
    if (confirm(`Are you sure you want to delete this ${activeDetailItem.itemType}?`)) {
      if (activeDetailItem.itemType === 'task') {
        const res = await deleteTaskAction(activeDetailItem.id);
        if (res.success) {
          setActiveDetailItem(null);
          dispatchUpdate();
        }
      } else {
        const res = await deleteIssueAction(activeDetailItem.id);
        if (res.success) {
          setActiveDetailItem(null);
          dispatchUpdate();
        }
      }
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string, cardType: 'task' | 'issue') => {
    if (isClient) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('cardType', cardType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    if (isClient) return;
    setDraggedOverCol(colStatus);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    if (isClient) return;
    const cardId = e.dataTransfer.getData('cardId');
    const cardType = e.dataTransfer.getData('cardType') as 'task' | 'issue';

    if (!cardId) return;

    let targetStatus = colStatus;
    if (cardType === 'issue') {
      if (colStatus === 'To Do') targetStatus = 'Open';
      else if (colStatus === 'In Progress') targetStatus = 'In Progress';
      else if (colStatus === 'In Review') targetStatus = 'Resolved';
      else if (colStatus === 'Done') targetStatus = 'Closed';
    }

    if (colStatus === 'Done' && canEditHours) {
      setHoursModalTarget({ id: cardId, type: cardType, newStatus: targetStatus });
      setInputHours('');
      setShowHoursModal(true);
    } else {
      // Optimistic update
      if (cardType === 'task') {
        setTasks(prev => prev.map(t => t.id === cardId ? { ...t, status: targetStatus as any } : t));
      } else {
        setIssues(prev => prev.map(i => i.id === cardId ? { ...i, status: targetStatus as any } : i));
      }

      if (cardType === 'task') {
        const res = await updateTaskAction(cardId, { status: targetStatus as any });
        if (res.success) {
          dispatchUpdate();
        } else {
          loadSprintData();
        }
      } else {
        const res = await updateIssueAction(cardId, { status: targetStatus as any });
        if (res.success) {
          dispatchUpdate();
        } else {
          loadSprintData();
        }
      }
    }
  };

  const handleSaveTransitionHours = async () => {
    if (!hoursModalTarget) return;
    const hoursVal = parseFloat(inputHours) || 0;

    // Optimistic update
    if (hoursModalTarget.type === 'task') {
      setTasks(prev => prev.map(t => t.id === hoursModalTarget.id ? { ...t, status: hoursModalTarget.newStatus as any } : t));
    } else {
      setIssues(prev => prev.map(i => i.id === hoursModalTarget.id ? { ...i, status: hoursModalTarget.newStatus as any } : i));
    }

    if (hoursModalTarget.type === 'task') {
      const payload: any = { status: hoursModalTarget.newStatus as any };
      if (hoursVal > 0) {
        payload.newWorkLog = { hours: hoursVal };
      }
      const res = await updateTaskAction(hoursModalTarget.id, payload);
      if (res.success) {
        dispatchUpdate();
      } else {
        loadSprintData();
      }
    } else {
      const payload: any = { status: hoursModalTarget.newStatus as any };
      if (hoursVal > 0) {
        payload.newWorkLog = { hours: hoursVal };
      }
      const res = await updateIssueAction(hoursModalTarget.id, payload);
      if (res.success) {
        dispatchUpdate();
      } else {
        loadSprintData();
      }
    }
    setShowHoursModal(false);
    setHoursModalTarget(null);
  };

  // Members analytics data
  let memberAnalytics = members.map(m => {
    const assignedItems = sprintItems.filter(item =>
      item.assignees.some(a => a.name === m.name || a.userId === m.id || a.id === m.id)
    );
    const completed = assignedItems.filter(item => item.status === 'Done' || item.status === 'Closed' || item.status === 'Resolved').length;
    return {
      ...m,
      assignedCount: assignedItems.length,
      completedCount: completed,
      pct: assignedItems.length > 0 ? Math.round((completed / assignedItems.length) * 100) : 0
    };
  });

  // Always exclude Admin accounts from the employee workload distribution list
  memberAnalytics = memberAnalytics.filter(m => m.role?.toLowerCase() !== 'admin');

  // Role-based workload distribution visibility
  if (user?.role === 'Employee') {
    memberAnalytics = memberAnalytics.filter(m =>
      m.name === user.name || m.email === user.email || m.id === user.id
    );
    if (memberAnalytics.length === 0 && user) {
      const userAssignedItems = sprintItems.filter(item =>
        item.assignees.some(a => a.name === user.name || a.userId === user.id)
      );
      const userCompleted = userAssignedItems.filter(item => item.status === 'Done' || item.status === 'Closed' || item.status === 'Resolved').length;
      memberAnalytics = [{
        id: user.id,
        name: user.name || 'Me',
        email: user.email,
        role: user.role || 'Employee',
        initials: user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'ME',
        bg: 'bg-indigo-600',
        assignedCount: userAssignedItems.length,
        completedCount: userCompleted,
        pct: userAssignedItems.length > 0 ? Math.round((userCompleted / userAssignedItems.length) * 100) : 0
      }];
    }
  } else if (user?.role === 'Client') {
    const clientEmployeeIdentifiers = new Set<string>();

    sprintItems.forEach(item => {
      (item.assignees || []).forEach((a: any) => {
        if (a.name) clientEmployeeIdentifiers.add(a.name);
        if (a.userId) clientEmployeeIdentifiers.add(a.userId);
        if (a.id) clientEmployeeIdentifiers.add(a.id);
      });
    });

    projects.forEach(p => {
      (p.members || []).forEach((m: any) => {
        if (m.name) clientEmployeeIdentifiers.add(m.name);
        if (m.userId) clientEmployeeIdentifiers.add(m.userId);
        if (m.id) clientEmployeeIdentifiers.add(m.id);
      });
    });

    memberAnalytics = memberAnalytics.filter(m =>
      clientEmployeeIdentifiers.has(m.name) || clientEmployeeIdentifiers.has(m.id)
    );
  } else if (user?.role === 'Team Lead') {
    memberAnalytics = memberAnalytics.filter(m => {
      if (m.role?.toLowerCase() !== 'employee') return false;

      const sameManager = !!(user.manager && m.manager && String(user.manager) === String(m.manager));
      if (!sameManager) return false;

      const sharedProject = projects.some(p => {
        const isTeamLeadInProject = (p.members || []).some((pm: any) =>
          (pm.name && user.name && pm.name.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
          (pm.userId && user.id && String(pm.userId) === String(user.id)) ||
          (pm.id && user.id && String(pm.id) === String(user.id))
        );

        const isEmployeeInProject = (p.members || []).some((pm: any) =>
          (pm.name && m.name && pm.name.toLowerCase().trim() === m.name.toLowerCase().trim()) ||
          (pm.userId && m.id && String(pm.userId) === String(m.id)) ||
          (pm.id && m.id && String(pm.id) === String(m.id))
        );

        return isTeamLeadInProject && isEmployeeInProject;
      });

      return sharedProject;
    });
  }

  const selectedEmployeeItems = selectedEmployee ? sprintItems.filter(item =>
    item.assignees.some(a => a.name === selectedEmployee.name || a.userId === selectedEmployee.id || a.id === selectedEmployee.id)
  ) : [];

  useEffect(() => {
    if (projects.length === 0 || typeof window === 'undefined') return;

    const pusherKey = process.env.NEXT_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUSHER_CLUSTER || 'ap2';

    if (!pusherKey) {
      console.warn('[Pusher] Client warning: NEXT_PUSHER_KEY is not defined in .env.');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const activeChannels: any[] = [];

    projects.forEach(project => {
      const channelName = `project-${project.id}`;
      console.log(`[Pusher] Subscribing to channel: ${channelName}`);
      const channel = pusher.subscribe(channelName);
      activeChannels.push({ name: channelName, channel });

      channel.bind('task-created', (data: { task: any }) => {
        console.log('[Pusher] Sprint task-created received:', data.task);
        setTasks(prev => {
          if (prev.some(t => t.id === data.task.id)) return prev;
          return [data.task, ...prev];
        });
      });

      channel.bind('task-updated', (data: { taskId: string; task: any }) => {
        console.log('[Pusher] Sprint task-updated received:', data.taskId);
        setTasks(prev => prev.map(t => t.id === data.taskId ? data.task : t));

        setActiveDetailItem((prevActive: any) => {
          if (prevActive && prevActive.itemType === 'task' && prevActive.id === data.taskId) {
            return {
              ...prevActive,
              title: data.task.title,
              description: data.task.description || '',
              status: data.task.status,
              priority: data.task.priority,
              dueDate: data.task.dueDate,
              startDate: data.task.startDate,
              assignees: data.task.assignees || [],
              actualHours: data.task.actualHours || 0,
              workLogs: data.task.workLogs || [],
              comments: data.task.comments || [],
              subtasks: data.task.subtasks || []
            };
          }
          return prevActive;
        });
      });

      channel.bind('task-deleted', (data: { taskId: string }) => {
        console.log('[Pusher] Sprint task-deleted received:', data.taskId);
        setTasks(prev => prev.filter(t => t.id !== data.taskId));
        setActiveDetailItem((prevActive: any) => {
          if (prevActive && prevActive.itemType === 'task' && prevActive.id === data.taskId) {
            return null;
          }
          return prevActive;
        });
      });

      channel.bind('issue-created', (data: { issue: any }) => {
        console.log('[Pusher] Sprint issue-created received:', data.issue);
        setIssues(prev => {
          if (prev.some(i => i.id === data.issue.id)) return prev;
          return [data.issue, ...prev];
        });
      });

      channel.bind('issue-updated', (data: { issueId: string; issue: any }) => {
        console.log('[Pusher] Sprint issue-updated received:', data.issueId);
        setIssues(prev => prev.map(i => i.id === data.issueId ? data.issue : i));

        setActiveDetailItem((prevActive: any) => {
          if (prevActive && prevActive.itemType === 'issue' && prevActive.id === data.issueId) {
            return {
              ...prevActive,
              title: data.issue.title,
              description: data.issue.description || '',
              status: data.issue.status === 'Open' ? 'To Do' : data.issue.status === 'In Progress' ? 'In Progress' : data.issue.status === 'Resolved' ? 'In Review' : 'Done',
              priority: data.issue.priority === 'Critical' ? 'Urgent' : data.issue.priority,
              dueDate: data.issue.dueDate,
              assignees: data.issue.assignees || [],
              actualHours: (data.issue as any).actualHours || 0,
              workLogs: (data.issue as any).workLogs || [],
              comments: data.issue.comments || [],
              type: data.issue.type,
              commentsCount: data.issue.commentsCount || 0,
              relatedTaskId: (data.issue as any).relatedTaskId || '',
              relatedTaskTitle: (data.issue as any).relatedTaskTitle || '',
              attachments: (data.issue as any).attachments || []
            };
          }
          return prevActive;
        });
      });

      channel.bind('issue-deleted', (data: { issueId: string }) => {
        console.log('[Pusher] Sprint issue-deleted received:', data.issueId);
        setIssues(prev => prev.filter(i => i.id !== data.issueId));
        setActiveDetailItem((prevActive: any) => {
          if (prevActive && prevActive.itemType === 'issue' && prevActive.id === data.issueId) {
            return null;
          }
          return prevActive;
        });
      });
    });

    return () => {
      activeChannels.forEach(c => {
        console.log(`[Pusher] Unsubscribing from channel: ${c.name}`);
        c.channel.unbind_all();
        pusher.unsubscribe(c.name);
      });
      pusher.disconnect();
    };
  }, [projects]);

  return {
    user,
    isClient,
    canEditHours,
    tasks,
    issues,
    projects,
    members,
    loading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterProject,
    setFilterProject,
    filterType,
    setFilterType,
    draggedOverCol,
    setDraggedOverCol,
    showHoursModal,
    setShowHoursModal,
    hoursModalTarget,
    setHoursModalTarget,
    inputHours,
    setInputHours,
    activeDetailItem,
    setActiveDetailItem,
    tempHours,
    setTempHours,
    isEditingHours,
    setIsEditingHours,
    newCommentText,
    setNewCommentText,
    newSubtaskText,
    setNewSubtaskText,
    selectedEmployee,
    setSelectedEmployee,
    monday,
    sunday,
    weekRangeStr,
    sprintItems,
    filteredSprintItems,
    totalItems,
    completedItems,
    completionPercentage,
    completedTasksCount,
    totalTasksCount,
    resolvedIssuesCount,
    totalIssuesCount,
    totalLoggedHours,
    uploadingImage,
    setUploadingImage,
    handleItemClick,
    dispatchUpdate,
    handleUpdateRelatedTask,
    handleAddAttachment,
    handleRemoveAttachment,
    handleUpdateStatus,
    handleUpdatePriority,
    handleUpdateTargetDate,
    handleSaveHoursValue,
    handleAddComment,
    handleToggleSubtask,
    handleAddSubtask,
    handleDeleteActiveItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSaveTransitionHours,
    memberAnalytics,
    selectedEmployeeItems
  };
}
