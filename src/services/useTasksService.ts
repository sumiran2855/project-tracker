import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import type { Employee, Project } from '@/types/projects.types';
import { getAllTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from '@/actions/tasks';
import type { Task, GlobalTask } from '@/types/tasks.types';

export function useTasksService() {
  const { user } = useUser();
  const canCreateTask = usePermission('task:create');
  const canDeleteTask = usePermission('task:delete');

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Employee[]>([]);

  const isEmployee = user?.role?.toLowerCase() === 'employee';
  const isClient = user?.role?.toLowerCase() === 'client';
  const canEditHours = user?.role?.toLowerCase() === 'team lead' || user?.role?.toLowerCase() === 'employee';

  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'calendar'>('board');
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => new Date(2026, 6, 1));

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Task Drawer States
  const [selectedTask, setSelectedTask] = useState<GlobalTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Task spent hours modal states
  const [hoursPromptOpen, setHoursPromptOpen] = useState(false);
  const [promptTask, setPromptTask] = useState<GlobalTask | null>(null);
  const [promptValue, setPromptValue] = useState('0');

  // Add Task Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
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

  const isAssignedToUser = (task: GlobalTask) => {
    if (!user) return false;
    const assignees = Array.isArray(task.assignees) ? task.assignees : [];
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
      .filter(p => (p.members || []).some((m: any) => {
        const mName = m.name;
        const mId = m.userId || m.id;
        return (mName && user?.name && mName.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
          (mId && user?.id && String(mId) === String(user.id));
      }))
      .map(p => p.id)
  );

  const displayTasks = tasks.filter(t => {
    if (isEmployee) {
      return isAssignedToUser(t);
    }
    if (isClient && clientProjectIds.size > 0 && t.projectId) {
      return clientProjectIds.has(t.projectId);
    }
    return true;
  });

  // Load projects and compile tasks
  useEffect(() => {
    async function loadData() {
      // 1. Load projects
      const projRes = await getProjectsAction();
      let loadedProjects: Project[] = [];
      if (projRes.success && projRes.data) {
        loadedProjects = projRes.data as any[];
        setProjects(loadedProjects);
        localStorage.setItem('pwt_projects', JSON.stringify(loadedProjects));
      } else {
        const storedProjects = localStorage.getItem('pwt_projects');
        if (storedProjects) {
          try {
            loadedProjects = JSON.parse(storedProjects);
          } catch (e) {
            console.error(e);
          }
        }
        setProjects(loadedProjects);
      }

      // 2. Load employees
      const empRes = await getEmployeesAction();
      if (empRes.success && empRes.data) {
        setAvailableMembers(empRes.data.filter(e => e.role?.toLowerCase() !== 'admin'));
      } else {
        setAvailableMembers([]);
      }

      // 3. Load all tasks in 1 single call
      const tasksRes = await getAllTasksAction();
      if (tasksRes.success && tasksRes.data && tasksRes.data.length > 0) {
        const mappedTasks: GlobalTask[] = tasksRes.data.map(task => {
          const proj = loadedProjects.find(p => p.id === task.projectId);
          return {
            ...task,
            projectId: task.projectId || proj?.id || '',
            projectName: task.projectName || proj?.name || 'Workspace Project'
          };
        });
        setTasks(mappedTasks);
      } else {
        // Fallback to per-project localStorage
        const allFallbackTasks: GlobalTask[] = [];
        loadedProjects.forEach(proj => {
          const storedTasksKey = `pwt_tasks_project_${proj.id}`;
          const storedTasksStr = localStorage.getItem(storedTasksKey);
          let projTasks: Task[] = [];
          if (storedTasksStr) {
            try {
              projTasks = JSON.parse(storedTasksStr);
            } catch (e) {
              console.error(e);
            }
          }
          allFallbackTasks.push(...projTasks.map(t => ({
            ...t,
            projectId: proj.id,
            projectName: proj.name
          })));
        });
        setTasks(allFallbackTasks);
      }
    }

    loadData();
  }, []);

  const saveAllTasks = (updatedGlobalTasks: GlobalTask[]) => {
    setTasks(updatedGlobalTasks);

    // Group tasks by project to save back
    const tasksByProject: Record<string, Task[]> = {};
    projects.forEach(p => {
      tasksByProject[p.id] = [];
    });

    updatedGlobalTasks.forEach(globalTask => {
      const { projectId, projectName, ...originalTask } = globalTask;
      if (tasksByProject[projectId]) {
        tasksByProject[projectId].push(originalTask);
      } else {
        tasksByProject[projectId] = [originalTask];
      }
    });

    // Save each list back to its local project storage and update project metrics
    const updatedProjects = [...projects];
    Object.keys(tasksByProject).forEach(projId => {
      const projectTasks = tasksByProject[projId];
      localStorage.setItem(`pwt_tasks_project_${projId}`, JSON.stringify(projectTasks));

      // Update project statistics in local state
      const projIdx = updatedProjects.findIndex(p => p.id === projId);
      if (projIdx !== -1) {
        const total = projectTasks.length;
        const completed = projectTasks.filter(t => t.status === 'Done').length;
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        updatedProjects[projIdx] = {
          ...updatedProjects[projIdx],
          tasksCount: total,
          completedTasks: completed,
          progress: progressPercent
        };
      }
    });

    setProjects(updatedProjects);
    localStorage.setItem('pwt_projects', JSON.stringify(updatedProjects));
  };

  const handleUpdateTask = async (updatedTask: GlobalTask) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    if (updatedTask.status === 'Done' && oldTask && oldTask.status !== 'Done') {
      setPromptTask(updatedTask);
      setPromptValue(String(oldTask.actualHours || 0));
      setHoursPromptOpen(true);
    } else {
      await submitUpdateTask(updatedTask, 0, false);
    }
  };

  const submitUpdateTask = async (updatedTask: GlobalTask, hoursInput: number = 0, isAdditional: boolean = false) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    const { projectId, projectName, id, ...taskFields } = updatedTask;

    const mappedAssignees = updatedTask.assignees.map(a => ({
      userId: a.userId || a.id,
      name: a.name,
      initials: a.initials,
      bg: a.bg
    }));

    let payload: any = {
      ...taskFields,
      assignees: mappedAssignees as any,
    };

    // Enforce derived total and prevent direct updates
    delete payload.actualHours;
    delete payload.workLogs;

    if (isAdditional && hoursInput > 0) {
      payload.newWorkLog = { hours: hoursInput };
    }

    const res = await updateTaskAction(id, payload);

    if (res.success && res.data) {
      const newGlobalTask: GlobalTask = {
        ...res.data,
        projectId,
        projectName,
      };
      saveAllTasks(tasks.map(t => t.id === id ? newGlobalTask : t));
      if (selectedTask?.id === id) {
        setSelectedTask(newGlobalTask);
      }

      // Update projects counters locally
      const oldTaskObj = tasks.find(t => t.id === id);
      if (oldTaskObj && oldTaskObj.status !== updatedTask.status) {
        setProjects(prevProjs => prevProjs.map(p => {
          if (p.id === projectId) {
            const wasCompleted = oldTaskObj.status === 'Done';
            const isNowCompleted = updatedTask.status === 'Done';
            const newCompleted = p.completedTasks + (isNowCompleted ? 1 : 0) - (wasCompleted ? 1 : 0);
            return {
              ...p,
              completedTasks: newCompleted,
              progress: p.tasksCount > 0 ? Math.round((newCompleted / p.tasksCount) * 100) : 0
            };
          }
          return p;
        }));
      }
    } else {
      console.error('Failed to update task on backend:', res.error);
      const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      saveAllTasks(updated);
      if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      const res = await deleteTaskAction(taskId);
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setSelectedTask(null);

        // Update projects counters locally
        setProjects(prevProjs => prevProjs.map(p => {
          if (p.id === taskToDelete.projectId) {
            const newCount = p.tasksCount - 1;
            const newCompleted = p.completedTasks - (taskToDelete.status === 'Done' ? 1 : 0);
            return {
              ...p,
              tasksCount: newCount,
              completedTasks: newCompleted,
              progress: newCount > 0 ? Math.round((newCompleted / newCount) * 100) : 0
            };
          }
          return p;
        }));
      } else {
        console.error('Failed to delete task on backend:', res.error);
        const updated = tasks.filter(t => t.id !== taskId);
        saveAllTasks(updated);
        setSelectedTask(null);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskProject) return;

    const targetProject = projects.find(p => p.id === newTaskProject);
    if (!targetProject) return;

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
      projectId: targetProject.id,
      subtasks: [],
      comments: [],
    };

    const res = await createTaskAction(newTaskData);
    if (res.success && res.data) {
      const createdTask: GlobalTask = {
        ...res.data,
        projectId: targetProject.id,
        projectName: targetProject.name,
      };
      setTasks(prev => [createdTask, ...prev]);

      // Update task counter on target project locally
      setProjects(prevProjs => prevProjs.map(p => {
        if (p.id === targetProject.id) {
          const newCount = p.tasksCount + 1;
          const newCompleted = p.completedTasks + (newTaskStatus === 'Done' ? 1 : 0);
          return {
            ...p,
            tasksCount: newCount,
            completedTasks: newCompleted,
            progress: newCount > 0 ? Math.round((newCompleted / newCount) * 100) : 0
          };
        }
        return p;
      }));
    } else {
      console.error('Failed to create task on backend:', res.error);
      const fallbackTask: GlobalTask = {
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
        projectId: targetProject.id,
        projectName: targetProject.name,
      };
      saveAllTasks([fallbackTask, ...tasks]);
    }

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskProject('');
    setNewTaskStatus('To Do');
    setNewTaskPriority('Medium');
    setNewTaskStartDate('');
    setNewTaskDueDate('');
    setNewTaskAssignees([]);
    setIsTaskModalOpen(false);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('pwt_update'));
  };

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

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      if (targetStatus === 'Done' && targetTask.status !== 'Done' && canEditHours) {
        setPromptTask({ ...targetTask, status: 'Done' });
        setPromptValue(String(targetTask.actualHours || 0));
        setHoursPromptOpen(true);
      } else {
        handleUpdateTask({ ...targetTask, status: targetStatus });
      }
    }
  };

  const filteredTasks = displayTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'All' || task.projectId === projectFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  const totalCount = filteredTasks.length;
  const pendingCount = filteredTasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress').length;
  const inReviewCount = filteredTasks.filter(t => t.status === 'In Review').length;
  const doneCount = filteredTasks.filter(t => t.status === 'Done').length;

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
        console.log('[Pusher] Global task-created received:', data.task);
        setTasks(prev => {
          if (prev.some(t => t.id === data.task.id)) return prev;

          const mappedTask = {
            ...data.task,
            projectId: data.task.projectId || project.id,
            projectName: data.task.projectName || project.name
          };
          return [mappedTask, ...prev];
        });
      });

      channel.bind('task-updated', (data: { taskId: string; task: any }) => {
        console.log('[Pusher] Global task-updated received:', data.taskId);
        setTasks(prev => prev.map(t => {
          if (t.id === data.taskId) {
            return {
              ...data.task,
              projectId: data.task.projectId || project.id,
              projectName: data.task.projectName || project.name
            };
          }
          return t;
        }));

        setSelectedTask(prevSelected => {
          if (prevSelected && prevSelected.id === data.taskId) {
            return {
              ...data.task,
              projectId: data.task.projectId || project.id,
              projectName: data.task.projectName || project.name
            };
          }
          return prevSelected;
        });
      });

      channel.bind('task-deleted', (data: { taskId: string }) => {
        console.log('[Pusher] Global task-deleted received:', data.taskId);
        setTasks(prev => prev.filter(t => t.id !== data.taskId));
        setSelectedTask(prevSelected => {
          if (prevSelected && prevSelected.id === data.taskId) {
            return null;
          }
          return prevSelected;
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
    canCreateTask,
    canDeleteTask,
    projects,
    tasks,
    availableMembers,
    isEmployee,
    isClient,
    canEditHours,
    activeTab,
    setActiveTab,
    currentCalendarDate,
    setCurrentCalendarDate,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    selectedTask,
    setSelectedTask,
    newSubtaskTitle,
    setNewSubtaskTitle,
    newCommentText,
    setNewCommentText,
    hoursPromptOpen,
    setHoursPromptOpen,
    promptTask,
    setPromptTask,
    promptValue,
    setPromptValue,
    isTaskModalOpen,
    setIsTaskModalOpen,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDesc,
    setNewTaskDesc,
    newTaskProject,
    setNewTaskProject,
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
    filteredTasks,
    totalCount,
    pendingCount,
    inProgressCount,
    inReviewCount,
    doneCount,
    handleUpdateTask,
    submitUpdateTask,
    handleDeleteTask,
    handleCreateTask,
    handleDragStart,
    handleDrop,
  };
}
