'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  X, 
  Bookmark, 
  ChevronDown, 
  Trash2, 
  Folder, 
  AlertCircle, 
  MessageSquare, 
  CheckSquare, 
  Grid, 
  Kanban,
  User,
  ExternalLink,
  FlameKindling
} from 'lucide-react';
import { cn, getCurrentWeekBounds, isItemInSprint } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { getEmployeesAction } from '@/actions/projects';
import { updateTaskAction, deleteTaskAction, Task, Subtask, Comment } from '@/actions/tasks';
import { updateIssueAction, deleteIssueAction, Issue } from '@/actions/issues';
import { fetchAllSprintData } from '@/lib/sprintLoader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { EmployeeDetailModal } from '@/components/dashboard/EmployeeDetailModal';

interface SprintItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  startDate?: string;
  assignees: any[];
  actualHours?: number;
  comments?: any[];
  projectId?: string;
  projectName?: string;
  itemType: 'task' | 'issue';
  // Issue specific
  type?: string;
  commentsCount?: number;
  // Task specific
  subtasks?: any[];
}

export default function SprintPage() {
  const { user } = useUser();
  
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

  // Filter tasks and issues down to just sprint items
  const sprintTasks = tasks.filter(t => isItemInSprint(t.dueDate, t.status));
  const sprintIssues = issues.filter(i => isItemInSprint(i.dueDate, i.status));

  // Convert tasks and issues into a unified SprintItem array
  const sprintItems: SprintItem[] = [
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
      comments: t.comments || [],
      projectId: t.projectId,
      projectName: t.projectName,
      itemType: 'task' as const,
      subtasks: t.subtasks || []
    })),
    ...sprintIssues.map(i => {
      // Load local comments for issues
      let localComments: any[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`pwt_comments_issue_${i.id}`);
        if (stored) {
          try {
            localComments = JSON.parse(stored);
          } catch (e) {
            console.error(e);
          }
        }
      }
      return {
        id: i.id,
        title: i.title,
        description: i.description || '',
        status: i.status === 'Open' ? 'To Do' : i.status === 'In Progress' ? 'In Progress' : i.status === 'Resolved' ? 'In Review' : 'Done',
        priority: i.priority === 'Critical' ? 'Urgent' : i.priority,
        dueDate: i.dueDate,
        assignees: i.assignees || [],
        actualHours: (i as any).actualHours || 0,
        comments: localComments,
        projectId: i.projectId,
        projectName: i.projectName,
        itemType: 'issue' as const,
        type: i.type,
        commentsCount: i.commentsCount || 0
      };
    })
  ];

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

  const totalLoggedHours = sprintItems.reduce((acc, item) => acc + (item.actualHours || 0), 0);

  // Status mapping
  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

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
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('pwt_update'));
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
    const numHours = parseFloat(tempHours) || 0;

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { actualHours: numHours });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: numHours } : null);
        setIsEditingHours(false);
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { actualHours: numHours } as any);
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: numHours } : null);
        setIsEditingHours(false);
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
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', Today'
    };
    const nextComments = [...(activeDetailItem.comments || []), newComment];

    if (activeDetailItem.itemType === 'task') {
      const res = await updateTaskAction(activeDetailItem.id, { comments: nextComments });
      if (res.success && res.data) {
        setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments } : null);
        setNewCommentText('');
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(activeDetailItem.id, { commentsCount: nextComments.length });
      if (res.success) {
        localStorage.setItem(`pwt_comments_issue_${activeDetailItem.id}`, JSON.stringify(nextComments));
        setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments } : null);
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
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('cardType', cardType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setDraggedOverCol(colStatus);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
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

    if (colStatus === 'Done') {
      setHoursModalTarget({ id: cardId, type: cardType, newStatus: targetStatus });
      setInputHours('');
      setShowHoursModal(true);
    } else {
      if (cardType === 'task') {
        const res = await updateTaskAction(cardId, { status: targetStatus as any });
        if (res.success) {
          dispatchUpdate();
        }
      } else {
        const res = await updateIssueAction(cardId, { status: targetStatus as any });
        if (res.success) {
          dispatchUpdate();
        }
      }
    }
  };

  const handleSaveTransitionHours = async () => {
    if (!hoursModalTarget) return;
    const hoursVal = parseFloat(inputHours) || 0;

    if (hoursModalTarget.type === 'task') {
      const res = await updateTaskAction(hoursModalTarget.id, { 
        status: hoursModalTarget.newStatus as any,
        actualHours: hoursVal
      });
      if (res.success) {
        dispatchUpdate();
      }
    } else {
      const res = await updateIssueAction(hoursModalTarget.id, { 
        status: hoursModalTarget.newStatus as any,
        actualHours: hoursVal
      } as any);
      if (res.success) {
        dispatchUpdate();
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

  // Role-based workload distribution visibility:
  // Admin / Manager -> All non-admin employees
  // Client -> Employees working on their project(s)
  // Employee -> Only their own card
  if (user?.role === 'Employee') {
    memberAnalytics = memberAnalytics.filter(m => 
      m.name === user.name || m.email === user.email || m.id === user.id
    );
    // Fallback if logged-in employee card is missing from members list
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
        initials: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'ME',
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
  }

  const selectedEmployeeItems = selectedEmployee ? sprintItems.filter(item => 
    item.assignees.some(a => a.name === selectedEmployee.name || a.userId === selectedEmployee.id || a.id === selectedEmployee.id)
  ) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* ────────────────────────────────────────────────────────
          TOP BANNER HEADER
          ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sprint Operations Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-650 text-white shadow-md shadow-indigo-500/20">
              <FlameKindling className="h-4.5 w-4.5" />
            </div>
            Weekly Sprint details
          </h1>
          <p className="text-slate-450 text-xs font-bold mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Timeframe: <span className="text-slate-700">{weekRangeStr}</span></span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1" />
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[9px] uppercase tracking-wider">
              Sprint Active
            </span>
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                viewMode === 'board' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Sprint Board</span>
            </button>
            <button
              onClick={() => setViewMode('sheet')}
              className={cn(
                "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                viewMode === 'sheet' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          STATS RIBBON
          ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* SVG Progress Circle Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex items-center gap-5 shadow-3xs">
          <div className="relative flex h-20 w-20 items-center justify-center shrink-0">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#f1f5f9" strokeWidth="5.5" />
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="url(#indigoGrad)"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 25}
                strokeDashoffset={2 * Math.PI * 25 - (completionPercentage / 100) * 2 * Math.PI * 25}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-sm font-black text-slate-800">{completionPercentage}%</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Weekly Progress</p>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">
              {completionPercentage === 100 ? "Sprint Finished! 🎉" : "Almost there"}
            </h3>
            <p className="text-slate-450 text-[11px] font-semibold mt-1">
              {completedItems} of {totalItems} items completed
            </p>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-3xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center text-indigo-650 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Sprint Tasks</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{completedTasksCount} / {totalTasksCount}</h3>
            <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Issues resolved */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-3xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100/30 flex items-center justify-center text-emerald-600 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Resolved Issues</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{resolvedIssuesCount} / {totalIssuesCount}</h3>
            <div className="w-24 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${totalIssuesCount > 0 ? (resolvedIssuesCount / totalIssuesCount) * 100 : 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hours Logged */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-3xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-100/30 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Sprint Hours</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{totalLoggedHours}h</h3>
            <p className="text-[11px] font-semibold text-slate-450 mt-1">Logged work time</p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          FILTERS RIBBON
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-3xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sprint work..."
              className="w-full bg-slate-50 border border-slate-205 rounded-2xl py-2 pl-10 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-450 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Project Filter */}
          <div className="relative w-full sm:w-48">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-205 rounded-2xl py-2.5 px-3.5 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative w-full sm:w-40">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-205 rounded-2xl py-2.5 px-3.5 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Tasks">Tasks Only</option>
              <option value="Issues">Issues Only</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="text-xs font-bold text-slate-450 shrink-0">
          Showing <span className="text-slate-800">{filteredSprintItems.length}</span> items
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          VIEW LAYOUT CONTENT
          ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold text-xs animate-pulse">
          Loading sprint information...
        </div>
      ) : filteredSprintItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 py-16 px-4 text-center shadow-3xs">
          <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">No active sprint items</h3>
          <p className="text-xs text-slate-450 font-semibold mt-1 max-w-sm mx-auto">
            Try resetting your search query or filters. Tasks or issues must have a due date in the current calendar week or be overdue to appear in the weekly sprint.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        
        /* ────────────────────────────────────────────────────────
            BOARD KANBAN VIEW
            ──────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {columns.map(col => {
            const colItems = filteredSprintItems.filter(item => item.status === col);
            return (
              <div 
                key={col} 
                onDragOver={(e) => handleDragOver(e, col)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col)}
                className={cn(
                  "p-4 rounded-3xl flex flex-col min-h-[450px] transition-all border", 
                  draggedOverCol === col ? "bg-indigo-50/50 border-indigo-300 border-dashed" : "bg-slate-50 border-slate-200"
                )}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-black text-slate-800 tracking-tight">{col}</span>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[9px] font-black text-slate-500 shadow-3xs">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3.5 overflow-y-auto no-scrollbar">
                  {colItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, item.id, item.itemType)}
                      className="bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-2xl shadow-3xs cursor-pointer select-none transition-all hover:shadow-md hover:-translate-y-0.5 group active:opacity-60"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase tracking-wider",
                          item.itemType === 'task' ? "bg-indigo-50 text-indigo-650 border border-indigo-100/30" : "bg-rose-50 text-rose-600 border border-rose-100/30"
                        )}>
                          {item.itemType === 'task' ? 'Task' : `Issue: ${item.type || 'Bug'}`}
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider",
                          item.priority === 'Urgent' || item.priority === 'Critical' ? "text-rose-600" :
                          item.priority === 'High' ? "text-amber-500" : "text-slate-400"
                        )}>
                          {item.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug group-hover:text-indigo-650 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      
                      <p className="text-[10px] text-slate-450 font-bold mt-1 flex items-center gap-1 truncate">
                        <Folder className="h-3 w-3 text-slate-400" />
                        <span>{item.projectName}</span>
                      </p>

                      <div className="border-t border-slate-100/80 pt-3 mt-3 flex items-center justify-between">
                        {/* Due date */}
                        <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span className={cn(
                            new Date(item.dueDate) < new Date(monday) && item.status !== 'Done' ? "text-rose-600 font-black" : ""
                          )}>
                            {item.dueDate === 'No Due Date' ? 'No Due Date' : new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Assignees initials circle */}
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {item.assignees.map((a, idx) => (
                            <div
                              key={idx}
                              title={a.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(a);
                              }}
                              className={cn(
                                "h-5.5 w-5.5 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs cursor-pointer hover:scale-110 transition-transform",
                                a.bg || "bg-indigo-600"
                              )}
                            >
                              {a.initials}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* ────────────────────────────────────────────────────────
            SPREADSHEET TABLE VIEW
            ──────────────────────────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Type</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Title</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Project</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Assignees</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Priority</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Due Date</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450">Status</th>
                  <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-450 text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSprintItems.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase tracking-wider shrink-0",
                        item.itemType === 'task' ? "bg-indigo-50 text-indigo-650 border border-indigo-100/30" : "bg-rose-50 text-rose-600 border border-rose-100/30"
                      )}>
                        {item.itemType === 'task' ? 'Task' : 'Issue'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-black text-slate-800 group-hover:text-indigo-650 transition-colors tracking-tight">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500">
                      {item.projectName}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center -space-x-1 overflow-hidden">
                        {item.assignees.map((a, idx) => (
                          <div
                            key={idx}
                            title={a.name}
                            className={cn(
                              "h-5 w-5 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs",
                              a.bg || "bg-indigo-600"
                            )}
                          >
                            {a.initials}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[9px] font-black uppercase tracking-wider">
                      <span className={cn(
                        item.priority === 'Urgent' || item.priority === 'Critical' ? "text-rose-600" :
                        item.priority === 'High' ? "text-amber-500" : "text-slate-400"
                      )}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500">
                      <span className={cn(
                        new Date(item.dueDate) < new Date(monday) && item.status !== 'Done' ? "text-rose-600 font-black" : ""
                      )}>
                        {item.dueDate === 'No Due Date' ? 'No Due Date' : new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border",
                        item.status === 'Done' ? "bg-emerald-50 text-emerald-600 border-emerald-100/30" :
                        item.status === 'In Review' ? "bg-amber-50 text-amber-600 border-amber-100/30" :
                        item.status === 'In Progress' ? "bg-indigo-50 text-indigo-650 border-indigo-100/30" :
                        "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-xs font-bold text-slate-700">
                      {item.actualHours || 0}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          TEAM WORKLOAD ANALYTICS
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-3xs space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-indigo-600" />
            Sprint Workload Distribution
          </h2>
          <p className="text-[11px] text-slate-450 font-semibold mt-0.5">Tasks & Issues assigned and resolved per team member</p>
        </div>

        {memberAnalytics.length === 0 ? (
          <div className="py-6 text-center text-slate-400 font-semibold text-xs">
            No workload metrics currently logged.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberAnalytics.map((m, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedEmployee(m)}
                className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-xs text-white font-extrabold shadow-3xs group-hover:scale-105 transition-transform", m.bg || "bg-indigo-600")}>
                    {m.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight group-hover:text-indigo-650 transition-colors">{m.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.role || 'Employee'}</p>
                  </div>
                </div>

                <div className="mt-4.5 space-y-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-450">Completion</span>
                    <span className="text-slate-800">{m.pct}% ({m.completedCount}/{m.assignedCount})</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", m.pct === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          PROMPT MODAL: LOG HOURS FOR RESOLVED ITEMS
          ──────────────────────────────────────────────────────── */}
      {showHoursModal && hoursModalTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Log Resolution Hours</h3>
                <p className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">Record hours spent</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              How many actual hours did you spend to solve this {hoursModalTarget.type}?
            </p>

            <input
              type="number"
              value={inputHours}
              onChange={(e) => setInputHours(e.target.value)}
              placeholder="e.g. 4.5"
              step="0.5"
              min="0"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
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
                  {activeDetailItem.description && (
                    <p className="text-xs font-semibold text-slate-450 leading-relaxed mt-2 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
                      {activeDetailItem.description}
                    </p>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4 space-y-4 shadow-3xs">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</label>
                      <div className="relative">
                        <select
                          value={activeDetailItem.status}
                          onChange={(e) => handleUpdateStatus(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer shadow-3xs"
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
                              <option value="To Do">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="In Review">Resolved</option>
                              <option value="Done">Closed</option>
                            </>
                          )}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                      <div className="relative">
                        <select
                          value={activeDetailItem.priority === 'Critical' ? 'Urgent' : activeDetailItem.priority}
                          onChange={(e) => handleUpdatePriority(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer shadow-3xs"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Critical / Urgent</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Due Date */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          dir="rtl"
                          value={activeDetailItem.dueDate && activeDetailItem.dueDate !== 'No Due Date' ? activeDetailItem.dueDate : ''}
                          onChange={(e) => handleUpdateTargetDate(e.target.value)}
                          onClick={(e) => {
                            try {
                              e.currentTarget.showPicker();
                            } catch (err) {}
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer shadow-3xs h-9"
                        />
                      </div>
                    </div>

                    {/* Logged Hours */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Logged Hours</label>
                      <div>
                        {isEditingHours ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={tempHours}
                              onChange={(e) => setTempHours(e.target.value)}
                              className="w-20 bg-white border border-slate-200 rounded-xl py-1 px-3 text-xs font-bold text-slate-700 focus:outline-none shadow-3xs h-9"
                            />
                            <button
                              onClick={handleSaveHoursValue}
                              className="bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl px-3 py-1.5 text-[10px] font-black shadow-3xs cursor-pointer h-9 shrink-0 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsEditingHours(true)}
                            className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none shadow-3xs flex items-center justify-between cursor-pointer h-9 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 text-slate-650">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {activeDetailItem.actualHours || 0} hours
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assignees</h3>
                  <div className="flex flex-wrap gap-2">
                    {(!activeDetailItem.assignees || activeDetailItem.assignees.length === 0) ? (
                      <span className="text-xs font-semibold text-slate-400">Unassigned</span>
                    ) : (
                      activeDetailItem.assignees.map((a: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl shadow-3xs text-xs font-bold text-slate-700">
                          <div className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs", a.bg || "bg-indigo-600")}>
                            {a.initials}
                          </div>
                          <span>{a.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subtask Checklist */}
                {activeDetailItem.itemType === 'task' && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-655 flex items-center gap-1.5 pb-1 font-sans">
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
                          activeDetailItem.subtasks.map((sub: any) => (
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
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-655 flex items-center gap-1.5 pb-1 font-sans">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-650" />
                    Discussion ({activeDetailItem.comments?.length || 0})
                  </h3>

                  {/* Input comment field */}
                  <div className="flex gap-3 items-start">
                    <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs mt-1 bg-indigo-600")}>
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'DU'}
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
                    {activeDetailItem.comments?.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3 bg-slate-50/65 border border-slate-100 p-3.5 rounded-2xl shadow-3xs">
                        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs bg-indigo-600")}>
                          {comment.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{comment.author}</span>
                            <span className="text-[9px] text-slate-400 font-bold">{comment.time}</span>
                          </div>
                          <p className="text-xs text-slate-650 font-bold mt-1 leading-normal whitespace-pre-wrap">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-100 p-6 bg-slate-50 flex items-center justify-between shrink-0">
                <button
                  onClick={handleDeleteActiveItem}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{activeDetailItem.itemType === 'task' ? 'Delete Task' : 'Delete Issue'}</span>
                </button>
                
                <button
                  onClick={() => setActiveDetailItem(null)}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Employee Details Modal */}
      <EmployeeDetailModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        assignedItems={selectedEmployeeItems}
        onSelectWorkItem={(item) => handleItemClick(item)}
      />

    </div>
  );
}
