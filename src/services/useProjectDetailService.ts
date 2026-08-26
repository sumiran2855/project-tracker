import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectByIdAction, updateProjectAction, getEmployeesAction } from '@/actions/projects';
import { getTasksByProjectAction, createTaskAction, updateTaskAction, deleteTaskAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';
import type { Employee, Project } from '@/types/projects.types';
import type { Task, Subtask, Comment } from '@/types/tasks.types';

export function useProjectDetailService() {
  const { user } = useUser();
  const canCreateTask = usePermission('task:create');
  const canDeleteTask = usePermission('task:delete');

  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Employee[]>([]);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  
  const isEmployee = user?.role?.toLowerCase() === 'employee';
  const isClient = user?.role?.toLowerCase() === 'client';
  const canEditHours = user?.role?.toLowerCase() === 'team lead' || user?.role?.toLowerCase() === 'employee';

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

  const displayTasks = isEmployee
    ? tasks.filter(t => isAssignedToUser(t))
    : tasks;

  const parseHoursFromBudget = (budgetVal: string | undefined): number => {
    if (!budgetVal) return 0;
    if (budgetVal.includes('$')) return 0;
    const matches = budgetVal.match(/(\d+)\s*(h|hour|hours|hrs|hr)?/i);
    if (matches) {
      return parseInt(matches[1], 10);
    }
    const num = parseInt(budgetVal.trim(), 10);
    if (!isNaN(num)) {
      return num;
    }
    return 0;
  };

  const projectBudgetHours = project ? parseHoursFromBudget(project.budget) : 0;
  const tasksLoggedHours = tasks.reduce((sum, t) => {
    const logsSum = (t.workLogs || []).reduce((acc: number, log: any) => acc + (Number(log.hours) || 0), 0);
    return sum + logsSum;
  }, 0);
  const issuesLoggedHours = issues.reduce((sum, i) => {
    const logsSum = (i.workLogs || []).reduce((acc: number, log: any) => acc + (Number(log.hours) || 0), 0);
    return sum + logsSum;
  }, 0);
  const totalLoggedProjectHours = tasksLoggedHours + issuesLoggedHours;
  const remainingProjectHours = Math.max(0, projectBudgetHours - totalLoggedProjectHours);

  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'timeline'>('kanban');

  // Task Dialog States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('To Do');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);

  useEffect(() => {
    if (isTaskModalOpen) {
      if (user && user.name && isEmployee) {
        setNewTaskAssignees([user.name]);
      } else {
        setNewTaskAssignees([]);
      }
    }
  }, [isTaskModalOpen, user, isEmployee]);

  // Task spent hours modal states
  const [hoursPromptOpen, setHoursPromptOpen] = useState(false);
  const [promptTask, setPromptTask] = useState<{ taskId: string; targetStatus: Task['status'] } | null>(null);
  const [promptValue, setPromptValue] = useState('0');

  // Task Drawer/Detail Drawer States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Initial Load function
  const loadProject = async () => {
    const res = await getProjectByIdAction(projectId);
    if (res.success && res.data) {
      setProject(res.data as any);
    } else {
      const storedProjects = localStorage.getItem('pwt_projects');
      let currentProj: Project | null = null;

      if (storedProjects) {
        try {
          const list: Project[] = JSON.parse(storedProjects);
          currentProj = list.find(p => p.id === projectId) || null;
        } catch (e) {
          console.error(e);
        }
      }

      if (!currentProj) {
        currentProj = {
          id: projectId,
          name: `Project Workspace #${projectId}`,
          description: 'No detailed description found. Start organizing your team tasks.',
          status: 'Planning',
          progress: 0,
          tags: ['Initiative'],
          tasksCount: 0,
          completedTasks: 0,
          commentsCount: 0,
          attachmentsCount: 0,
          dueDate: 'No Due Date',
          members: user ? [{ name: user.name || '', initials: user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '', bg: 'bg-indigo-500' }] : [],
        };
      }
      setProject(currentProj);
    }
  };

  // Initial Load from Backend/LocalStorage
  useEffect(() => {
    async function loadTasks() {
      const res = await getTasksByProjectAction(projectId);
      if (res.success && res.data) {
        setTasks(res.data as any);
      } else {
        const storedTasks = localStorage.getItem(`pwt_tasks_project_${projectId}`);
        if (storedTasks) {
          try {
            setTasks(JSON.parse(storedTasks));
          } catch (e) {
            console.error(e);
          }
        } else {
          const seed: Task[] = [];
          setTasks(seed);
        }
      }
    }

    async function loadEmployees() {
      const res = await getEmployeesAction();
      if (res.success && res.data) {
        setAvailableMembers(res.data.filter(e => e.role?.toLowerCase() !== 'admin'));
      } else {
        setAvailableMembers([]);
      }
    }

    async function loadIssues() {
      const res = await getIssuesByProjectAction(projectId);
      if (res.success && res.data) {
        setIssues(res.data);
      }
    }

    loadProject();
    loadTasks();
    loadEmployees();
    loadIssues();
  }, [projectId]);

  // Sync state helpers
  const updateProjectOnBackend = async (updatedProj: Project) => {
    const res = await updateProjectAction(projectId, updatedProj);
    if (!res.success) {
      console.error('Failed to update project on backend:', res.error);
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(`pwt_tasks_project_${projectId}`, JSON.stringify(updatedTasks));

    // Update main project progress and count
    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.status === 'Done').length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (project) {
      const updatedProj: Project = {
        ...project,
        tasksCount: total,
        completedTasks: completed,
        progress: progressPercent
      };
      setProject(updatedProj);
      updateProjectOnBackend(updatedProj);

      const storedProjects = localStorage.getItem('pwt_projects');
      if (storedProjects) {
        try {
          const list: Project[] = JSON.parse(storedProjects);
          const index = list.findIndex(p => p.id === projectId);
          if (index !== -1) {
            list[index] = updatedProj;
          } else {
            list.push(updatedProj);
          }
          localStorage.setItem('pwt_projects', JSON.stringify(list));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleUpdateProjectStatus = async (newStatus: Project['status']) => {
    if (!project) return;
    const updatedProj: Project = { ...project, status: newStatus };
    setProject(updatedProj);
    updateProjectOnBackend(updatedProj);

    const storedProjects = localStorage.getItem('pwt_projects');
    if (storedProjects) {
      try {
        const list: Project[] = JSON.parse(storedProjects);
        const index = list.findIndex(p => p.id === projectId);
        if (index !== -1) {
          list[index] = updatedProj;
          localStorage.setItem('pwt_projects', JSON.stringify(list));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (isClient) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (isClient) return;
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    handleMoveTask(taskId, targetStatus);
  };

  const handleMoveTask = async (taskId: string, targetStatus: Task['status']) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    if (targetStatus === 'Done' && taskToMove.status !== 'Done' && canEditHours) {
      setPromptTask({ taskId, targetStatus });
      setPromptValue(String(taskToMove.actualHours || 0));
      setHoursPromptOpen(true);
    } else {
      await submitMoveTask(taskId, targetStatus, 0);
    }
  };

  const submitMoveTask = async (taskId: string, targetStatus: Task['status'], hoursInput: number) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    const newActualHours = (taskToMove.actualHours || 0) + (hoursInput > 0 ? hoursInput : 0);
    const updatedTask = { ...taskToMove, status: targetStatus, actualHours: newActualHours };

    // Update locally first for visual speed
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updatedTask);
    }

    const payload: any = { status: targetStatus };
    if (hoursInput > 0) {
      payload.newWorkLog = { hours: hoursInput };
    }
    const res = await updateTaskAction(taskId, payload);
    if (res.success && res.data) {
      const nextTasks = tasks.map(t => t.id === taskId ? (res.data as any) : t);
      saveTasks(nextTasks);
      if (selectedTask?.id === taskId) {
        setSelectedTask(res.data as any);
      }

      if (project && taskToMove.status !== targetStatus) {
        const wasCompleted = taskToMove.status === 'Done';
        const isNowCompleted = targetStatus === 'Done';
        const newCompleted = project.completedTasks + (isNowCompleted ? 1 : 0) - (wasCompleted ? 1 : 0);
        setProject({
          ...project,
          completedTasks: newCompleted,
          progress: project.tasksCount > 0 ? Math.round((newCompleted / project.tasksCount) * 100) : 0
        });
      }
    } else {
      console.error('Failed to move task on backend:', res.error);
      const updated = tasks.map(t => t.id === taskId ? updatedTask : t);
      saveTasks(updated);
    }
  };

  // Add Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignees = newTaskAssignees.map(name => {
      const m = availableMembers.find(am => am.name === name);
      if (m) {
        return {
          id: m.id,
          name: m.name,
          initials: m.initials,
          bg: m.bg
        };
      }
      if (user && user.name && name === user.name) {
        return {
          id: user.id || '',
          name: user.name,
          initials: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          bg: 'bg-indigo-500'
        };
      }
      return null;
    }).filter((x): x is { id: string; name: string; initials: string; bg: string; } => x !== null);

    let finalAssignees = assignees;
    if (finalAssignees.length === 0) {
      if (user && user.name && isEmployee) {
        finalAssignees = [{
          id: user.id || '',
          name: user.name,
          initials: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          bg: 'bg-indigo-500'
        }];
      } else {
        finalAssignees = [{
          id: availableMembers[0]?.id || '1',
          name: availableMembers[0]?.name || user?.name || '',
          initials: availableMembers[0]?.initials || user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '',
          bg: availableMembers[0]?.bg || 'bg-indigo-500',
        }];
      }
    }

    const newTaskData = {
      title: newTaskTitle,
      description: newTaskDesc,
      status: newTaskStatus,
      priority: newTaskPriority,
      startDate: newTaskStartDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignees: finalAssignees,
      projectId: projectId,
      subtasks: [],
      comments: [],
    };

    const res = await createTaskAction(newTaskData);
    if (res.success && res.data) {
      setTasks(prev => [res.data as any, ...prev]);

      if (project) {
        const newCount = project.tasksCount + 1;
        const newCompleted = project.completedTasks + (newTaskStatus === 'Done' ? 1 : 0);
        setProject({
          ...project,
          tasksCount: newCount,
          completedTasks: newCompleted,
          progress: newCount > 0 ? Math.round((newCompleted / newCount) * 100) : 0
        });
      }
    } else {
      console.error('Failed to create task on backend:', res.error);
      const fallbackTask: Task = {
        id: `task_${Date.now()}`,
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        priority: newTaskPriority,
        startDate: newTaskStartDate || new Date().toISOString().split('T')[0],
        dueDate: newTaskDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignees: finalAssignees,
        subtasks: [],
        comments: [],
        attachmentsCount: 0,
      };
      saveTasks([fallbackTask, ...tasks]);
    }

    // Reset fields
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskStatus('To Do');
    setNewTaskPriority('Medium');
    setNewTaskStartDate('');
    setNewTaskDueDate('');
    setNewTaskAssignees([]);
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      const res = await deleteTaskAction(taskId);
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setSelectedTask(null);

        if (project) {
          const newCount = project.tasksCount - 1;
          const newCompleted = project.completedTasks - (taskToDelete.status === 'Done' ? 1 : 0);
          setProject({
            ...project,
            tasksCount: newCount,
            completedTasks: newCompleted,
            progress: newCount > 0 ? Math.round((newCompleted / newCount) * 100) : 0
          });
        }
      } else {
        console.error('Failed to delete task on backend:', res.error);
        const updated = tasks.filter(t => t.id !== taskId);
        saveTasks(updated);
        setSelectedTask(null);
      }
    }
  };

  // Subtasks actions
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      id: `sub_${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
    };

    const newSubtasks = [...selectedTask.subtasks, newSub];
    const updatedTask = {
      ...selectedTask,
      subtasks: newSubtasks,
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setNewSubtaskTitle('');

    const res = await updateTaskAction(selectedTask.id, { subtasks: newSubtasks });
    if (res.success && res.data) {
      const dbTask = res.data as any;
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? dbTask : t));
      setSelectedTask(dbTask);
    } else {
      console.error('Failed to add subtask on backend:', res.error);
    }
  };

  const handleToggleSubtask = async (subId: string) => {
    if (!selectedTask) return;

    const updatedSubtasks = selectedTask.subtasks.map(s => {
      if (s.id === subId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    const updatedTask = {
      ...selectedTask,
      subtasks: updatedSubtasks,
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);

    const res = await updateTaskAction(selectedTask.id, { subtasks: updatedSubtasks });
    if (res.success && res.data) {
      const dbTask = res.data as any;
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? dbTask : t));
      setSelectedTask(dbTask);
    } else {
      console.error('Failed to toggle subtask on backend:', res.error);
    }
  };

  const handleDeleteSubtask = async (subId: string) => {
    if (!selectedTask) return;

    const updatedSubtasks = selectedTask.subtasks.filter(s => s.id !== subId);

    const updatedTask = {
      ...selectedTask,
      subtasks: updatedSubtasks,
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);

    const res = await updateTaskAction(selectedTask.id, { subtasks: updatedSubtasks });
    if (res.success && res.data) {
      const dbTask = res.data as any;
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? dbTask : t));
      setSelectedTask(dbTask);
    } else {
      console.error('Failed to delete subtask on backend:', res.error);
    }
  };

  // Comments Actions
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      author: user?.name || 'Dev User',
      initials: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'DU',
      text: newCommentText,
      time: new Date().toISOString(),
    };

    const updatedComments = [newComment, ...selectedTask.comments];
    const updatedTask = {
      ...selectedTask,
      comments: updatedComments,
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setNewCommentText('');

    const res = await updateTaskAction(selectedTask.id, { comments: updatedComments });
    if (res.success && res.data) {
      const dbTask = res.data as any;
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? dbTask : t));
      setSelectedTask(dbTask);
    } else {
      console.error('Failed to add comment on backend:', res.error);
    }
  };

  const getPriorityColor = (prio: Task['priority'] | Project['priority'] | undefined) => {
    if (!prio) return 'bg-slate-50 text-slate-655 border-slate-200/50';
    switch (prio) {
      case 'Urgent':
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-655 border-slate-200/50';
    }
  };

  const getProjectStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border border-amber-250';
      case 'Planning':
        return 'bg-blue-50 text-blue-700 border border-blue-250';
      default:
        return 'bg-indigo-50 text-indigo-700 border border-indigo-250';
    }
  };

  useEffect(() => {
    if (!projectId || typeof window === 'undefined') return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    if (!pusherKey) {
      console.warn('[Pusher] Client warning: NEXT_PUBLIC_PUSHER_KEY is not defined in .env.');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channelName = `project-${projectId}`;
    console.log(`[Pusher] Subscribing to channel: ${channelName}`);
    const channel = pusher.subscribe(channelName);

    channel.bind('task-created', (data: { task: Task }) => {
      console.log('[Pusher] task-created received:', data.task);
      setTasks(prev => {
        if (prev.some(t => t.id === data.task.id)) return prev;
        return [data.task, ...prev];
      });
    });

    channel.bind('task-updated', (data: { taskId: string; task: Task }) => {
      console.log('[Pusher] task-updated received:', data.taskId);
      setTasks(prev => prev.map(t => t.id === data.taskId ? data.task : t));
      
      setSelectedTask(prevSelected => {
        if (prevSelected && prevSelected.id === data.taskId) {
          return data.task;
        }
        return prevSelected;
      });
    });

    channel.bind('task-deleted', (data: { taskId: string }) => {
      console.log('[Pusher] task-deleted received:', data.taskId);
      setTasks(prev => prev.filter(t => t.id !== data.taskId));
      setSelectedTask(prevSelected => {
        if (prevSelected && prevSelected.id === data.taskId) {
          return null;
        }
        return prevSelected;
      });
    });

    return () => {
      console.log(`[Pusher] Unsubscribing from channel: ${channelName}`);
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [projectId]);

  return {
    user,
    projectId,
    router,
    project,
    setProject,
    tasks,
    displayTasks,
    isEmployee,
    isClient,
    canCreateTask,
    canDeleteTask,
    canEditHours,
    projectBudgetHours,
    totalLoggedProjectHours,
    remainingProjectHours,
    activeTab,
    setActiveTab,
    isTaskModalOpen,
    setIsTaskModalOpen,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDesc,
    setNewTaskDesc,
    newTaskStatus,
    setNewTaskStatus,
    newTaskPriority,
    setNewTaskPriority,
    newTaskStartDate,
    setNewTaskStartDate,
    newTaskDueDate,
    setNewTaskDueDate,
    newTaskAssignees,
    setNewTaskAssignees,
    hoursPromptOpen,
    setHoursPromptOpen,
    promptTask,
    setPromptTask,
    promptValue,
    setPromptValue,
    selectedTask,
    setSelectedTask,
    newSubtaskTitle,
    setNewSubtaskTitle,
    newCommentText,
    setNewCommentText,
    availableMembers,
    isEditProjectModalOpen,
    setIsEditProjectModalOpen,
    loadProject,
    saveTasks,
    handleUpdateProjectStatus,
    handleDragStart,
    handleDrop,
    handleMoveTask,
    submitMoveTask,
    handleCreateTask,
    handleDeleteTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
    handleAddComment,
    getPriorityColor,
    getProjectStatusBadge
  };
}
