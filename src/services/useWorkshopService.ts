'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import type { Employee } from '@/types/projects.types';
import { getTasksByProjectAction, updateTaskAction, deleteTaskAction } from '@/actions/tasks';
import type { Task, Subtask, Comment } from '@/types/tasks.types';
import { getIssuesByProjectAction, updateIssueAction, deleteIssueAction, uploadIssueAttachmentAction } from '@/actions/issues';
import type { Issue } from '@/types/issues.types';
import type { Project, ViewMode, CardDetailItem } from '@/types/workshop.types';

export function getAttachmentUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api$/, '');
  return `${serverBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function useWorkshopService() {
  const { user } = useUser();
  const canCreateProject = usePermission('project:create');
  const isEmployee = user?.role?.toLowerCase() === 'employee';
  const isClient = user?.role?.toLowerCase() === 'client';
  const canEditHours = user?.role?.toLowerCase() === 'team lead' || user?.role?.toLowerCase() === 'employee';

  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('sheet');

  // Search & Filters (Spreadsheet)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Sort State
  const [sortField, setSortField] = useState<'name' | 'progress' | 'priority' | 'status' | 'dueDate'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Columns visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    quarter: true,
    priority: true,
    status: true,
    progress: true,
    techStack: true,
    budget: true,
    team: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<'project' | 'task' | 'issue' | null>(null);

  // Kanban view data
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjTasks, setSelectedProjTasks] = useState<Task[]>([]);
  const [selectedProjIssues, setSelectedProjIssues] = useState<Issue[]>([]);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [kanbanSearch, setKanbanSearch] = useState('');

  // Drag and drop helper state
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  // Resolution Hour prompt state
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [hoursModalTarget, setHoursModalTarget] = useState<{ id: string; type: 'task' | 'issue'; newStatus: string } | null>(null);
  const [inputHours, setInputHours] = useState('');

  // Unified Details Drawer State
  const [activeDetailItem, setActiveDetailItem] = useState<CardDetailItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [tempHours, setTempHours] = useState('');

  // Fetch initial data
  const loadWorkspaceData = async () => {
    setLoading(true);
    const projRes = await getProjectsAction();
    if (projRes.success && projRes.data) {
      setProjects(projRes.data as any[]);
      localStorage.setItem('pwt_projects', JSON.stringify(projRes.data));
    } else {
      const stored = localStorage.getItem('pwt_projects');
      if (stored) {
        try {
          setProjects(JSON.parse(stored));
        } catch {
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    }

    const empRes = await getEmployeesAction();
    if (empRes.success && empRes.data) {
      setEmployees(empRes.data.filter(e => e.role?.toLowerCase() !== 'admin'));
    } else {
      setEmployees([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // Fetch tasks and issues when selected project changes
  useEffect(() => {
    if (!selectedProject) {
      setSelectedProjTasks([]);
      setSelectedProjIssues([]);
      return;
    }

    const fetchDetails = async () => {
      setKanbanLoading(true);
      // Tasks
      const tasksRes = await getTasksByProjectAction(selectedProject.id);
      let tasksData: Task[] = [];
      if (tasksRes.success && tasksRes.data) {
        tasksData = tasksRes.data;
      } else {
        const stored = localStorage.getItem(`pwt_tasks_project_${selectedProject.id}`);
        if (stored) {
          try {
            tasksData = JSON.parse(stored);
          } catch {
            tasksData = [];
          }
        } else {
          tasksData = [];
        }
      }

      // Issues
      const issuesRes = await getIssuesByProjectAction(selectedProject.id);
      let issuesData: Issue[] = [];
      if (issuesRes.success && issuesRes.data) {
        issuesData = issuesRes.data;
      } else {
        const stored = localStorage.getItem(`pwt_issues_project_${selectedProject.id}`);
        if (stored) {
          try {
            issuesData = JSON.parse(stored);
          } catch {
            issuesData = [];
          }
        } else {
          issuesData = [];
        }
      }

      // If user is employee, filter assigned items only
      if (isEmployee && user?.name) {
        tasksData = tasksData.filter(t => t.assignees.some(a => a.name === user.name));
        issuesData = issuesData.filter(i => i.assignees.some(a => a.name === user.name));
      }

      setSelectedProjTasks(tasksData);
      setSelectedProjIssues(issuesData);
      setKanbanLoading(false);
    };

    fetchDetails();
  }, [selectedProject, isEmployee, user]);

  const handleRefreshKanban = async () => {
    if (!selectedProject) return;
    setKanbanLoading(true);
    const tasksRes = await getTasksByProjectAction(selectedProject.id);
    if (tasksRes.success && tasksRes.data) {
      let tasksData = tasksRes.data;
      if (isEmployee && user?.name) {
        tasksData = tasksData.filter(t => t.assignees.some(a => a.name === user.name));
      }
      setSelectedProjTasks(tasksData);
    }
    const issuesRes = await getIssuesByProjectAction(selectedProject.id);
    if (issuesRes.success && issuesRes.data) {
      let issuesData = issuesRes.data;
      if (isEmployee && user?.name) {
        issuesData = issuesData.filter(i => i.assignees.some(a => a.name === user.name));
      }
      setSelectedProjIssues(issuesData);
    }
    setKanbanLoading(false);
  };

  // Toggle complete task directly in the sheet list
  const handleToggleTaskDone = async (task: Task) => {
    const nextStatus = task.status === 'Done' ? 'In Progress' : 'Done';
    const res = await updateTaskAction(task.id, { status: nextStatus });
    if (res.success) {
      setSelectedProjTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

      if (selectedProject) {
        const updatedTasks = selectedProjTasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t);
        const completed = updatedTasks.filter(t => t.status === 'Done').length;
        const total = updatedTasks.length;
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

        const nextProjectList = projects.map(p => p.id === selectedProject.id ? { ...p, progress: newProgress, completedTasks: completed } : p);
        setProjects(nextProjectList);
        localStorage.setItem('pwt_projects', JSON.stringify(nextProjectList));
        setSelectedProject({ ...selectedProject, progress: newProgress, completedTasks: completed });
      }
    }
  };

  // Drag and drop helper trigger updates
  const handleMoveTaskStatus = async (taskId: string, newStatus: Task['status'], hoursLogged?: number) => {
    const payload: Partial<Task> = { status: newStatus };
    if (hoursLogged !== undefined) {
      payload.actualHours = hoursLogged;
    }
    const res = await updateTaskAction(taskId, payload);
    if (res.success) {
      setSelectedProjTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, actualHours: hoursLogged ?? t.actualHours } : t));

      if (selectedProject) {
        const updatedTasks = selectedProjTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        const completed = updatedTasks.filter(t => t.status === 'Done').length;
        const total = updatedTasks.length;
        const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

        const nextProjectList = projects.map(p => p.id === selectedProject.id ? { ...p, progress: newProgress, completedTasks: completed } : p);
        setProjects(nextProjectList);
        localStorage.setItem('pwt_projects', JSON.stringify(nextProjectList));
        setSelectedProject({ ...selectedProject, progress: newProgress, completedTasks: completed });
      }
    }
  };

  const handleMoveIssueStatus = async (issueId: string, newStatus: Issue['status'], hoursLogged?: number) => {
    const payload: Partial<Issue> & { actualHours?: number } = { status: newStatus };
    if (hoursLogged !== undefined) {
      payload.actualHours = hoursLogged;
    }
    const res = await updateIssueAction(issueId, payload);
    if (res.success) {
      setSelectedProjIssues(prev => prev.map(i => {
        if (i.id === issueId) {
          return { ...i, status: newStatus, actualHours: hoursLogged ?? (i as any).actualHours };
        }
        return i;
      }));
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, cardId: string, cardType: 'task' | 'issue') => {
    if (isClient) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('cardType', cardType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (isClient) return;
    setDraggedOverCol(colId);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    if (isClient) return;
    const cardId = e.dataTransfer.getData('cardId');
    const cardType = e.dataTransfer.getData('cardType') as 'task' | 'issue';

    if (!cardId) return;

    const taskStatusMap: Record<string, Task['status']> = {
      todo: 'To Do',
      inprogress: 'In Progress',
      inreview: 'In Review',
      done: 'Done'
    };

    const issueStatusMap: Record<string, Issue['status']> = {
      todo: 'Open',
      inprogress: 'In Progress',
      inreview: 'Resolved',
      done: 'Closed'
    };

    const newStatus = cardType === 'task' ? taskStatusMap[colId] : issueStatusMap[colId];

    if (colId === 'done' && canEditHours) {
      setHoursModalTarget({ id: cardId, type: cardType, newStatus });
      setInputHours('');
      setShowHoursModal(true);
    } else {
      if (cardType === 'task') {
        handleMoveTaskStatus(cardId, newStatus as Task['status']);
      } else {
        handleMoveIssueStatus(cardId, newStatus as Issue['status']);
      }
    }
  };

  const handleSaveTransitionHours = () => {
    if (!hoursModalTarget) return;
    const hoursVal = parseFloat(inputHours) || 0;

    if (hoursModalTarget.type === 'task') {
      handleMoveTaskStatus(hoursModalTarget.id, hoursModalTarget.newStatus as Task['status'], hoursVal);
    } else {
      handleMoveIssueStatus(hoursModalTarget.id, hoursModalTarget.newStatus as Issue['status'], hoursVal);
    }
    setShowHoursModal(false);
    setHoursModalTarget(null);
  };

  const handleCardClick = (cardId: string, cardType: 'task' | 'issue') => {
    if (cardType === 'task') {
      const task = selectedProjTasks.find(t => t.id === cardId);
      if (task) {
        setActiveDetailItem({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          startDate: task.startDate,
          assignees: task.assignees,
          actualHours: task.actualHours || 0,
          workLogs: task.workLogs || [],
          comments: task.comments || [],
          subtasks: task.subtasks || [],
          itemType: 'task'
        });
        setTempHours(String(task.actualHours || 0));
        setIsEditingHours(false);
      }
    } else {
      const issue = selectedProjIssues.find(i => i.id === cardId);
      if (issue) {
        setActiveDetailItem({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          type: issue.type,
          dueDate: issue.dueDate,
          assignees: issue.assignees,
          actualHours: (issue as any).actualHours || 0,
          workLogs: (issue as any).workLogs || [],
          comments: issue.comments || [],
          relatedTaskId: (issue as any).relatedTaskId || '',
          relatedTaskTitle: (issue as any).relatedTaskTitle || '',
          attachments: (issue as any).attachments || [],
          projectId: issue.projectId,
          itemType: 'issue'
        });
        setTempHours(String((issue as any).actualHours || 0));
        setIsEditingHours(false);
      }
    }
  };

  const handleToggleSubtask = async (subId: string) => {
    if (!activeDetailItem || activeDetailItem.itemType !== 'task' || !activeDetailItem.subtasks) return;
    const nextSubtasks = activeDetailItem.subtasks.map(s =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );

    const res = await updateTaskAction(activeDetailItem.id, { subtasks: nextSubtasks });
    if (res.success) {
      setActiveDetailItem({ ...activeDetailItem, subtasks: nextSubtasks });
      setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, subtasks: nextSubtasks } : t));
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
    if (res.success) {
      setActiveDetailItem({ ...activeDetailItem, subtasks: nextSubtasks });
      setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, subtasks: nextSubtasks } : t));
      setNewSubtaskText('');
    }
  };

  const handleAddComment = async () => {
    if (!activeDetailItem || !newCommentText.trim()) return;
    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      author: user?.name || 'PWT Team Member',
      initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ME',
      text: newCommentText.trim(),
      time: new Date().toISOString()
    };
    const nextComments = [newComment, ...activeDetailItem.comments];

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { comments: nextComments });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, comments: nextComments });
        setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, comments: nextComments } : t));
        setNewCommentText('');
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { comments: nextComments });
      if (res.success && res.data) {
        setActiveDetailItem({ ...activeDetailItem, comments: nextComments, commentsCount: nextComments.length });
        setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? (res.data as any) : i));
        setNewCommentText('');
      }
    }
  };

  const handleSaveHoursValue = async (hoursVal: number) => {
    if (!activeDetailItem || hoursVal <= 0) return;

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { newWorkLog: { hours: hoursVal } });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: res.data!.actualHours, workLogs: res.data!.workLogs } : null);
        const nextList = selectedProjTasks.map(t => t.id === activeDetailItem.id ? res.data! : t);
        setSelectedProjTasks(nextList);
        if (selectedProject?.id) {
          localStorage.setItem(`pwt_tasks_project_${selectedProject.id}`, JSON.stringify(nextList));
        }
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { newWorkLog: { hours: hoursVal } } as any);
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: res.data!.actualHours, workLogs: res.data!.workLogs } : null);
        const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? res.data! : i);
        setSelectedProjIssues(nextList);
        if (selectedProject?.id) {
          localStorage.setItem(`pwt_issues_project_${selectedProject.id}`, JSON.stringify(nextList));
        }
      }
    }
  };

  const handleUpdateTargetDate = async (newVal: string) => {
    if (!activeDetailItem) return;
    const valueToSave = newVal || 'No Due Date';

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { dueDate: valueToSave });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, dueDate: valueToSave });
        setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, dueDate: valueToSave } : t));
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { dueDate: valueToSave });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, dueDate: valueToSave });
        setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, dueDate: valueToSave } : i));

        const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, dueDate: valueToSave } : i);
        localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
      }
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUpdateRelatedTask = async (newTaskId: string) => {
    if (!activeDetailItem) return;
    const task = selectedProjTasks.find(t => t.id === newTaskId);
    const newTitle = task ? task.title : '';
    
    const res = await updateIssueAction(activeDetailItem.id, {
      relatedTaskId: newTaskId || null as any,
      relatedTaskTitle: newTitle || null as any
    });
    
    if (res.success) {
      setActiveDetailItem(prev => prev ? { ...prev, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : null);
      setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : i));
      const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : i);
      localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
    }
  };

  const handleAddAttachment = async (files: FileList | null) => {
    if (!activeDetailItem || !files || files.length === 0) return;

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
    if (resUpdate.success) {
      setActiveDetailItem(prev => prev ? { ...prev, attachments: nextAttachments } : null);
      setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i));
      const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i);
      localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
    }
    setUploadingImage(false);
  };

  const handleRemoveAttachment = async (urlToRemove: string) => {
    if (!activeDetailItem) return;
    const nextAttachments = (activeDetailItem.attachments || []).filter((url: string) => url !== urlToRemove);

    const res = await updateIssueAction(activeDetailItem.id, { attachments: nextAttachments });
    if (res.success) {
      setActiveDetailItem(prev => prev ? { ...prev, attachments: nextAttachments } : null);
      setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i));
      const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i);
      localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
    }
  };

  const handleUpdateStatus = async (newStatus: any) => {
    if (!activeDetailItem) return;
    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { status: newStatus });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, status: newStatus });
        setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, status: newStatus } : t));
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { status: newStatus });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, status: newStatus });
        setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, status: newStatus } : i));
        const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, status: newStatus } : i);
        localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
      }
    }
  };

  const handleUpdatePriority = async (newPriority: any) => {
    if (!activeDetailItem) return;
    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { priority: newPriority });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, priority: newPriority });
        setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, priority: newPriority } : t));
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { priority: newPriority });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, priority: newPriority });
        setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, priority: newPriority } : i));
        const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, priority: newPriority } : i);
        localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
      }
    }
  };

  const handleUpdateStartDate = async (newVal: string) => {
    if (!activeDetailItem || activeDetailItem.itemType !== 'task') return;
    const valueToSave = newVal || '';
    const res = await updateTaskAction(activeDetailItem.id, { startDate: valueToSave });
    if (res.success) {
      setActiveDetailItem({ ...activeDetailItem, startDate: valueToSave });
      setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, startDate: valueToSave } : t));
    }
  };

  const handleDeleteActiveItem = async () => {
    if (!activeDetailItem) return false;
    if (confirm(`Are you sure you want to delete this ${activeDetailItem.itemType === 'task' ? 'task' : 'issue'}?`)) {
      if (activeDetailItem.itemType === 'task') {
        const res = await deleteTaskAction(activeDetailItem.id);
        if (res.success) {
          setSelectedProjTasks(prev => prev.filter(t => t.id !== activeDetailItem.id));
          setActiveDetailItem(null);
          return true;
        } else {
          alert(res.error || 'Failed to delete task');
        }
      } else {
        const res = await deleteIssueAction(activeDetailItem.id);
        if (res.success) {
          setSelectedProjIssues(prev => prev.filter(i => i.id !== activeDetailItem.id));
          const nextList = selectedProjIssues.filter(i => i.id !== activeDetailItem.id);
          localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
          setActiveDetailItem(null);
          return true;
        } else {
          alert(res.error || 'Failed to delete issue');
        }
      }
    }
    return false;
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (isEmployee && user?.name) {
      const isMember = p.members.some(m => m.name === user.name || m.userId === user.id);
      if (!isMember) return false;
    }

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.techStack && p.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    let comp = 0;
    if (sortField === 'name') {
      comp = a.name.localeCompare(b.name);
    } else if (sortField === 'progress') {
      comp = a.progress - b.progress;
    } else if (sortField === 'dueDate') {
      comp = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
    } else if (sortField === 'status') {
      comp = a.status.localeCompare(b.status);
    } else if (sortField === 'priority') {
      const prioOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const aVal = prioOrder[a.priority || 'Medium'] || 2;
      const bVal = prioOrder[b.priority || 'Medium'] || 2;
      comp = aVal - bVal;
    }
    return sortAsc ? comp : -comp;
  });

  const exportToCSV = () => {
    const headers = ['Project ID', 'Name', 'Description', 'Quarter', 'Priority', 'Status', 'Progress (%)', 'Budget', 'Team Members'];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name,
      p.description,
      p.targetQuarter || 'Future',
      p.priority || 'Medium',
      p.status,
      p.progress,
      p.budget || '40 hours',
      p.members.map(m => m.name).join('; ')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PWT_Workshop_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getKanbanColumns = () => {
    const filterTerm = kanbanSearch.toLowerCase();

    const tasks = selectedProjTasks.filter(t =>
      t.title.toLowerCase().includes(filterTerm) ||
      t.description.toLowerCase().includes(filterTerm)
    );

    const issues = selectedProjIssues.filter(i =>
      i.title.toLowerCase().includes(filterTerm) ||
      i.description.toLowerCase().includes(filterTerm)
    );

    return [
      {
        id: 'todo',
        title: 'To Do / Open',
        tasks: tasks.filter(t => t.status === 'To Do'),
        issues: issues.filter(i => i.status === 'Open'),
      },
      {
        id: 'inprogress',
        title: 'In Progress',
        tasks: tasks.filter(t => t.status === 'In Progress'),
        issues: issues.filter(i => i.status === 'In Progress'),
      },
      {
        id: 'inreview',
        title: 'In Review',
        tasks: tasks.filter(t => t.status === 'In Review'),
        issues: issues.filter(i => i.status === 'Resolved'),
      },
      {
        id: 'done',
        title: 'Done / Closed',
        tasks: tasks.filter(t => t.status === 'Done'),
        issues: issues.filter(i => i.status === 'Closed'),
      }
    ];
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setViewMode('kanban');
  };

  useEffect(() => {
    if (projects.length === 0 || typeof window === 'undefined') return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    if (!pusherKey) {
      console.warn('[Pusher] Client warning: NEXT_PUBLIC_PUSHER_KEY is not defined in .env.');
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
        console.log('[Pusher] Workshop task-created received:', data.task);
        if (selectedProject && selectedProject.id === project.id) {
          setSelectedProjTasks(prev => {
            if (prev.some(t => t.id === data.task.id)) return prev;
            return [data.task, ...prev];
          });
        }
      });

      channel.bind('task-updated', (data: { taskId: string; task: any }) => {
        console.log('[Pusher] Workshop task-updated received:', data.taskId);
        if (selectedProject && selectedProject.id === project.id) {
          setSelectedProjTasks(prev => prev.map(t => t.id === data.taskId ? data.task : t));
        }

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
        console.log('[Pusher] Workshop task-deleted received:', data.taskId);
        if (selectedProject && selectedProject.id === project.id) {
          setSelectedProjTasks(prev => prev.filter(t => t.id !== data.taskId));
        }
        setActiveDetailItem((prevActive: any) => {
          if (prevActive && prevActive.itemType === 'task' && prevActive.id === data.taskId) {
            return null;
          }
          return prevActive;
        });
      });

      channel.bind('issue-created', (data: { issue: any }) => {
        console.log('[Pusher] Workshop issue-created received:', data.issue);
        if (selectedProject && selectedProject.id === project.id) {
          setSelectedProjIssues(prev => {
            if (prev.some(i => i.id === data.issue.id)) return prev;
            return [data.issue, ...prev];
          });
        }
      });

      channel.bind('issue-updated', (data: { issueId: string; issue: any }) => {
        console.log('[Pusher] Workshop issue-updated received:', data.issueId);
        if (selectedProject && selectedProject.id === project.id) {
          setSelectedProjIssues(prev => prev.map(i => i.id === data.issueId ? data.issue : i));
        }

        setActiveDetailItem((prevActive: any) => {
          if (prevActive && prevActive.itemType === 'issue' && prevActive.id === data.issueId) {
            return {
              ...prevActive,
              title: data.issue.title,
              description: data.issue.description,
              status: data.issue.status,
              priority: data.issue.priority,
              type: data.issue.type,
              dueDate: data.issue.dueDate,
              assignees: data.issue.assignees,
              actualHours: (data.issue as any).actualHours || 0,
              workLogs: (data.issue as any).workLogs || [],
              comments: data.issue.comments || [],
              relatedTaskId: (data.issue as any).relatedTaskId || '',
              relatedTaskTitle: (data.issue as any).relatedTaskTitle || '',
              attachments: (data.issue as any).attachments || [],
              projectId: data.issue.projectId,
            };
          }
          return prevActive;
        });
      });

      channel.bind('issue-deleted', (data: { issueId: string }) => {
        console.log('[Pusher] Workshop issue-deleted received:', data.issueId);
        if (selectedProject && selectedProject.id === project.id) {
          setSelectedProjIssues(prev => prev.filter(i => i.id !== data.issueId));
        }
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
  }, [projects, selectedProject]);

  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inReviewCount = projects.filter(p => p.status === 'In Review').length;
  const planningCount = projects.filter(p => p.status === 'Planning').length;

  return {
    user,
    canCreateProject,
    isEmployee,
    isClient,
    canEditHours,
    projects,
    employees,
    loading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    visibleColumns,
    setVisibleColumns,
    showColMenu,
    setShowColMenu,
    activeModal,
    setActiveModal,
    selectedProject,
    setSelectedProject,
    selectedProjTasks,
    setSelectedProjIssues,
    kanbanLoading,
    kanbanSearch,
    setKanbanSearch,
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
    newCommentText,
    setNewCommentText,
    newSubtaskText,
    setNewSubtaskText,
    isEditingHours,
    setIsEditingHours,
    tempHours,
    setTempHours,
    loadWorkspaceData,
    handleRefreshKanban,
    handleToggleTaskDone,
    handleMoveTaskStatus,
    handleMoveIssueStatus,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSaveTransitionHours,
    handleCardClick,
    handleToggleSubtask,
    handleAddSubtask,
    handleAddComment,
    handleSaveHoursValue,
    handleUpdateTargetDate,
    handleUpdateRelatedTask,
    handleAddAttachment,
    handleRemoveAttachment,
    handleUpdateStatus,
    handleUpdatePriority,
    handleUpdateStartDate,
    handleDeleteActiveItem,
    handleSort,
    exportToCSV,
    filteredProjects,
    getKanbanColumns,
    handleProjectClick,
    totalProjects,
    inProgressCount,
    completedCount,
    inReviewCount,
    planningCount,
    uploadingImage
  };
}
