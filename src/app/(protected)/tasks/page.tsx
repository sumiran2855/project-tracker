'use client';

import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  MessageSquare, 
  Plus, 
  Clock, 
  Calendar, 
  Columns, 
  ListTodo, 
  CalendarDays,
  X,
  Bookmark,
  ChevronDown,
  Trash2,
  Folder,
  Sparkles,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Member {
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
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Comment {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  startDate: string;
  dueDate: string;
  assignees: Member[];
  subtasks: Subtask[];
  comments: Comment[];
  attachmentsCount: number;
}

interface GlobalTask extends Task {
  projectId: string;
  projectName: string;
}

// Fallbacks
const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'SaaS Onboarding Flow',
    description: 'Redesign and polish the signup and onboarding screens to reduce user drop-offs.',
    status: 'In Progress',
    progress: 65,
    tags: ['Design', 'UX Research'],
    tasksCount: 5,
    completedTasks: 3,
    commentsCount: 24,
    attachmentsCount: 4,
    dueDate: '2026-07-25',
    members: [
      { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
      { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
    ],
  },
  {
    id: '2',
    name: 'API Authentication V2',
    description: 'Implement JWT tokens, OAuth, and custom session middleware for protected endpoints.',
    status: 'In Review',
    progress: 90,
    tags: ['Backend', 'Security'],
    tasksCount: 3,
    completedTasks: 2,
    commentsCount: 18,
    attachmentsCount: 6,
    dueDate: '2026-07-18',
    members: [
      { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
    ],
  },
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

const defaultMembers: Member[] = [
  { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
  { name: 'Oliver Twist', initials: 'OT', bg: 'bg-amber-500' },
];

export default function GlobalTasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'calendar'>('board');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Task Drawer States
  const [selectedTask, setSelectedTask] = useState<GlobalTask | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

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

  // Load projects and compile tasks
  useEffect(() => {
    // 1. Load projects
    let loadedProjects: Project[] = [];
    const storedProjects = localStorage.getItem('pwt_projects');
    if (storedProjects) {
      try {
        loadedProjects = JSON.parse(storedProjects);
      } catch (e) {
        console.error(e);
      }
    }
    if (loadedProjects.length === 0) {
      loadedProjects = defaultProjects;
      localStorage.setItem('pwt_projects', JSON.stringify(defaultProjects));
    }
    setProjects(loadedProjects);

    // 2. Compile tasks across all projects
    const allGlobalTasks: GlobalTask[] = [];
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
        // Use seed fallback
        projTasks = fallbackTasks[proj.id] || [];
        localStorage.setItem(storedTasksKey, JSON.stringify(projTasks));
      }

      projTasks.forEach(task => {
        allGlobalTasks.push({
          ...task,
          projectId: proj.id,
          projectName: proj.name
        });
      });
    });

    setTasks(allGlobalTasks);
  }, []);

  // Sync state helpers
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

  const handleUpdateTask = (updatedTask: GlobalTask) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    saveAllTasks(updated);
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updated = tasks.filter(t => t.id !== taskId);
      saveAllTasks(updated);
      setSelectedTask(null);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskProject) return;

    const targetProject = projects.find(p => p.id === newTaskProject);
    if (!targetProject) return;

    const assignees = defaultMembers.filter(m => newTaskAssignees.includes(m.name));

    const newTask: GlobalTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc,
      status: newTaskStatus,
      priority: newTaskPriority,
      startDate: newTaskStartDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignees: assignees.length > 0 ? assignees : [defaultMembers[0]],
      subtasks: [],
      comments: [],
      attachmentsCount: 0,
      projectId: targetProject.id,
      projectName: targetProject.name,
    };

    saveAllTasks([newTask, ...tasks]);

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
  };

  // Drag and Drop Column Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: targetStatus };
      }
      return t;
    });
    saveAllTasks(updated);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'All' || task.projectId === projectFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  // Calculate statistics
  const totalCount = filteredTasks.length;
  const pendingCount = filteredTasks.filter(t => t.status === 'To Do').length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress').length;
  const inReviewCount = filteredTasks.filter(t => t.status === 'In Review').length;
  const doneCount = filteredTasks.filter(t => t.status === 'Done').length;

  const getPriorityColor = (prio: Task['priority']) => {
    switch (prio) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/50';
    }
  };

  // Render a custom monthly calendar for July 2026
  const renderCalendar = () => {
    const daysInMonth = 31;
    const calendarCells = [];

    // July 2026 starts on a Wednesday (offset 3 days for Sunday-start layout: Sun=0, Mon=1, Tue=2, Wed=3)
    const startOffset = 3;

    // Blank cells before Wed
    for (let i = 0; i < startOffset; i++) {
      calendarCells.push(<div key={`blank-${i}`} className="min-h-24 bg-slate-50/50 border border-slate-100 rounded-2xl opacity-40" />);
    }

    // Days 1 to 31
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `2026-07-${day < 10 ? '0' + day : day}`;
      const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);

      calendarCells.push(
        <div 
          key={`day-${day}`} 
          className="min-h-24 bg-white border border-slate-150 rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-sm transition-shadow duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-700">{day}</span>
            {dayTasks.length > 0 && (
              <span className="h-1.8 w-1.8 rounded-full bg-indigo-500" />
            )}
          </div>
          
          <div className="space-y-1.5 flex-1 mt-2 overflow-y-auto max-h-16 scrollbar-none">
            {dayTasks.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="w-full text-left truncate text-[8px] font-bold px-1.5 py-0.5 rounded-lg border flex flex-col cursor-pointer bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-150 transition-colors"
                title={task.title}
              >
                <span className="text-slate-800 truncate">{task.title}</span>
                <span className="text-[6px] text-indigo-500 uppercase tracking-widest truncate">{task.projectName}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Add extra empty slots to round up to full row
    const totalSlots = startOffset + daysInMonth;
    const remainingSlots = (7 - (totalSlots % 7)) % 7;
    for (let i = 0; i < remainingSlots; i++) {
      calendarCells.push(<div key={`blank-end-${i}`} className="min-h-24 bg-slate-50/50 border border-slate-100 rounded-2xl opacity-40" />);
    }

    return (
      <div className="space-y-4">
        {/* Calendar Month Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-indigo-650" />
            <h3 className="text-sm font-black text-slate-800">July 2026</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Workspace Tracker</span>
        </div>

        {/* Days of the week */}
        <div className="grid grid-cols-7 gap-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-2.5">
          {calendarCells}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Workspace Operations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30 shadow-xs">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
            Tasks Board
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1">
            Aggregated workspace items across all development initiatives.
          </p>
        </div>

        <button 
          onClick={() => {
            if (projects.length > 0) {
              setNewTaskProject(projects[0].id);
            }
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks', value: totalCount, icon: ListTodo, color: 'bg-slate-100 border-slate-200 text-slate-600' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-slate-100 border-slate-200 text-slate-500' },
          { label: 'In Progress', value: inProgressCount, icon: CheckSquare, color: 'bg-indigo-50/50 border-indigo-150 text-indigo-600' },
          { label: 'In Review', value: inReviewCount, icon: TrendingUp, color: 'bg-amber-50/50 border-amber-150 text-amber-600' },
          { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'bg-emerald-50/50 border-emerald-150 text-emerald-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
                <div className={cn("p-1.5 rounded-lg border", s.color.split(' ')[0], s.color.split(' ')[1], s.color.split(' ')[2])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-800 mt-3">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col xl:flex-row items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
        
        {/* Search */}
        <div className="relative w-full xl:flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task title or description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 text-slate-400">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Multi Select filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full xl:w-auto">
          {/* Projects */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-500 shadow-2xs">
            <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-500 shadow-2xs">
            <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Status */}
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-500 shadow-2xs">
            <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

      </div>

      {/* Tab Select & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
        
        {/* Switching Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto border border-slate-100">
          {[
            { id: 'board', label: 'Kanban Board', icon: Columns },
            { id: 'list', label: 'Detailed List', icon: ListTodo },
            { id: 'calendar', label: 'Calendar View', icon: CalendarDays },
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
      </div>

      {/* Views Content Container */}
      <div className="min-h-[50vh]">

        {/* 1. KANBAN BOARD VIEW */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(['To Do', 'In Progress', 'In Review', 'Done'] as Task['status'][]).map(status => {
              const colTasks = filteredTasks.filter(t => t.status === status);
              return (
                <div 
                  key={status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, status)}
                  className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-4.5 flex flex-col min-h-[350px] shadow-2xs"
                >
                  {/* Col Header */}
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
                        {colTasks.length}
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        setNewTaskStatus(status);
                        setIsTaskModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[60vh] pr-1.5 scrollbar-thin">
                    {colTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-bold text-center h-28 select-none">
                        Drop Tasks Here
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const total = task.subtasks.length;
                        const done = task.subtasks.filter(s => s.completed).length;
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => setSelectedTask(task)}
                            className="group flex flex-col justify-between bg-white border border-slate-200/85 hover:border-slate-350 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden"
                          >
                            <div className="space-y-3.5">
                              {/* Metadata */}
                              <div className="flex items-center justify-between">
                                <span className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                                  {task.priority}
                                </span>
                                <span className="text-[8px] text-indigo-500 font-extrabold uppercase tracking-widest max-w-[120px] truncate" title={task.projectName}>
                                  {task.projectName}
                                </span>
                              </div>

                              {/* Title */}
                              <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                                {task.title}
                              </h4>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
                                {total > 0 && (
                                  <span className="flex items-center gap-1">
                                    <CheckSquare className="h-3.5 w-3.5" />
                                    {done}/{total}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.dueDate}
                                </span>
                              </div>

                              <div className="flex -space-x-1 overflow-hidden">
                                {task.assignees.map((assignee, idx) => (
                                  <div key={idx} className={cn("h-5.5 w-5.5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", assignee.bg)} title={assignee.name}>
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
                  <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                    <th className="py-3.5 px-6">Task Title</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Assignees</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400">
                        No tasks match the filters. Try adjusting search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => (
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
                                const nextStatus: Task['status'] = task.status === 'Done' ? 'To Do' : 'Done';
                                handleUpdateTask({ ...task, status: nextStatus });
                              }}
                              className="h-4.5 w-4.5 rounded-lg border border-slate-250 hover:border-indigo-500 bg-white flex items-center justify-center text-white hover:text-indigo-600 transition-colors shrink-0"
                            >
                              {task.status === 'Done' && (
                                <div className="h-2.5 w-2.5 rounded bg-indigo-600" />
                              )}
                            </button>
                            <p className={cn("text-xs font-bold text-slate-800 group-hover:text-indigo-650 transition-colors", task.status === 'Done' && "line-through text-slate-400")}>
                              {task.title}
                            </p>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="py-4 px-4 text-xs font-bold text-indigo-650">
                          {task.projectName}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
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
                        <td className="py-4 px-4 text-xs font-bold text-slate-500">
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

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CALENDAR VIEW */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            {renderCalendar()}
          </div>
        )}

      </div>

      {/* dialog - Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-scaleIn">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650">
                  <CheckSquare className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800">Add New Task</h3>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="space-y-4">
              
              {/* Project Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Destination Project</label>
                <select
                  required
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>Select project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement webhook handlers"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail the deliverables..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as Task['status'])}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Start Date</label>
                  <input
                    type="date"
                    value={newTaskStartDate}
                    onChange={(e) => setNewTaskStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Assignees selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Assign Task To</label>
                <div className="flex flex-wrap gap-2">
                  {defaultMembers.map((member) => {
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
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer",
                          isSelected 
                            ? "bg-indigo-50 border-indigo-250 text-indigo-700 shadow-3xs" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        )}
                      >
                        <div className={cn("h-4.5 w-4.5 rounded-md flex items-center justify-center text-[7px] text-white font-extrabold", member.bg)}>
                          {member.initials}
                        </div>
                        <span>{member.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
                >
                  Create Task
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Task Drawer / Detail Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedTask(null)} />
          
          <div className="relative w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slideIn">
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-indigo-650 font-black text-[10px] uppercase tracking-widest">
                  <Bookmark className="h-4 w-4 text-indigo-500" />
                  <span>Global Task Workspace Details</span>
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
                <div className="flex items-center gap-1.5 text-xs text-indigo-650 font-bold">
                  <Folder className="h-4 w-4" />
                  <span>Associated Project: {selectedTask.projectName}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-150 rounded-2xl p-4">
                  {selectedTask.description || "No description provided for this task."}
                </p>
              </div>

              {/* Task Options */}
              <div className="grid grid-cols-2 gap-4 bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs">
                
                {/* Status */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <div className="relative">
                    <select
                      value={selectedTask.status}
                      onChange={(e) => handleUpdateTask({ ...selectedTask, status: e.target.value as Task['status'] })}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white cursor-pointer pr-8 focus:outline-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Done">Done</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-455 pointer-events-none" />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Priority</span>
                  <div className="relative">
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => handleUpdateTask({ ...selectedTask, priority: e.target.value as Task['priority'] })}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white cursor-pointer pr-8 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-455 pointer-events-none" />
                  </div>
                </div>

                {/* Dates */}
                <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                    <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5 mt-1">
                      <Calendar className="h-4 w-4 text-indigo-500" />
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

              {/* Subtasks */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-indigo-650" />
                  <span>Subtask Checklist</span>
                </span>
                
                <div className="space-y-2 bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
                  {selectedTask.subtasks.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-bold text-center py-4">No subtasks defined.</p>
                  ) : (
                    selectedTask.subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between group/sub">
                        <button
                          onClick={() => {
                            const updatedSubs = selectedTask.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                            handleUpdateTask({ ...selectedTask, subtasks: updatedSubs });
                          }}
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
                          onClick={() => {
                            const updatedSubs = selectedTask.subtasks.filter(s => s.id !== sub.id);
                            handleUpdateTask({ ...selectedTask, subtasks: updatedSubs });
                          }}
                          className="text-slate-450 opacity-0 group-hover/sub:opacity-100 hover:text-red-500 transition-opacity p-1 hover:bg-slate-100 rounded-lg"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newSubtaskTitle.trim()) return;
                      const newSub = { id: `sub_${Date.now()}`, title: newSubtaskTitle, completed: false };
                      handleUpdateTask({ ...selectedTask, subtasks: [...selectedTask.subtasks, newSub] });
                      setNewSubtaskTitle('');
                    }}
                    className="flex gap-2 border-t border-slate-200/80 pt-3.5 mt-3.5"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Add checklist item..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-405 focus:border-indigo-500 focus:outline-none"
                    />
                    <button type="submit" className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-xs font-bold transition-colors cursor-pointer shrink-0">
                      Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Discussion */}
              <div className="space-y-4 pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-650" />
                  <span>Discussion ({selectedTask.comments.length})</span>
                </span>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCommentText.trim()) return;
                    const newComm = { id: `comm_${Date.now()}`, author: 'Dev User', initials: 'DU', text: newCommentText, time: 'Just now' };
                    handleUpdateTask({ ...selectedTask, comments: [newComm, ...selectedTask.comments] });
                    setNewCommentText('');
                  }}
                  className="flex gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shrink-0">DU</div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Post a comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end">
                      <button type="submit" className="px-4.5 py-1.8 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold shadow-sm cursor-pointer">
                        Comment
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-3.5 pt-2">
                  {selectedTask.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
                      <div className={cn("h-7 w-7 rounded-lg text-[9px] font-black text-white flex items-center justify-center shrink-0 shadow-3xs", comment.initials === 'DU' ? 'bg-indigo-600' : 'bg-slate-500')}>
                        {comment.initials}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-850">{comment.author}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{comment.time}</span>
                        </div>
                        <p className="text-xs text-slate-650 font-medium leading-relaxed break-words">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4.5 flex justify-between items-center">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Task</span>
              </button>

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

    </div>
  );
}
