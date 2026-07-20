'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, usePermission } from '@/contexts/UserContext';
import {
  Folder,
  Bookmark,
  Plus,
  Search,
  Filter,
  Calendar,
  X,
  Sparkles,
  TrendingUp,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  ListTodo,
  Bug,
  LayoutGrid,
  CheckSquare,
  ArrowUpDown,
  RefreshCw,
  FolderDot,
  ArrowLeft,
  MoveRight,
  MessageSquare,
  Paperclip,
  CheckCircle,
  PlusCircle,
  Clock3,
  User,
  Trash2,
  Subtitles,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectsAction, getEmployeesAction, type Employee } from '@/actions/projects';
import { getTasksByProjectAction, updateTaskAction, deleteTaskAction, type Task, type Subtask, type Comment } from '@/actions/tasks';
import { getIssuesByProjectAction, updateIssueAction, deleteIssueAction, type Issue } from '@/actions/issues';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';
import { AddIssueModal } from '@/components/dashboard/AddIssueModal';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface Member {
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
      subtasks: [],
      comments: [],
    },
    {
      id: 't2',
      title: 'Create wireframes',
      description: 'Draft initial wireframes focusing on clean, onboarding screens.',
      status: 'In Progress',
      priority: 'Medium',
      startDate: '2026-07-06',
      dueDate: '2026-07-12',
      assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }, { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }],
      subtasks: [],
      comments: [],
    },
  ],
  '2': [
    {
      id: 't6',
      title: 'Review JWT signing algorithm',
      description: 'Evaluate HMAC vs RS256 signing for API workloads.',
      status: 'Done',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-04',
      assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }],
      subtasks: [],
      comments: [],
    },
  ]
};

const fallbackIssues: Record<string, Issue[]> = {
  '1': [
    {
      id: 'i1',
      title: 'Button overlap on Mobile Safari',
      description: 'The signup button overlaps with input element below 380px widths.',
      status: 'Open',
      priority: 'High',
      type: 'Bug',
      projectId: '1',
      projectName: 'SaaS Onboarding Flow',
      dueDate: '2026-07-20',
      assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }],
      commentsCount: 2,
    }
  ],
  '2': [
    {
      id: 'i2',
      title: 'CORS policy missing in auth route',
      description: 'Cross-origin request blocked when hitting authentication endpoint.',
      status: 'In Progress',
      priority: 'Critical',
      type: 'Security',
      projectId: '2',
      projectName: 'API Authentication V2',
      dueDate: '2026-07-18',
      assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }],
      commentsCount: 1,
    }
  ]
};

type ViewMode = 'sheet' | 'kanban';

interface CardDetailItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type?: string;
  dueDate?: string;
  startDate?: string;
  assignees: Member[];
  actualHours?: number;
  comments: Comment[];
  subtasks?: Subtask[];
  itemType: 'task' | 'issue';
}

