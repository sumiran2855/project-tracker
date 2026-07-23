'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
  ListTodo,
  Columns,
  Tornado,
  ChevronRight,
  Sparkles,
  Bookmark,
  ChevronDown,
  User,
  PlusCircle,
  X,
  CheckCircle2,
  CalendarDays,
  Link2,
  Terminal,
  Hash,
  Coins,
  ShieldAlert,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectByIdAction, updateProjectAction, getEmployeesAction, type Employee } from '@/actions/projects';
import { getTasksByProjectAction, createTaskAction, updateTaskAction, deleteTaskAction, type Task, type Subtask, type Comment } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';

// Types
export interface Member {
  userId?: string;
  id?: string;
  name: string;
  initials: string;
  bg: string;
}

interface Project {
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


const defaultProjects: Project[] = [];

// Seed Tasks per Project ID
const initialTasksData: Record<string, Task[]> = {
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
        { id: 'c2', author: 'Sarah Connor', initials: 'SC', text: 'Agreed, it requires too many special characters. Let us simplify it.', time: '1 day ago' },
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
      assignees: [{ name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' }, { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }],
      subtasks: [
        { id: 's3', title: 'Design step-1 wireframe', completed: true },
        { id: 's4', title: 'Design step-2 personalization wireframe', completed: false },
        { id: 's5', title: 'Design final dashboard preview screen', completed: false },
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
      subtasks: [
        { id: 's6', title: 'Draft welcoming headline options', completed: false },
      ],
      comments: [],
      attachmentsCount: 0,
    },
    {
      id: 't4',
      title: 'Setup onboarding AB test config',
      description: 'Prepare LaunchDarkly flags to swap between the legacy multi-step flow and the new simplified flow.',
      status: 'In Review',
      priority: 'High',
      startDate: '2026-07-08',
      dueDate: '2026-07-15',
      assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }],
      subtasks: [
        { id: 's7', title: 'Add feature flags to signup route', completed: true },
        { id: 's8', title: 'Verify event track telemetry payload', completed: true },
      ],
      comments: [
        { id: 'c3', author: 'Alex Mercer', initials: 'AM', text: 'Checked on staging and analytics fire correctly.', time: '3 hours ago' }
      ],
      attachmentsCount: 0,
    },
    {
      id: 't5',
      title: 'Conduct focus group reviews',
      description: 'Coordinate user interviews with 5 external testers to gather qualitative feedback.',
      status: 'To Do',
      priority: 'Urgent',
      startDate: '2026-07-21',
      dueDate: '2026-07-24',
      assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }],
      subtasks: [
        { id: 's9', title: 'Book Zoom calendar dates', completed: false },
        { id: 's10', title: 'Send questionnaire sheet', completed: false },
      ],
      comments: [],
      attachmentsCount: 3,
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
      subtasks: [
        { id: 's11', title: 'Benchmark key verify speeds', completed: true },
      ],
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
      assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }, { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }],
      subtasks: [
        { id: 's12', title: 'Write token parser utils', completed: true },
        { id: 's13', title: 'Implement cookie-based fallback check', completed: false },
      ],
      comments: [],
      attachmentsCount: 0,
    },
    {
      id: 't8',
      title: 'OAuth2 credential setup',
      description: 'Register client client-ids and secrets for Google, GitHub, and Apple SSO credentials.',
      status: 'To Do',
      priority: 'Medium',
      startDate: '2026-07-12',
      dueDate: '2026-07-18',
      assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }],
      subtasks: [
        { id: 's14', title: 'Google developers workspace credentials', completed: false },
        { id: 's15', title: 'GitHub OAuth application callback url', completed: false },
      ],
      comments: [],
      attachmentsCount: 0,
    }
  ]
};

