import { useState, useEffect } from 'react';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import type { Employee } from '@/types/projects.types';
import { getAllTasksAction, createTaskAction, updateTaskAction, deleteTaskAction } from '@/actions/tasks';
import type { Task, GlobalTask } from '@/types/tasks.types';

export interface Member {
  userId?: string;
  id?: string;
  name: string;
  initials: string;
  bg: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'In Review';
  progress: number;
  tags: string[];
  tasksCount: number;
  completedTasks: number;
  commentsCount: number;
  attachmentsCount: number;
  dueDate: string;
  members: Member[];
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
  startDate?: string;
  targetQuarter?: 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Future';
}

const defaultMembers: Member[] = [
  { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
  { name: 'Oliver Twist', initials: 'OT', bg: 'bg-amber-500' },
];

const fallbackTasks: Record<string, Task[]> = {
  '1': [
    {
      id: 't1',
      title: 'Analyze user drop-off logs',
      description: 'Review the Mixpanel and Datadog logs to find which step in signup has the highest drop-off rate.',
      status: 'Done',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-06',
      assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }],
      subtasks: [
        { id: 's1', title: 'Export CSV of funnel statistics', completed: true },
        { id: 's2', title: 'Identify core drop-off screens', completed: true },
      ],
      comments: [
        { id: 'c1', author: 'John Doe', initials: 'JD', text: 'Seems like the password validation rule screen causes 25% dropouts.', time: '2 days ago' },
      ],
      attachmentsCount: 2,
    },
    {
      id: 't2',
      title: 'Create low-fidelity wireframes',
      description: 'Draft initial paper/Figma wireframes focusing on clean, single-input onboarding screens.',
      status: 'In Progress',
      priority: 'Medium',
      startDate: '2026-07-06',
      dueDate: '2026-07-12',
      assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }],
      subtasks: [
        { id: 's3', title: 'Design step-1 wireframe', completed: true },
        { id: 's4', title: 'Design step-2 personalization wireframe', completed: false },
      ],
      comments: [],
      attachmentsCount: 1,
    },
    {
      id: 't3',
      title: 'Draft copy recommendations',
      description: 'Rewrite validation messages and help bubbles to be friendlier and clearer.',
      status: 'To Do',
      priority: 'Low',
      startDate: '2026-07-14',
      dueDate: '2026-07-20',
      assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }],
      subtasks: [],
      comments: [],
      attachmentsCount: 0,
    }
  ],
  '2': [
    {
      id: 't6',
      title: 'Review JWT signing algorithm',
      description: 'Evaluate HMAC vs RS256 signing for multi-region protected API workloads.',
      status: 'Done',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-04',
      assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }],
      subtasks: [],
      comments: [],
      attachmentsCount: 1,
    },
    {
      id: 't7',
      title: 'Write custom JWT verify middleware',
      description: 'Develop Next.js edge-compatible auth middleware parsing headers and validating sessions.',
      status: 'In Progress',
      priority: 'Urgent',
      startDate: '2026-07-05',
      dueDate: '2026-07-12',
      assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }],
      subtasks: [
        { id: 's12', title: 'Write token parser utils', completed: true },
      ],
      comments: [],
      attachmentsCount: 0,
    }
  ]
};

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
        setAvailableMembers(
          defaultMembers.map((m, i) => ({
            id: String(i + 1),
            name: m.name,
            initials: m.initials,
            bg: m.bg,
            email: '',
            role: 'Employee'
          }))
        );
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
          } else {
            projTasks = fallbackTasks[proj.id] || [];
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
          name: availableMembers[0]?.name || defaultMembers[0].name,
          initials: availableMembers[0]?.initials || defaultMembers[0].initials,
          bg: availableMembers[0]?.bg || defaultMembers[0].bg,
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