export default function WorkshopDashboard() {
  const { user } = useUser();
  const canCreateProject = usePermission('project:create');
  const isEmployee = user?.role?.toLowerCase() === 'employee';

  const dateInputRef = useRef<HTMLInputElement>(null);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

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
            tasksData = fallbackTasks[selectedProject.id] || [];
          }
        } else {
          tasksData = fallbackTasks[selectedProject.id] || [];
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
            issuesData = fallbackIssues[selectedProject.id] || [];
          }
        } else {
          issuesData = fallbackIssues[selectedProject.id] || [];
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
      // update local task list
      setSelectedProjTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

      // recalculate project progress locally
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

      // recalculate project progress locally
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
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('cardType', cardType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDraggedOverCol(colId);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const cardId = e.dataTransfer.getData('cardId');
    const cardType = e.dataTransfer.getData('cardType') as 'task' | 'issue';

    if (!cardId) return;

    // Map column ID to actual status values
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

    // If moving to Done / Closed, prompt for hours
    if (colId === 'done') {
      setHoursModalTarget({ id: cardId, type: cardType, newStatus });
      setInputHours('');
      setShowHoursModal(true);
    } else {
      // Direct update
      if (cardType === 'task') {
        handleMoveTaskStatus(cardId, newStatus as Task['status']);
      } else {
        handleMoveIssueStatus(cardId, newStatus as Issue['status']);
      }
    }
  };

  // Save transition logged hours
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

  // Open card details drawer
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
        // Load comments locally for issues
        const issueCommentsKey = `pwt_comments_issue_${issue.id}`;
        let savedComments: Comment[] = [];
        try {
          const stored = localStorage.getItem(issueCommentsKey);
          if (stored) savedComments = JSON.parse(stored);
        } catch { }

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
          comments: savedComments,
          itemType: 'issue'
        });
        setTempHours(String((issue as any).actualHours || 0));
        setIsEditingHours(false);
      }
    }
  };

  // Toggle subtask inside details drawer
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

  // Add subtask inside details drawer
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

  // Add comment inside details drawer
  const handleAddComment = async () => {
    if (!activeDetailItem || !newCommentText.trim()) return;
    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      author: user?.name || 'PWT Team Member',
      initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ME',
      text: newCommentText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today'
    };
    const nextComments = [...activeDetailItem.comments, newComment];

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { comments: nextComments });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, comments: nextComments });
        setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, comments: nextComments } : t));
        setNewCommentText('');
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { commentsCount: nextComments.length });
      if (res.success) {
        localStorage.setItem(`pwt_comments_issue_${activeDetailItem.id}`, JSON.stringify(nextComments));
        setActiveDetailItem({ ...activeDetailItem, comments: nextComments });
        setSelectedProjIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, commentsCount: nextComments.length } : i));
        setNewCommentText('');
      }
    }
  };

  // Save actual hours inside details drawer
  const handleSaveHoursValue = async () => {
    if (!activeDetailItem) return;
    const numHours = parseFloat(tempHours) || 0;

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { actualHours: numHours });
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, actualHours: numHours });
        setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, actualHours: numHours } : t));
        setIsEditingHours(false);
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { actualHours: numHours } as any);
      if (res.success) {
        setActiveDetailItem({ ...activeDetailItem, actualHours: numHours });
        setSelectedProjIssues(prev => prev.map(i => {
          if (i.id === activeDetailItem.id) {
            return { ...i, actualHours: numHours } as any;
          }
          return i;
        }));
        setIsEditingHours(false);
      }
    }
  };

  // Update target/due date inside details drawer
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

        // Save to local storage list just in case of local cache sync
        const nextList = selectedProjIssues.map(i => i.id === activeDetailItem.id ? { ...i, dueDate: valueToSave } : i);
        localStorage.setItem(`pwt_issues_project_${selectedProject?.id}`, JSON.stringify(nextList));
      }
    }
  };

  // Update status directly from details drawer
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

  // Update priority directly from details drawer
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

  // Update start date directly from details drawer (tasks only)
  const handleUpdateStartDate = async (newVal: string) => {
    if (!activeDetailItem || activeDetailItem.itemType !== 'task') return;
    const valueToSave = newVal || '';
    const res = await updateTaskAction(activeDetailItem.id, { startDate: valueToSave });
    if (res.success) {
      setActiveDetailItem({ ...activeDetailItem, startDate: valueToSave });
      setSelectedProjTasks(prev => prev.map(t => t.id === activeDetailItem.id ? { ...t, startDate: valueToSave } : t));
    }
  };

  // Delete active task or issue
  const handleDeleteActiveItem = async () => {
    if (!activeDetailItem) return;
    if (confirm(`Are you sure you want to delete this ${activeDetailItem.itemType === 'task' ? 'task' : 'issue'}?`)) {
      if (activeDetailItem.itemType === 'task') {
        const res = await deleteTaskAction(activeDetailItem.id);
        if (res.success) {
          setSelectedProjTasks(prev => prev.filter(t => t.id !== activeDetailItem.id));
          setActiveDetailItem(null);
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
        } else {
          alert(res.error || 'Failed to delete issue');
        }
      }
    }
  };

  // Sort function
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter projects for display
  // Employees only see projects they are assigned to
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

  // Excel CSV Export
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

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'In Review':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Planning':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-650 border-indigo-500/20';
    }
  };

  const getPriorityColor = (priority?: Project['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-650 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-650 border-orange-500/20';
      case 'Medium':
        return 'bg-indigo-500/10 text-indigo-650 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getCardPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'Urgent':
      case 'Critical':
        return 'bg-red-50 text-red-650 border border-red-150';
      case 'High':
        return 'bg-orange-50 text-orange-650 border border-orange-150';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-650 border border-indigo-150';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-150';
    }
  };

  // Kanban Columns Mapping
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

  // Statistics calculation
  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inReviewCount = projects.filter(p => p.status === 'In Review').length;
  const planningCount = projects.filter(p => p.status === 'Planning').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">

      {/* ────────────────────────────────────────────────────────
          VIEW 1: SPREADSHEET VIEW
          ──────────────────────────────────────────────────────── */}
      {viewMode === 'sheet' && (
        <div className="animate-fadeUp space-y-6">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                <span>PWT Workshop Dashboard</span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <FolderDot className="h-4.5 w-4.5" />
                </div>
                Operations Sheet Workspace
              </h1>
              <p className="text-xs text-slate-450 font-medium mt-1">
                Visual workspace metrics, tabular sheet controls, and Kanban board sub-dashboards.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-655 shadow-3xs cursor-pointer active:scale-98 transition-all"
                title="Download Workspace Spreadsheet as Excel CSV file"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>

              {canCreateProject && (
                <button
                  onClick={() => setActiveModal('project')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Initiative</span>
                </button>
              )}
            </div>
          </div>

          {/* Bento Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Projects', value: totalProjects, color: 'from-slate-500 to-slate-655', bg: 'bg-slate-50' },
              { label: 'In Progress', value: inProgressCount, color: 'from-indigo-500 to-indigo-650', bg: 'bg-indigo-50/50' },
              { label: 'In Review', value: inReviewCount, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50/50' },
              { label: 'Planning', value: planningCount, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Completed', value: completedCount, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50/50' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow flex flex-col justify-between relative overflow-hidden group">
                <span className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", stat.color)} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800 mt-2">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Spreadsheet Filter Controls */}
          <div className="flex flex-col lg:flex-row items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">

            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter projects by title, description, stack tags..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-808 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-semibold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-655">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Status Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 shadow-2xs shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-slate-750 font-extrabold pr-2"
                >
                  <option value="All">All statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 shadow-2xs shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-slate-750 font-extrabold pr-2"
                >
                  <option value="All">All priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Column Visibility */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-655 shadow-2xs cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>Visible Fields</span>
                </button>
                {showColMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2 animate-scaleIn">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-450 pb-1.5 border-b border-slate-100">Toggle Column Views</p>
                    {Object.keys(visibleColumns).map((col) => (
                      <label key={col} className="flex items-center gap-2 text-xs font-bold text-slate-650 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={visibleColumns[col as keyof typeof visibleColumns]}
                          onChange={() => setVisibleColumns({
                            ...visibleColumns,
                            [col]: !visibleColumns[col as keyof typeof visibleColumns]
                          })}
                          className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spreadsheet Table Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 uppercase text-[9px] font-black tracking-wider">
                    <th className="py-3 px-3 text-center text-slate-400 font-extrabold w-10 bg-slate-50/70 border-r border-slate-150">#</th>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Project Workspace</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                      </div>
                    </th>

                    {visibleColumns.quarter && (
                      <th
                        onClick={() => handleSort('dueDate')}
                        className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Target Quarter</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                        </div>
                      </th>
                    )}

                    {visibleColumns.priority && (
                      <th
                        onClick={() => handleSort('priority')}
                        className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Priority</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                        </div>
                      </th>
                    )}

                    {visibleColumns.status && (
                      <th
                        onClick={() => handleSort('status')}
                        className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Status</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                        </div>
                      </th>
                    )}

                    {visibleColumns.progress && (
                      <th
                        onClick={() => handleSort('progress')}
                        className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Completion Progress</span>
                          <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                        </div>
                      </th>
                    )}

                    {visibleColumns.techStack && (
                      <th className="py-3.5 px-4 font-black border-r border-slate-150">Tech Stack</th>
                    )}

                    {visibleColumns.budget && (
                      <th className="py-3.5 px-4 font-black border-r border-slate-150">Total Budget</th>
                    )}

                    {visibleColumns.team && (
                      <th className="py-3.5 px-4 font-black border-r border-slate-150">Assigned Team</th>
                    )}

                    <th className="py-3.5 px-4 font-black text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                        No active initiative worksheets found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project, idx) => (
                      <tr
                        key={project.id}
                        onClick={() => handleProjectClick(project)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Row Index */}
                        <td className="py-4 px-3 text-center text-slate-400 font-black bg-slate-50/30 border-r border-slate-150 select-none">
                          {idx + 1}
                        </td>

                        {/* Workspace Details */}
                        <td className="py-4 px-4 font-bold text-slate-800 border-r border-slate-150">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-650 shrink-0">
                              <Folder className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black tracking-tight text-slate-850 group-hover:text-indigo-650 transition-colors">{project.name}</p>
                              <p className="truncate text-[10px] text-slate-455 font-medium mt-0.5 max-w-[240px]">{project.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Quarter */}
                        {visibleColumns.quarter && (
                          <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap border-r border-slate-150">
                            {project.targetQuarter || 'Future'}
                          </td>
                        )}

                        {/* Priority */}
                        {visibleColumns.priority && (
                          <td className="py-4 px-4 whitespace-nowrap border-r border-slate-150">
                            <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full", getPriorityColor(project.priority))}>
                              {project.priority || 'Medium'}
                            </span>
                          </td>
                        )}

                        {/* Status */}
                        {visibleColumns.status && (
                          <td className="py-4 px-4 whitespace-nowrap border-r border-slate-150">
                            <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full", getStatusColor(project.status))}>
                              {project.status}
                            </span>
                          </td>
                        )}

                        {/* Completion Progress */}
                        {visibleColumns.progress && (
                          <td className="py-4 px-4 min-w-[150px] border-r border-slate-150">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 h-2 bg-slate-100 border border-slate-200/55 rounded-full overflow-hidden relative">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full transition-all duration-350"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-800 w-8 text-right">{project.progress}%</span>
                            </div>
                          </td>
                        )}

                        {/* Tech Stack */}
                        {visibleColumns.techStack && (
                          <td className="py-4 px-4 border-r border-slate-150">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {project.techStack?.slice(0, 3).map((stack) => (
                                <span key={stack} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 border border-slate-200/50 rounded-md text-slate-500">
                                  {stack}
                                </span>
                              )) || '-'}
                              {project.techStack && project.techStack.length > 3 && (
                                <span className="px-1.5 py-0.5 text-[8px] font-black bg-indigo-50 border border-indigo-100 rounded-md text-indigo-600">
                                  +{project.techStack.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Budget */}
                        {visibleColumns.budget && (
                          <td className="py-4 px-4 font-bold text-slate-655 whitespace-nowrap border-r border-slate-150">
                            {project.budget || '40 hours'}
                          </td>
                        )}

                        {/* Team Members */}
                        {visibleColumns.team && (
                          <td className="py-4 px-4 border-r border-slate-150">
                            {(() => {
                              const nonAdminMembers = (project.members || []).filter((m: any) => m.role?.toLowerCase() !== 'admin');
                              return (
                                <div className="flex -space-x-1.5 overflow-hidden">
                                  {nonAdminMembers.slice(0, 4).map((m, index) => (
                                    <div
                                      key={index}
                                      title={m.name}
                                      className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-extrabold ring-2 ring-white shadow-2xs shrink-0", m.bg)}
                                    >
                                      {m.initials}
                                    </div>
                                  ))}
                                  {nonAdminMembers.length > 4 && (
                                    <div className="h-5.5 w-5.5 rounded-full flex items-center justify-center text-[7px] text-slate-400 font-extrabold bg-slate-50 ring-2 ring-white border border-slate-200">
                                      +{nonAdminMembers.length - 4}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                        )}

                        {/* Action Arrow */}
                        <td className="py-4 px-4 text-center">
                          <button
                            className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-650 shadow-3xs group-hover:border-indigo-200 group-hover:shadow-2xs transition-all cursor-pointer"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW 2: PRO KANBAN BOARD VIEW (WITH DRAG & DROP)
          ──────────────────────────────────────────────────────── */}
      {viewMode === 'kanban' && selectedProject && (
        <div className="space-y-5 animate-fadeUp">

          {/* Back button and title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="space-y-1.5">
              <button
                onClick={() => setViewMode('sheet')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-black text-slate-550 cursor-pointer shadow-3xs transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Spreadsheet Grid</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <FolderDot className="h-6 w-6 text-indigo-600 shrink-0" />
                  {selectedProject.name}
                </h1>
                <Badge className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border", getStatusColor(selectedProject.status))}>
                  {selectedProject.status}
                </Badge>
                <Badge className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border", getPriorityColor(selectedProject.priority))}>
                  {selectedProject.priority || 'Medium'} Priority
                </Badge>
              </div>
              <p className="text-xs text-slate-455 leading-relaxed max-w-2xl font-semibold">{selectedProject.description}</p>
            </div>

            {/* Action Buttons for new task/issue */}
            <div className="flex gap-2 shrink-0 items-center">
              <button
                onClick={handleRefreshKanban}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer shadow-3xs hover:rotate-90 transition-transform duration-300"
                title="Refresh Kanban Board cards"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {!isEmployee && (
                <>
                  <button
                    onClick={() => setActiveModal('task')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Task</span>
                  </button>
                  <button
                    onClick={() => setActiveModal('issue')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <Bug className="h-4 w-4" />
                    <span>Report Issue</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Project Details Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs text-xs">
            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Completion Progress</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${selectedProject.progress}%` }} />
                </div>
                <span className="font-extrabold text-slate-800">{selectedProject.progress}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Target Quarter / Timeline</span>
              <span className="block font-extrabold text-slate-700">
                {selectedProject.targetQuarter || 'Q3 2026'} ({selectedProject.dueDate ? new Date(selectedProject.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date'})
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Workload Budget / Slack</span>
              <span className="block font-extrabold text-slate-700">
                {selectedProject.budget || '120 hours'} — <span className="text-indigo-650">{selectedProject.slackChannel || '#proj-dev'}</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Assigned Team Members</span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {selectedProject.members.map((m, i) => (
                    <div
                      key={i}
                      title={m.name}
                      className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[8px] text-white font-extrabold ring-2 ring-white shadow-2xs shrink-0", m.bg)}
                    >
                      {m.initials}
                    </div>
                  ))}
                </div>
                <span className="font-bold text-slate-500 text-[10px]">{selectedProject.members.length} members</span>
              </div>
            </div>
          </div>

          {/* Kanban Search Filters */}
          <div className="flex items-center bg-white border border-slate-200 p-2.5 rounded-xl shadow-3xs max-w-md">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={kanbanSearch}
              onChange={(e) => setKanbanSearch(e.target.value)}
              placeholder="Search tasks and issues on the board..."
              className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 outline-none font-semibold"
            />
            {kanbanSearch && (
              <button onClick={() => setKanbanSearch('')} className="text-slate-400 hover:text-slate-655 ml-1">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start min-h-[60vh]">
            {kanbanLoading ? (
              <div className="col-span-4 flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
              </div>
            ) : (
              getKanbanColumns().map((col) => {
                const totalCount = col.tasks.length + col.issues.length;
                const isOver = draggedOverCol === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={cn(
                      "flex flex-col bg-slate-50 border rounded-2xl p-3 space-y-3 min-h-[500px] transition-colors duration-200",
                      isOver ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200/80"
                    )}
                  >

                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full border", col.id === 'done' ? 'bg-emerald-500 animate-pulse' : col.id === 'inreview' ? 'bg-amber-500' : col.id === 'inprogress' ? 'bg-indigo-500' : 'bg-slate-400')} />
                        <h3 className="text-xs font-black text-slate-750">{col.title}</h3>
                      </div>
                      <Badge className="bg-white border border-slate-200 text-slate-500 font-extrabold text-[9px] px-1.5 py-0.5">
                        {totalCount}
                      </Badge>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[70vh] no-scrollbar">
                      {totalCount === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-semibold text-[10px] border border-dashed border-slate-200 rounded-xl bg-white/40">
                          Drop cards here
                        </div>
                      ) : (
                        <>
                          {/* Render Tasks */}
                          {col.tasks.map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id, 'task')}
                              onClick={() => handleCardClick(task.id, 'task')}
                              className={cn(
                                "bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between hover:shadow-2xs hover:border-indigo-150 transition-all relative overflow-hidden group cursor-grab active:cursor-grabbing",
                                task.status === 'Done' && "opacity-80"
                              )}
                            >
                              {/* Left border line colored for Task */}
                              <span className="absolute inset-y-0 left-0 w-1 bg-indigo-500" />

                              <div className="space-y-1 pl-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-1.5">
                                    <ListTodo className="h-3.5 w-3.5 text-indigo-650 shrink-0 mt-0.5" />
                                    <h4 className={cn(
                                      "text-xs font-bold text-slate-805 tracking-tight leading-snug group-hover:text-indigo-650 transition-colors",
                                      task.status === 'Done' && "line-through text-slate-400"
                                    )}>
                                      {task.title}
                                    </h4>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold line-clamp-2">
                                  {task.description}
                                </p>
                              </div>

                              {/* Card Footer */}
                              <div className="flex items-center justify-between border-t border-slate-100 mt-3.5 pt-2.5 pl-1 text-[9px]">
                                <div className="flex items-center gap-1">
                                  <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase", getCardPriorityBadge(task.priority))}>
                                    {task.priority}
                                  </span>
                                  {task.actualHours ? (
                                    <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 font-bold">
                                      <Clock3 className="h-2.5 w-2.5" />
                                      {task.actualHours}h
                                    </span>
                                  ) : null}
                                </div>

                                {/* Assignee */}
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1 overflow-hidden">
                                    {task.assignees?.map((a, i) => (
                                      <div
                                        key={i}
                                        title={a.name}
                                        className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold ring-2 ring-white shadow-3xs shrink-0", a.bg)}
                                      >
                                        {a.initials}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Render Issues */}
                          {col.issues.map((issue) => (
                            <div
                              key={issue.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, issue.id, 'issue')}
                              onClick={() => handleCardClick(issue.id, 'issue')}
                              className={cn(
                                "bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between hover:shadow-2xs hover:border-red-150 transition-all relative overflow-hidden group cursor-grab active:cursor-grabbing",
                                issue.status === 'Closed' && "opacity-80"
                              )}
                            >
                              {/* Left border line colored for Issue */}
                              <span className="absolute inset-y-0 left-0 w-1 bg-red-500" />

                              <div className="space-y-1 pl-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-1.5">
                                    <Bug className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                    <h4 className={cn(
                                      "text-xs font-bold text-slate-805 tracking-tight leading-snug group-hover:text-red-650 transition-colors",
                                      issue.status === 'Closed' && "line-through text-slate-400"
                                    )}>
                                      {issue.title}
                                    </h4>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Badge className="bg-red-50 text-red-550 border border-red-100 text-[8px] py-px px-1 font-bold shrink-0">{issue.type}</Badge>
                                </div>
                                <p className="text-[10px] text-slate-455 leading-relaxed font-semibold line-clamp-2 mt-1">
                                  {issue.description}
                                </p>
                              </div>

                              {/* Card Footer */}
                              <div className="flex items-center justify-between border-t border-slate-100 mt-3.5 pt-2.5 pl-1 text-[9px]">
                                <div className="flex items-center gap-1">
                                  <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase", getCardPriorityBadge(issue.priority))}>
                                    {issue.priority}
                                  </span>
                                  {(issue as any).actualHours ? (
                                    <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 font-bold">
                                      <Clock3 className="h-2.5 w-2.5" />
                                      {(issue as any).actualHours}h
                                    </span>
                                  ) : null}
                                </div>

                                {/* Assignees */}
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1 overflow-hidden">
                                    {issue.assignees?.map((a, i) => (
                                      <div
                                        key={i}
                                        title={a.name}
                                        className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold ring-2 ring-white shadow-3xs shrink-0", a.bg)}
                                      >
                                        {a.initials}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          PROMPT MODAL: LOG HOURS FOR RESOLVED ITEMS
          ──────────────────────────────────────────────────────── */}
      {showHoursModal && hoursModalTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Log Resolution Hours</h3>
                <p className="text-[10px] text-slate-400 font-medium">Record hours spent on this ticket</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              How many actual hours did you spend to solve this {hoursModalTarget.type}?
            </p>

            <input
              type="number"
              value={inputHours}
              onChange={(e) => setInputHours(e.target.value)}
              placeholder="e.g. 4.5"
              step="0.5"
              min="0"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
              autoFocus
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => { setShowHoursModal(false); setHoursModalTarget(null); }}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Skip / Cancel
              </button>
              <button
                onClick={handleSaveTransitionHours}
                className="px-4 py-2 text-xs font-bold bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl cursor-pointer shadow-md transition-all active:scale-98"
              >
                Log hours & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          SLIDE-IN SIDE PANEL: CARD DETAILED DRAWER
          ──────────────────────────────────────────────────────── */}
      <Sheet open={!!activeDetailItem} onOpenChange={(open) => { if (!open) setActiveDetailItem(null); }}>
        <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-3xl bg-white border-l border-slate-200 shadow-2xl p-0 flex flex-col h-full animate-slideIn">
          {activeDetailItem && (
            <>
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4.5 w-4.5 text-indigo-650 fill-indigo-650/10" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-650 font-sans">
                    {activeDetailItem.itemType === 'task' ? 'Task Workspace Details' : 'Issue Workspace Details'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDetailItem(null)}
                  className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-205 flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
                {/* Title */}
                <div>
                  <h2 className="text-lg font-black text-slate-808 tracking-tight leading-snug">
                    {activeDetailItem.title}
                  </h2>

                  {/* Description */}
                  {activeDetailItem.description && (
                    <div className="mt-3.5 bg-slate-50/50 border border-slate-150 rounded-2xl p-4 text-xs font-semibold text-slate-550 leading-relaxed">
                      {activeDetailItem.description}
                    </div>
                  )}
                </div>

                {/* Status, Priority, Dates Block Card */}
                <div className="border border-slate-200/85 rounded-2xl p-4.5 space-y-4 bg-white shadow-3xs">
                  {/* Status & Priority Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</label>
                      <div className="relative">
                        <select
                          value={activeDetailItem.status}
                          onChange={(e) => handleUpdateStatus(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer pr-10"
                        >
                          {activeDetailItem.itemType === 'task' ? (
                            <>
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="In Review">In Review</option>
                              <option value="Done">Done</option>
                            </>
                          ) : (
                            <>
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </>
                          )}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Priority dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                      <div className="relative">
                        <select
                          value={activeDetailItem.priority}
                          onChange={(e) => handleUpdatePriority(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer pr-10"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          {activeDetailItem.itemType === 'task' ? (
                            <option value="Urgent">Urgent</option>
                          ) : (
                            <option value="Critical">Critical</option>
                          )}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Divider (Thin line) */}
                  <div className="border-t border-slate-100" />

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date (Tasks only) */}
                    {activeDetailItem.itemType === 'task' ? (
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Start Date</label>
                        <div className="relative">
                          <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-all w-full text-left select-none"
                          >
                            <Calendar className="h-4 w-4 text-indigo-555 shrink-0" />
                            <span>
                              {activeDetailItem.startDate && activeDetailItem.startDate !== 'No Date'
                                ? (() => {
                                  const parts = activeDetailItem.startDate.split('-');
                                  if (parts.length === 3) return activeDetailItem.startDate;
                                  return new Date(activeDetailItem.startDate).toISOString().split('T')[0];
                                })()
                                : 'Set Start Date'
                              }
                            </span>
                          </button>
                          <input
                            type="date"
                            dir="rtl"
                            value={activeDetailItem.startDate && activeDetailItem.startDate !== 'No Date' ? activeDetailItem.startDate : ''}
                            onChange={(e) => handleUpdateStartDate(e.target.value)}
                            onClick={(e) => {
                              try {
                                (e.target as HTMLInputElement).showPicker();
                              } catch (err) {}
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {/* Logged Hours instead of Start Date for bugs */}
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Logged Hours</label>
                        <div>
                          {isEditingHours ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={tempHours}
                                onChange={(e) => setTempHours(e.target.value)}
                                className="w-20 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-[11px] font-black text-slate-808 outline-none transition-all shadow-3xs bg-white"
                                step="0.5"
                                min="0"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveHoursValue}
                                className="px-2.5 py-1 rounded-lg bg-indigo-650 hover:bg-indigo-755 text-white text-[10px] font-black shadow-3xs transition-all cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setTempHours(String(activeDetailItem.actualHours || 0));
                                setIsEditingHours(true);
                              }}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-all cursor-pointer w-full text-left select-none"
                            >
                              <Clock className="h-4 w-4 text-indigo-550 shrink-0" />
                              <span>{activeDetailItem.actualHours || 0} hrs</span>
                              <span className="text-[8px] text-slate-400 ml-auto font-bold uppercase tracking-wider">Edit</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Due Date (Always present) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-all w-full text-left select-none"
                        >
                          <Clock className="h-4 w-4 text-indigo-555 shrink-0" />
                          <span>
                            {activeDetailItem.dueDate && activeDetailItem.dueDate !== 'No Due Date'
                              ? (() => {
                                const parts = activeDetailItem.dueDate.split('-');
                                if (parts.length === 3) return activeDetailItem.dueDate;
                                return new Date(activeDetailItem.dueDate).toISOString().split('T')[0];
                              })()
                              : 'Set Due Date'
                            }
                          </span>
                        </button>
                        <input
                          type="date"
                          dir="rtl"
                          value={activeDetailItem.dueDate && activeDetailItem.dueDate !== 'No Due Date' ? activeDetailItem.dueDate : ''}
                          onChange={(e) => handleUpdateTargetDate(e.target.value)}
                          onClick={(e) => {
                            try {
                              (e.target as HTMLInputElement).showPicker();
                            } catch (err) {}
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logged Hours row for tasks, since start date occupied its slot */}
                {activeDetailItem.itemType === 'task' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Logged Hours</label>
                    <div>
                      {isEditingHours ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={tempHours}
                            onChange={(e) => setTempHours(e.target.value)}
                            className="w-20 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-[11px] font-black text-slate-808 outline-none transition-all shadow-3xs bg-white"
                            step="0.5"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveHoursValue}
                            className="px-2.5 py-1 rounded-lg bg-indigo-650 hover:bg-indigo-755 text-white text-[10px] font-black shadow-3xs transition-all cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setTempHours(String(activeDetailItem.actualHours || 0));
                            setIsEditingHours(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-all cursor-pointer w-36 text-left select-none"
                        >
                          <Clock className="h-4 w-4 text-indigo-550 shrink-0" />
                          <span>{activeDetailItem.actualHours || 0} hours</span>
                          <span className="text-[8px] text-slate-400 ml-auto font-bold uppercase tracking-wider">Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Assignees */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assignees</label>
                  <div className="flex flex-wrap gap-2">
                    {activeDetailItem.assignees.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-3xs"
                      >
                        <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shrink-0 shadow-3xs", a.bg || 'bg-indigo-500')}>
                          {a.initials}
                        </div>
                        <span>{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtask Checklist */}
                {activeDetailItem.itemType === 'task' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5 pb-1 font-sans">
                      <CheckSquare className="h-3.5 w-3.5 text-indigo-650" />
                      Subtask Checklist
                    </h3>

                    <div className="border border-slate-200/85 rounded-2xl p-4.5 space-y-4 bg-white shadow-3xs">
                      <div className="space-y-2">
                        {(!activeDetailItem.subtasks || activeDetailItem.subtasks.length === 0) ? (
                          <div className="py-2 text-center text-slate-400 font-semibold text-[11px]">
                            No subtasks defined yet.
                          </div>
                        ) : (
                          activeDetailItem.subtasks.map((sub) => (
                            <label key={sub.id} className="flex items-center gap-2.5 bg-white border border-slate-150 p-2.5 rounded-xl shadow-3xs hover:border-slate-200 transition-colors cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubtask(sub.id)}
                                className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                              />
                              <span className={cn(
                                "text-xs font-bold text-slate-700",
                                sub.completed && "line-through text-slate-400"
                              )}>
                                {sub.title}
                              </span>
                            </label>
                          ))
                        )}
                      </div>

                      {/* Add checklist item */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={newSubtaskText}
                          onChange={(e) => setNewSubtaskText(e.target.value)}
                          placeholder="Add another checklist task item..."
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 bg-white transition-all placeholder:text-slate-400"
                        />
                        <button
                          onClick={handleAddSubtask}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-650 px-4.5 py-2 text-xs font-black transition-all cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discussion */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5 pb-1 font-sans">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-650" />
                    Discussion ({activeDetailItem.comments?.length || 0})
                  </h3>

                  {/* Input comment field */}
                  <div className="flex gap-3 items-start">
                    <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs mt-1 bg-indigo-600")}>
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DU'}
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Ask a question or post progress notes..."
                        rows={2.5}
                        className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 bg-white transition-all resize-none shadow-3xs placeholder:text-slate-400"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddComment}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white px-5 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment Thread list */}
                  <div className="space-y-3 pt-2">
                    {activeDetailItem.comments?.map((comment) => (
                      <div key={comment.id} className="bg-slate-50/50 border border-slate-200 p-3 rounded-2xl shadow-3xs flex gap-3">
                        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs bg-indigo-500")}>
                          {comment.initials}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{comment.author}</span>
                            <span className="text-[8px] font-bold text-slate-400">{comment.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-655 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/35">
                <button
                  onClick={handleDeleteActiveItem}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-105 text-red-600 text-xs font-black transition-all cursor-pointer shadow-3xs border border-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{activeDetailItem.itemType === 'task' ? 'Delete Task' : 'Delete Issue'}</span>
                </button>
                <button
                  onClick={() => setActiveDetailItem(null)}
                  className="px-4.5 py-2.5 rounded-xl bg-white hover:bg-slate-55 border border-slate-250 text-slate-655 text-xs font-black transition-all cursor-pointer shadow-3xs"
                >
                  Close Drawer
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Creation Modals */}
      {/* 1. Add Project Modal */}
      <AddProjectModal
        isOpen={activeModal === 'project'}
        onClose={() => setActiveModal(null)}
        availableMembers={employees}
        onSuccess={loadWorkspaceData}
      />

      {/* 2. Add Task Modal */}
      {selectedProject && (
        <AddTaskModal
          isOpen={activeModal === 'task'}
          onClose={() => setActiveModal(null)}
          projects={projects}
          availableMembers={employees}
          defaultProjectId={selectedProject.id}
          onSuccess={handleRefreshKanban}
        />
      )}

      {/* 3. Add Issue Modal */}
      {selectedProject && (
        <AddIssueModal
          isOpen={activeModal === 'issue'}
          onClose={() => setActiveModal(null)}
          projects={projects}
          availableMembers={employees}
          onSuccess={handleRefreshKanban}
        />
      )}

    </div>
  );
}
