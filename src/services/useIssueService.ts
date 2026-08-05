import { useState, useEffect } from 'react';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import type { Employee, Project } from '@/types/projects.types';
import { getIssuesByProjectAction, updateIssueAction, deleteIssueAction, uploadIssueAttachmentAction } from '@/actions/issues';
import type { Issue } from '@/types/issues.types';
import { getTasksByProjectAction } from '@/actions/tasks';

const fallbackIssues: Issue[] = [];

export function useIssueService() {
  const { user } = useUser();
  const canDeleteIssue = usePermission('issue:delete');
  const isClient = user?.role?.toLowerCase() === 'client';
  const canEditHours = user?.role?.toLowerCase() === 'team lead' || user?.role?.toLowerCase() === 'employee';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [modalStatus, setModalStatus] = useState<Issue['status']>('Open');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [issueToDeleteId, setIssueToDeleteId] = useState<string | null>(null);

  // Detailed Drawer States
  const [activeDetailItem, setActiveDetailItem] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Project tasks and uploading image state
  const [activeProjectTasks, setActiveProjectTasks] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch tasks for the project of the active issue details item
  useEffect(() => {
    if (activeDetailItem && activeDetailItem.itemType === 'issue' && activeDetailItem.projectId) {
      getTasksByProjectAction(activeDetailItem.projectId).then((res) => {
        if (res.success && res.data) {
          setActiveProjectTasks(res.data);
        } else {
          setActiveProjectTasks([]);
        }
      });
    } else {
      setActiveProjectTasks([]);
    }
  }, [activeDetailItem]);

  // Load from Backend/LocalStorage
  useEffect(() => {
    async function loadProjects() {
      const res = await getProjectsAction();
      if (res.success && res.data) {
        setProjects(res.data);
        
        // Fetch issues for all loaded projects
        const issuesPromises = res.data.map((p: any) => getIssuesByProjectAction(p.id));
        const results = await Promise.all(issuesPromises);
        const allIssues: Issue[] = [];
        results.forEach(r => {
          if (r.success && r.data) {
            allIssues.push(...r.data);
          }
        });
        setIssues(allIssues);
      } else {
        const storedProjects = localStorage.getItem('pwt_projects');
        if (storedProjects) {
          try {
            const parsed = JSON.parse(storedProjects);
            if (parsed.length > 0) {
              setProjects(parsed);
            }
          } catch (e) {
            console.error(e);
          }
        }

        const storedIssues = localStorage.getItem('pwt_issues');
        if (storedIssues) {
          try {
            setIssues(JSON.parse(storedIssues));
          } catch (e) {
            console.error(e);
          }
        } else {
          setIssues(fallbackIssues);
        }
      }
    }

    async function loadEmployees() {
      const res = await getEmployeesAction();
      if (res.success && res.data) {
        setAvailableMembers(res.data.filter(e => e.role?.toLowerCase() !== 'admin'));
      } else {
        setAvailableMembers(
          [
            { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
            { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
            { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
            { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
          ].map((m, i) => ({
            id: String(i + 1),
            name: m.name,
            initials: m.initials,
            bg: m.bg,
            email: '',
            role: 'Employee'
          }))
        );
      }
    }

    loadProjects();
    loadEmployees();
  }, []);

  const saveIssues = (updatedIssues: Issue[]) => {
    setIssues(updatedIssues);
    localStorage.setItem('pwt_issues', JSON.stringify(updatedIssues));
  };

  const handleIssueSuccess = async () => {
    const issuesPromises = projects.map((p: any) => getIssuesByProjectAction(p.id));
    const results = await Promise.all(issuesPromises);
    const allIssues: Issue[] = [];
    results.forEach(r => {
      if (r.success && r.data) {
        allIssues.push(...(r.data as Issue[]));
      }
    });
    setIssues(allIssues);
  };

  const handleDeleteIssue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIssueToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteIssue = async () => {
    if (!issueToDeleteId) return;
    const id = issueToDeleteId;
    setIsDeleteConfirmOpen(false);
    setIssueToDeleteId(null);

    const res = await deleteIssueAction(id);
    if (res.success) {
      setIssues(prev => prev.filter(iss => iss.id !== id));
    } else {
      console.error('Failed to delete issue on backend:', res.error);
      const updated = issues.filter(iss => iss.id !== id);
      saveIssues(updated);
    }
  };

  const handleToggleStatus = async (issue: Issue, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: Issue['status'] = issue.status === 'Resolved' ? 'Open' : 'Resolved';
    
    // Optimistic UI update
    setIssues(prev => prev.map(iss => iss.id === issue.id ? { ...iss, status: nextStatus } : iss));

    const res = await updateIssueAction(issue.id, { status: nextStatus });
    if (res.success && res.data) {
      setIssues(prev => prev.map(iss => iss.id === issue.id ? (res.data as any) : iss));
    } else {
      console.error('Failed to update issue status on backend:', res.error);
      const updated = issues.map(iss => iss.id === issue.id ? { ...iss, status: nextStatus } : iss);
      saveIssues(updated);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    if (isClient) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Issue['status']) => {
    e.preventDefault();
    if (isClient) return;
    const issueId = e.dataTransfer.getData('text/plain');
    if (!issueId) return;

    const targetIssue = issues.find(i => i.id === issueId);
    if (targetIssue && targetIssue.status !== targetStatus) {
      // Optimistic update
      setIssues(prev => prev.map(iss => iss.id === issueId ? { ...iss, status: targetStatus } : iss));

      const res = await updateIssueAction(issueId, { status: targetStatus });
      if (res.success && res.data) {
        setIssues(prev => prev.map(iss => iss.id === issueId ? (res.data as any) : iss));
      } else {
        console.error('Failed to update issue status on backend:', res.error);
        const updated = issues.map(iss => iss.id === issueId ? { ...iss, status: targetStatus } : iss);
        saveIssues(updated);
      }
    }
  };

  // Open card details drawer
  const handleCardClick = (issue: Issue) => {
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
      comments: issue.comments || [],
      relatedTaskId: (issue as any).relatedTaskId || '',
      relatedTaskTitle: (issue as any).relatedTaskTitle || '',
      attachments: (issue as any).attachments || [],
      projectId: issue.projectId,
      itemType: 'issue'
    });
  };

  const handleUpdateRelatedTask = async (newTaskId: string) => {
    if (!activeDetailItem) return;
    const task = activeProjectTasks.find(t => t.id === newTaskId);
    const newTitle = task ? task.title : '';
    
    const res = await updateIssueAction(activeDetailItem.id, {
      relatedTaskId: newTaskId || null as any,
      relatedTaskTitle: newTitle || null as any
    });
    
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, relatedTaskId: newTaskId, relatedTaskTitle: newTitle } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
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
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, attachments: nextAttachments } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
    }
    setUploadingImage(false);
  };

  const handleRemoveAttachment = async (urlToRemove: string) => {
    if (!activeDetailItem) return;
    const nextAttachments = (activeDetailItem.attachments || []).filter((url: string) => url !== urlToRemove);

    const res = await updateIssueAction(activeDetailItem.id, { attachments: nextAttachments });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, attachments: nextAttachments } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, attachments: nextAttachments } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, attachments: nextAttachments } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
    }
  };

  const handleLogHours = async (hours: number) => {
    if (!activeDetailItem || hours <= 0) return false;
    const res = await updateIssueAction(activeDetailItem.id, { newWorkLog: { hours } });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: res.data!.actualHours, workLogs: res.data!.workLogs } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, actualHours: res.data!.actualHours, workLogs: res.data!.workLogs } : i));
      return true;
    }
    return false;
  };

  const handleUpdateStatus = async (newStatus: Issue['status']) => {
    if (!activeDetailItem) return;
    const res = await updateIssueAction(activeDetailItem.id, { status: newStatus });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, status: newStatus } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, status: newStatus } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, status: newStatus } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, status: newStatus } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
    }
  };

  const handleUpdatePriority = async (newPriority: Issue['priority']) => {
    if (!activeDetailItem) return;
    const res = await updateIssueAction(activeDetailItem.id, { priority: newPriority });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, priority: newPriority } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, priority: newPriority } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, priority: newPriority } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, priority: newPriority } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
    }
  };

  const handleUpdateType = async (newType: Issue['type']) => {
    if (!activeDetailItem) return;
    const res = await updateIssueAction(activeDetailItem.id, { type: newType });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, type: newType } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, type: newType } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, type: newType } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, type: newType } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
    }
  };

  const handleUpdateTargetDate = async (newVal: string) => {
    if (!activeDetailItem) return;
    const valueToSave = newVal || 'No Due Date';
    const res = await updateIssueAction(activeDetailItem.id, { dueDate: valueToSave });
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, dueDate: valueToSave } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, dueDate: valueToSave } : i));
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, dueDate: valueToSave } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, dueDate: valueToSave } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
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

    // Optimistically update
    setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments, commentsCount: nextComments.length } : null);
    setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, comments: nextComments, commentsCount: nextComments.length } : i));
    setNewCommentText('');

    const res = await updateIssueAction(activeDetailItem.id, { comments: nextComments });
    if (res.success && res.data) {
      const updatedData = res.data;
      setActiveDetailItem((prev: any) => prev ? { ...prev, ...updatedData, comments: updatedData.comments || nextComments } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? (updatedData as any) : i));
    } else {
      console.error('Failed to update issue comments on backend:', res.error);
    }
  };

  const handleDeleteActiveItem = async () => {
    if (!activeDetailItem) return;
    if (confirm(`Are you sure you want to delete this issue?`)) {
      const res = await deleteIssueAction(activeDetailItem.id);
      if (res.success) {
        setIssues(prev => prev.filter(i => i.id !== activeDetailItem.id));
        setActiveDetailItem(null);
      } else {
        const updated = issues.filter(i => i.id !== activeDetailItem.id);
        setIssues(updated);
        localStorage.setItem('pwt_issues', JSON.stringify(updated));
        setActiveDetailItem(null);
      }
    }
  };

  const isEmployeeRole = user?.role === 'Employee';
  const isClientRole = user?.role === 'Client';

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

  const clientProjectIds = new Set(
    projects
      .filter(p => (p as any).members?.some((m: any) => {
        const mName = m.name;
        const mId = m.userId || m.id;
        return (mName && user?.name && mName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
               (mId && user?.id && String(mId) === String(user.id));
      }))
      .map(p => p.id)
  );

  // Filter Issues
  const filteredIssues = issues.filter(iss => {
    if (isEmployeeRole && !isAssignedToUser(iss)) {
      return false;
    }
    if (isClientRole && clientProjectIds.size > 0 && iss.projectId && !clientProjectIds.has(iss.projectId)) {
      return false;
    }

    const matchesSearch = iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'All' || iss.projectId === projectFilter;
    const matchesPriority = priorityFilter === 'All' || iss.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || iss.status === statusFilter;

    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  // Calculate statistics
  const totalCount = filteredIssues.length;
  const criticalCount = filteredIssues.filter(iss => iss.priority === 'Critical').length;
  const inProgressCount = filteredIssues.filter(iss => iss.status === 'In Progress').length;
  const resolvedCount = filteredIssues.filter(iss => iss.status === 'Resolved' || iss.status === 'Closed').length;

  return {
    user,
    isClient,
    canDeleteIssue,
    canEditHours,
    issues,
    projects,
    availableMembers,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    activeTab,
    setActiveTab,
    modalStatus,
    setModalStatus,
    isModalOpen,
    setIsModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    issueToDeleteId,
    setIssueToDeleteId,
    activeDetailItem,
    setActiveDetailItem,
    newCommentText,
    setNewCommentText,
    activeProjectTasks,
    uploadingImage,
    handleIssueSuccess,
    handleDeleteIssue,
    confirmDeleteIssue,
    handleToggleStatus,
    handleDragStart,
    handleDrop,
    handleCardClick,
    handleUpdateRelatedTask,
    handleAddAttachment,
    handleRemoveAttachment,
    handleLogHours,
    handleUpdateStatus,
    handleUpdatePriority,
    handleUpdateType,
    handleUpdateTargetDate,
    handleAddComment,
    handleDeleteActiveItem,
    filteredIssues,
    totalCount,
    criticalCount,
    inProgressCount,
    resolvedCount
  };
}