const defaultMembers: Member[] = [
  { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
  { name: 'Oliver Twist', initials: 'OT', bg: 'bg-amber-500' },
];

export default function ProjectDetailPage() {
  const { user } = useUser();
  const canCreateTask = usePermission('task:create');
  const canAssignTask = usePermission('task:assign');
  const canDeleteTask = usePermission('task:delete');

  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Employee[]>([]);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  
  const isEmployee = user?.role === 'Employee';

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
  const tasksLoggedHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
  const issuesLoggedHours = issues.reduce((sum, i) => sum + (i.actualHours || 0), 0);
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

  // Task spent hours modal states
  const [hoursPromptOpen, setHoursPromptOpen] = useState(false);
  const [promptTask, setPromptTask] = useState<{ taskId: string; targetStatus: Task['status'] } | null>(null);
  const [promptValue, setPromptValue] = useState('0');

  // Task Drawer/Detail Drawer States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Initial Load from Backend/LocalStorage
  useEffect(() => {
    async function loadProject() {
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
            members: [defaultMembers[0]],
          };
        }
        setProject(currentProj);
      }
    }

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
          const seed = initialTasksData[projectId] || [];
          setTasks(seed);
        }
      }
    }

    async function loadEmployees() {
      const res = await getEmployeesAction();
      if (res.success && res.data) {
        setAvailableMembers(res.data.filter(e => e.role?.toLowerCase() !== 'admin'));
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
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    handleMoveTask(taskId, targetStatus);
  };

  const handleMoveTask = async (taskId: string, targetStatus: Task['status']) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    if (targetStatus === 'Done' && taskToMove.status !== 'Done') {
      setPromptTask({ taskId, targetStatus });
      setPromptValue(String(taskToMove.actualHours || 0));
      setHoursPromptOpen(true);
    } else {
      await submitMoveTask(taskId, targetStatus, taskToMove.actualHours || 0);
    }
  };

  const submitMoveTask = async (taskId: string, targetStatus: Task['status'], hoursInput: number) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    const updatedTask = { ...taskToMove, status: targetStatus, actualHours: hoursInput };

    // Update locally first for visual speed
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(updatedTask);
    }

    const res = await updateTaskAction(taskId, { status: targetStatus, actualHours: hoursInput });
    if (res.success && res.data) {
      setTasks(prev => prev.map(t => t.id === taskId ? (res.data as any) : t));
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

    const selectedEmployees = availableMembers.filter(m => newTaskAssignees.includes(m.name));
    const assignees = selectedEmployees.map(m => ({
      id: m.id,
      name: m.name,
      initials: m.initials,
      bg: m.bg
    }));

    const newTaskData = {
      title: newTaskTitle,
      description: newTaskDesc,
      status: newTaskStatus,
      priority: newTaskPriority,
      startDate: newTaskStartDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignees: assignees.length > 0 ? assignees : [{
        id: availableMembers[0]?.id || '1',
        name: availableMembers[0]?.name || defaultMembers[0].name,
      }],
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
        assignees: selectedEmployees.length > 0 ? selectedEmployees : [availableMembers[0] || defaultMembers[0]],
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
      time: 'Just now',
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
    if (!prio) return 'bg-slate-50 text-slate-600 border-slate-200/50';
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
        return 'bg-slate-50 text-slate-600 border-slate-200/50';
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

  if (!project) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-650 border-t-transparent mx-auto" />
          <p className="text-xs font-bold">Synchronizing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Detail Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        
        {/* Decorative corner */}
        <span className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/3 pointer-events-none" />

        <div className="flex flex-col gap-6 relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="space-y-3 flex-1">
              {/* Back Button */}
              <button 
                onClick={() => router.push('/projects')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Hub</span>
              </button>

              {/* Title & Status */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{project.name}</h1>
                
                <div className="relative group shrink-0">
                  <select 
                    value={project.status}
                    onChange={(e) => handleUpdateProjectStatus(e.target.value as Project['status'])}
                    className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/25 appearance-none pr-7 border shadow-xs transition-all", getProjectStatusBadge(project.status))}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown className="h-3 w-3 absolute right-2 top-1.5 text-slate-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsEditProjectModalOpen(true)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-55 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 transition-all cursor-pointer shadow-3xs hover:border-slate-300"
                >
                  <Pencil className="h-3 w-3 text-indigo-500" />
                  <span>Edit Details</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">{project.description}</p>
              
              {/* Tags & Due date */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-slate-650">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>Due Date:</span>
                  <span className="text-slate-700">{project.dueDate}</span>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map(tag => (
                        <span key={tag} className="rounded-lg bg-slate-50 border border-slate-200/50 text-slate-500 px-2 py-0.5 text-[9px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map(tech => (
                        <span key={tech} className="rounded-lg bg-indigo-50/50 border border-indigo-150/30 text-indigo-750 px-2 py-0.5 text-[9px] font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Circular Gauge */}
            <div className="flex items-center gap-5 border-l border-slate-100 pl-0 md:pl-6 shrink-0 w-full md:w-auto">
              <div className="relative flex h-16 w-16 items-center justify-center bg-indigo-50/20 rounded-2xl border border-slate-100">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 - (project.progress / 100) * 2 * Math.PI * 18}
                  />
                </svg>
                <span className="absolute text-xs font-black text-indigo-750">{project.progress}%</span>
              </div>
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sprint Health</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{project.completedTasks} / {project.tasksCount} Tasks Done</p>
                
                <div className="flex -space-x-1.5 mt-2">
                  {project.members.filter((m: any) => m.role?.toLowerCase() !== 'admin').map((member, i) => (
                    <div key={i} className={cn("h-6 w-6 rounded-lg text-[8px] font-extrabold text-white flex items-center justify-center ring-2 ring-white", member.bg)} title={member.name}>
                      {member.initials}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100">
            {/* Start Date */}
            {project.startDate && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Start Date</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>{project.startDate}</span>
                </div>
              </div>
            )}

            {/* Target Quarter */}
            {project.targetQuarter && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Release Quarter</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>{project.targetQuarter}</span>
                </div>
              </div>
            )}

            {/* Priority */}
            {project.priority && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Priority</span>
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className={cn("rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border", getPriorityColor(project.priority))}>
                    {project.priority}
                  </span>
                </div>
              </div>
            )}

            {/* Budget */}
            {project.budget && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Budget / Est. Hours</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750">
                  <Coins className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <div className="flex flex-col">
                    <span>{project.budget}</span>
                    {projectBudgetHours > 0 && (
                      <span className="text-[9px] text-slate-450 font-bold mt-0.5">
                        Spent: {totalLoggedProjectHours}h | Left: {remainingProjectHours}h
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Slack Channel */}
            {project.slackChannel && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Slack Channel</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-755">
                  <Hash className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate" title={project.slackChannel}>{project.slackChannel}</span>
                </div>
              </div>
            )}

            {/* Repository */}
            {project.repositoryUrl && (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Repository</span>
                <a 
                  href={project.repositoryUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-650 hover:text-indigo-850 hover:underline transition-all"
                >
                  <Link2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">View Code</span>
                </a>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Controller: Tabs & Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
        
        {/* Switch Tabs Segment */}
        <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto border border-slate-100">
          {[
            { id: 'kanban', label: 'Kanban Board', icon: Columns },
            { id: 'list', label: 'Task List', icon: ListTodo },
            { id: 'timeline', label: 'Timeline / Gantt', icon: CalendarDays },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  active 
                    ? "bg-white text-indigo-650 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-400 hover:text-slate-650"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add Task Trigger */}
        {canCreateTask && (
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Main Views Container */}
      <div className="min-h-[50vh]">
        
        {/* 1. KANBAN BOARD VIEW */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(['To Do', 'In Progress', 'In Review', 'Done'] as Task['status'][]).map(status => {
              const columnTasks = displayTasks.filter(t => t.status === status);
              return (
                <div 
                  key={status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, status)}
                  className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-4.5 flex flex-col min-h-[300px] shadow-2xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        status === 'To Do' ? 'bg-slate-400' :
                        status === 'In Progress' ? 'bg-indigo-500' :
                        status === 'In Review' ? 'bg-amber-500' : 'bg-emerald-500'
                      )} />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{status}</span>
                      <span className="rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                        {columnTasks.length}
                      </span>
                    </div>

                    {canCreateTask && (
                      <button 
                        onClick={() => {
                          setNewTaskStatus(status);
                          setIsTaskModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Add task to column"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Task list inside column */}
                  <div className="space-y-3.5 flex-1 pr-1.5">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-bold text-center h-28 select-none">
                        Drop Tasks Here
                      </div>
                    ) : (
                      columnTasks.map(task => {
                        const totalSubs = task.subtasks.length;
                        const compSubs = task.subtasks.filter(s => s.completed).length;
                        
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setSelectedTask(task)}
                            className="group flex flex-col justify-between bg-white border border-slate-200/85 hover:border-slate-350 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden"
                          >
                            <div className="space-y-3">
                              {/* Top metadata */}
                              <div className="flex items-center justify-between">
                                <span className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                                  {task.priority}
                                </span>

                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.dueDate}
                                </span>
                              </div>

                              {/* Task Title */}
                              <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-650 transition-colors">
                                {task.title}
                              </h4>

                              {/* Description snippet */}
                              {task.description && (
                                <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Task metrics & Footer */}
                            <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                              {/* Left indicators */}
                              <div className="flex items-center gap-2.5 text-slate-400">
                                {totalSubs > 0 && (
                                  <div className="flex items-center gap-1 text-[9px] font-bold" title="Subtasks">
                                    <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                                    <span className={compSubs === totalSubs ? "text-emerald-600" : ""}>
                                      {compSubs}/{totalSubs}
                                    </span>
                                  </div>
                                )}
                                
                                {task.comments.length > 0 && (
                                  <div className="flex items-center gap-1 text-[9px] font-bold" title="Comments">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span>{task.comments.length}</span>
                                  </div>
                                )}
                              </div>

                              {/* Member initials */}
                              <div className="flex -space-x-1 overflow-hidden">
                                {task.assignees.map((assignee, i) => (
                                  <div key={i} className={cn("h-5 w-5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-2xs", assignee.bg)} title={assignee.name}>
                                    {assignee.initials}
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. LIST VIEW */}
        {activeTab === 'list' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">Task Title</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Assignees</th>
                    <th className="py-3.5 px-4 text-center">Subtasks</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {displayTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400">
                        No tasks created yet. Click "Add Task" to get started.
                      </td>
                    </tr>
                  ) : (
                    displayTasks.map(task => {
                      const totalSubs = task.subtasks.length;
                      const compSubs = task.subtasks.filter(s => s.completed).length;
                      return (
                        <tr 
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                        >
                          {/* Title */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, task.status === 'Done' ? 'To Do' : 'Done');
                                }}
                                className="h-4.5 w-4.5 rounded-lg border border-slate-250 hover:border-indigo-500 bg-white flex items-center justify-center text-white hover:text-indigo-600 transition-colors shrink-0"
                              >
                                {task.status === 'Done' && (
                                  <div className="h-2.5 w-2.5 rounded bg-indigo-600" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <p className={cn("text-xs font-bold text-slate-800 truncate group-hover:text-indigo-650 transition-colors", task.status === 'Done' && "line-through text-slate-400")}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-sm">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                              task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                              task.status === 'In Review' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                              task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100/50' :
                              'bg-slate-50 text-slate-500 border-slate-200/50'
                            )}>
                              {task.status}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-4 px-4">
                            <span className={cn("rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                              {task.priority}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className="py-4 px-4 text-xs font-bold text-slate-600">
                            {task.dueDate}
                          </td>

                          {/* Assignees */}
                          <td className="py-4 px-4">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {task.assignees.map((assignee, idx) => (
                                <div key={idx} className={cn("h-6 w-6 rounded-md text-[7px] font-extrabold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", assignee.bg)} title={assignee.name}>
                                  {assignee.initials}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Subtask count */}
                          <td className="py-4 px-4 text-center">
                            {totalSubs > 0 ? (
                              <span className={cn("text-xs font-bold", compSubs === totalSubs ? "text-emerald-600" : "text-slate-500")}>
                                {compSubs} / {totalSubs}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-bold">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            {canDeleteTask && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex"
                                title="Delete Task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TIMELINE / GANTT VIEW */}
        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
            {displayTasks.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">
                No tasks to display in timeline. Create tasks to render the Gantt chart.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline calendar bar header */}
                <div className="flex border-b border-slate-100 pb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-1/3 shrink-0">Task details</div>
                  <div className="flex-1 flex justify-between relative pl-4">
                    <span>Jul 01</span>
                    <span>Jul 07</span>
                    <span>Jul 14</span>
                    <span>Jul 21</span>
                    <span>Jul 28</span>
                    <span className="absolute inset-y-0 left-0 right-0 border-l border-r border-dashed border-slate-200/50" />
                  </div>
                </div>

                {/* Timeline rows */}
                <div className="space-y-4">
                  {displayTasks.map(task => {
                    // Let us calculate start and end day within July 2026 (days 1 to 31)
                    let startDay = 1;
                    let endDay = 15;
                    try {
                      if (task.startDate) {
                        const day = new Date(task.startDate).getDate();
                        if (!isNaN(day)) startDay = day;
                      }
                      if (task.dueDate) {
                        const day = new Date(task.dueDate).getDate();
                        if (!isNaN(day)) endDay = day;
                      }
                    } catch {}

                    // Constrain startDay/endDay to 1 - 31 range
                    startDay = Math.max(1, Math.min(31, startDay));
                    endDay = Math.max(startDay, Math.min(31, endDay));

                    const span = endDay - startDay + 1;
                    const leftOffsetPercent = ((startDay - 1) / 31) * 100;
                    const widthPercent = (span / 31) * 100;

                    // Color based on status
                    const barColor = 
                      task.status === 'Done' ? 'from-emerald-450 to-emerald-550 shadow-[0_0_8px_rgba(16,185,129,0.2)]' :
                      task.status === 'In Review' ? 'from-amber-450 to-amber-550 shadow-[0_0_8px_rgba(245,158,11,0.2)]' :
                      task.status === 'In Progress' ? 'from-indigo-500 to-indigo-650 shadow-[0_0_8px_rgba(79,70,229,0.2)]' :
                      'from-slate-350 to-slate-450';

                    return (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="flex items-center hover:bg-slate-50/50 p-2 rounded-2xl transition-colors cursor-pointer group"
                      >
                        {/* Left metadata */}
                        <div className="w-1/3 shrink-0 pr-4">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-black uppercase tracking-wider border rounded-md px-1.5 py-0.2", getPriorityColor(task.priority))}>
                              {task.priority}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">
                              {startDay} - {endDay} Jul
                            </span>
                          </div>
                        </div>

                        {/* Right Gantt Bar Track */}
                        <div className="flex-1 h-9 bg-slate-50/55 rounded-xl border border-slate-100 relative overflow-hidden pl-4">
                          {/* Absolute timeline grid marks */}
                          <div className="absolute inset-y-0 left-1/4 border-l border-dashed border-slate-100" />
                          <div className="absolute inset-y-0 left-2/4 border-l border-dashed border-slate-100" />
                          <div className="absolute inset-y-0 left-3/4 border-l border-dashed border-slate-100" />

                          {/* Gantt Bar */}
                          <div
                            className={cn("absolute top-2 h-5 rounded-lg bg-gradient-to-r flex items-center justify-between px-2 text-[8px] font-bold text-white transition-all", barColor)}
                            style={{
                              left: `${leftOffsetPercent}%`,
                              width: `${widthPercent}%`,
                              minWidth: '24px'
                            }}
                          >
                            <span className="truncate hidden sm:inline">{task.title}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      </div>

      {/* Hours Spent Modal */}
      {hoursPromptOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-650 border border-pink-100/30">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Log Spent Hours</h3>
              </div>
              <button 
                onClick={() => {
                  setHoursPromptOpen(false);
                  setPromptTask(null);
                }}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You marked this task as <strong className="text-slate-700">Done</strong>. How many hours did you spend to complete it?
              </p>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hours Spent</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/8 transition-all"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setHoursPromptOpen(false);
                  setPromptTask(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (promptTask) {
                    const hours = parseInt(promptValue, 10) || 0;
                    await submitMoveTask(promptTask.taskId, promptTask.targetStatus, hours);
                  }
                  setHoursPromptOpen(false);
                  setPromptTask(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                Confirm & Log
              </button>
            </div>

          </div>
        </div>
      )}

      {/* dialog - Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30">
                  <CheckSquare className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Add New Task</h3>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="space-y-5">
              
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code auth route handler"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="Specify task deliverables or instructions..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</label>
                  <div className="relative">
                    <select
                      value={newTaskStatus}
                      onChange={(e) => setNewTaskStatus(e.target.value as Task['status'])}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Done">Done</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                  <div className="relative">
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={newTaskStartDate}
                    onChange={(e) => setNewTaskStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Assignees selection */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Task To</label>
                <div className="flex flex-wrap gap-2">
                  {((project && project.members && project.members.length > 0) ? project.members : availableMembers).filter((m: any) => m.role?.toLowerCase() !== 'admin').map((member) => {
                    const isSelected = newTaskAssignees.includes(member.name);
                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewTaskAssignees(newTaskAssignees.filter(m => m !== member.name));
                          } else {
                            setNewTaskAssignees([...newTaskAssignees, member.name]);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-200 cursor-pointer",
                          isSelected 
                            ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-3xs ring-1 ring-indigo-200/50" 
                            : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50 hover:border-slate-300 shadow-3xs"
                        )}
                      >
                        <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-3xs shrink-0", member.bg)}>
                          {member.initials}
                        </div>
                        <span>{member.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
                >
                  Add Task
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Slide-over/Modal: Task Detail Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-955/40 backdrop-blur-md animate-fadeIn">
          {/* Backdrop close area */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedTask(null)} />
          
          <div className="relative w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slideIn">
            
            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-6">
              
              {/* Header section */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-indigo-650 font-black text-[10px] uppercase tracking-widest">
                  <Bookmark className="h-4 w-4 text-indigo-500" />
                  <span>Task Workspace Details</span>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{selectedTask.title}</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-150 rounded-2xl p-4">
                  {selectedTask.description || "No description provided for this task."}
                </p>
              </div>

              {/* Task configuration options */}
              <div className="grid grid-cols-2 gap-4 bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs">
                
                {/* Status Column */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <div className="relative">
                    <select
                      value={selectedTask.status}
                      onChange={(e) => handleMoveTask(selectedTask.id, e.target.value as Task['status'])}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Done">Done</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-450 pointer-events-none" />
                  </div>
                </div>

                {/* Priority Column */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Priority</span>
                  <div className="relative">
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => {
                        const updated = tasks.map(t => t.id === selectedTask.id ? { ...t, priority: e.target.value as Task['priority'] } : t);
                        saveTasks(updated);
                        setSelectedTask({ ...selectedTask, priority: e.target.value as Task['priority'] });
                      }}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-450 pointer-events-none" />
                  </div>
                </div>

                {/* Hours Spent Column */}
                <div className="col-span-2 border-t border-slate-100 pt-3.5 space-y-1.5 animate-fadeIn">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hours Spent (Actual)</span>
                  <input
                    type="number"
                    min={0}
                    value={selectedTask.actualHours || 0}
                    onChange={async (e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      const updatedTask = { ...selectedTask, actualHours: val };
                      setSelectedTask(updatedTask);
                      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
                      await updateTaskAction(selectedTask.id, { actualHours: val });
                    }}
                    className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Dates */}
                <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                    <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5 mt-1">
                      <CalendarDays className="h-4 w-4 text-indigo-500" />
                      {selectedTask.startDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                    <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5 mt-1">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      {selectedTask.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Assignees</span>
                <div className="flex flex-wrap gap-2.5">
                  {selectedTask.assignees.map((assignee, idx) => (
                    <div key={idx} className="flex items-center gap-1.8 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                      <div className={cn("h-5 w-5 rounded-md flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs", assignee.bg)}>
                        {assignee.initials}
                      </div>
                      <span className="text-[10px] font-bold text-slate-650">{assignee.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist Section */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="h-4 w-4 text-indigo-650" />
                  <span>Subtask Checklist</span>
                </span>
                
                {/* Checklist loop */}
                <div className="space-y-2 bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
                  {selectedTask.subtasks.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">No subtasks defined yet.</p>
                  ) : (
                    selectedTask.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between group/sub">
                        <button
                          onClick={() => handleToggleSubtask(sub.id)}
                          className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                        >
                          <div className={cn(
                            "h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-colors",
                            sub.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-350 bg-white"
                          )}>
                            {sub.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <span className={cn("text-xs font-bold transition-all", sub.completed ? "line-through text-slate-400" : "text-slate-700")}>
                            {sub.title}
                          </span>
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteSubtask(sub.id)}
                          className="text-slate-450 opacity-0 group-hover/sub:opacity-100 hover:text-red-500 transition-opacity p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Add subtask Form */}
                  <form onSubmit={handleAddSubtask} className="flex gap-2 border-t border-slate-200/80 pt-3.5 mt-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Add another checklist task item..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-650" />
                  <span>Discussion ({selectedTask.comments.length})</span>
                </span>

                {/* Add Comment input */}
                <form onSubmit={handleAddComment} className="flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'DU'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Ask a question or post progress notes..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4.5 py-1.8 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-sm shadow-indigo-650/10 cursor-pointer"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comment loops */}
                <div className="space-y-3.5 pt-2">
                  {selectedTask.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
                      <div className={cn("h-7 w-7 rounded-lg text-[9px] font-black text-white flex items-center justify-center shrink-0 shadow-3xs", comment.initials === 'DU' ? 'bg-indigo-600' : 'bg-slate-500')}>
                        {comment.initials}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-800">{comment.author}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{comment.time}</span>
                        </div>
                        <p className="text-xs text-slate-650 font-medium leading-relaxed break-words">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Footer options */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4.5 flex justify-between items-center">
              {canDeleteTask ? (
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Task</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-650 text-xs font-bold shadow-3xs cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      <AddProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        availableMembers={availableMembers}
        projectToEdit={project}
        onSuccess={async () => {
          const res = await getProjectByIdAction(projectId);
          if (res.success && res.data) {
            setProject(res.data as any);
          }
        }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
    </>
  );
}
