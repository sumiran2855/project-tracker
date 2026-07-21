'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Bug,
  Search,
  Filter,
  MessageSquare,
  Plus,
  Clock,
  Calendar,
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Folder,
  Tag,
  ChevronDown,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, usePermission } from '@/contexts/UserContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import { getProjectsAction, getEmployeesAction, type Employee, type Member } from '@/actions/projects';
import { getIssuesByProjectAction, createIssueAction, updateIssueAction, deleteIssueAction, type Issue } from '@/actions/issues';
import { AddIssueModal } from '@/components/dashboard/AddIssueModal';

interface Project {
  id: string;
  name: string;
}

const defaultProjects: Project[] = [];

const fallbackIssues: Issue[] = [];

export default function IssuesPage() {
  const { user } = useUser();
  const canDeleteIssue = usePermission('issue:delete');

  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [issueToDeleteId, setIssueToDeleteId] = useState<string | null>(null);

  // Detailed Drawer States
  const [activeDetailItem, setActiveDetailItem] = useState<any | null>(null);
  const [tempHours, setTempHours] = useState('0');
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Load from LocalStorage
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

  // Open card details drawer
  const handleCardClick = (issue: Issue) => {
    const issueCommentsKey = `pwt_comments_issue_${issue.id}`;
    let savedComments: any[] = [];
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

  const handleSaveHoursValue = async () => {
    if (!activeDetailItem) return;
    const numHours = parseFloat(tempHours) || 0;
    const res = await updateIssueAction(activeDetailItem.id, { actualHours: numHours } as any);
    if (res.success && res.data) {
      setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: numHours } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, actualHours: numHours } as any : i));
      setIsEditingHours(false);
    } else {
      setActiveDetailItem((prev: any) => prev ? { ...prev, actualHours: numHours } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, actualHours: numHours } as any : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
      setIsEditingHours(false);
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

    const res = await updateIssueAction(activeDetailItem.id, { commentsCount: nextComments.length });
    if (res.success) {
      localStorage.setItem(`pwt_comments_issue_${activeDetailItem.id}`, JSON.stringify(nextComments));
      setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments } : null);
      setIssues(prev => prev.map(i => i.id === activeDetailItem.id ? { ...i, commentsCount: nextComments.length } : i));
      setNewCommentText('');
    } else {
      localStorage.setItem(`pwt_comments_issue_${activeDetailItem.id}`, JSON.stringify(nextComments));
      setActiveDetailItem((prev: any) => prev ? { ...prev, comments: nextComments } : null);
      const updated = issues.map(i => i.id === activeDetailItem.id ? { ...i, commentsCount: nextComments.length } : i);
      setIssues(updated);
      localStorage.setItem('pwt_issues', JSON.stringify(updated));
      setNewCommentText('');
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

  const getPriorityColor = (prio: Issue['priority']) => {
    switch (prio) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200/50';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'Medium': return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-200/50';
    }
  };

  const getTypeStyle = (type: Issue['type']) => {
    switch (type) {
      case 'Bug': return 'bg-red-100 text-red-800 border-red-200';
      case 'Security': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Improvement': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace Tracking</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30 shadow-xs">
                <Bug className="h-4.5 w-4.5" />
              </div>
              Issues Tracker
            </h1>
            <p className="text-xs text-slate-450 font-medium mt-1">
              Log, assign, and track technical bugs, security findings, and roadmap improvements.
            </p>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Issue</span>
          </button>
        </div>

        {/* Stats Counter Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Issues', value: totalCount, icon: AlertCircle, tint: '#64748b' },
            { label: 'Critical Bugs', value: criticalCount, icon: Bug, tint: '#ef4444' },
            { label: 'In Progress', value: inProgressCount, icon: Clock, tint: '#6366f1' },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, tint: '#10b981' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
                style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 6px 16px -4px ${s.tint}18, 0 2px 6px -2px ${s.tint}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
                }}
              >
                {/* Radial wash */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at top right, ${s.tint}09 0%, transparent 70%)` }}
                />

                {/* Icon */}
                <div className="relative">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${s.tint}20, ${s.tint}0d)`,
                      border: `1px solid ${s.tint}28`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.tint }} />
                  </div>
                </div>

                {/* Text details */}
                <div className="relative mt-5">
                  <p
                    className="text-[28px] font-black leading-none tracking-tight text-slate-800"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {s.label}
                  </p>
                  <div
                    className="mt-3 h-0.5 w-8 rounded-full opacity-40 group-hover:w-11 transition-all duration-500"
                    style={{ backgroundColor: s.tint }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">

          {/* Search */}
          <div className="relative w-full xl:flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issue title or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
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
                <option value="Critical">Critical</option>
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
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

        </div>

        {/* Issues list cards */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-slate-350" />
              <p className="text-xs font-bold text-slate-400">No issues found. Try widening filters or create a new issue.</p>
            </div>
          ) : (
            filteredIssues.map(issue => {
              const priorityAccent: Record<string, string> = {
                Critical: '#ef4444', High: '#f97316', Medium: '#6366f1', Low: '#94a3b8'
              };
              const accent = priorityAccent[issue.priority] ?? '#94a3b8';

              return (
                <div
                  key={issue.id}
                  onClick={() => handleCardClick(issue)}
                  className="group relative flex flex-col md:grid md:grid-cols-[1.5fr_180px_100px_100px_100px_96px_40px] md:items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 cursor-pointer transition-all duration-200 hover:-translate-y-px overflow-hidden animate-fadeIn"
                  style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 14px -4px ${accent}22`}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.04)'}
                >
                  {/* Left accent stripe */}
                  <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />

                  {/* Mobile Card Layout */}
                  <div className="flex flex-col gap-2.5 md:hidden w-full pl-2">
                    {/* Header row: Checkbox, Title, Delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          onClick={e => handleToggleStatus(issue, e)}
                          className={cn(
                            'mt-0.5 h-4.5 w-4.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer',
                            issue.status === 'Resolved' || issue.status === 'Closed'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white hover:border-indigo-455'
                          )}
                        >
                          {(issue.status === 'Resolved' || issue.status === 'Closed') && <span className="text-[8px] font-black">✓</span>}
                        </button>
                        <div className="min-w-0">
                          <p className={cn(
                            'text-xs font-bold text-slate-800 transition-colors break-words',
                            (issue.status === 'Resolved' || issue.status === 'Closed') && 'line-through text-slate-400'
                          )}>
                            {issue.title}
                          </p>
                        </div>
                      </div>
                      {canDeleteIssue && (
                        <button
                          onClick={e => handleDeleteIssue(issue.id, e)}
                          className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                          title="Delete Issue"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    {issue.description && (
                      <p className="text-[10px] text-slate-550 pl-7 leading-normal line-clamp-2">
                        {issue.description}
                      </p>
                    )}

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pl-7 pt-1">
                      {/* Project tag */}
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100/30 rounded-lg px-2 py-0.5 max-w-[120px]">
                        <Folder className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{issue.projectName}</span>
                      </span>

                      {/* Status */}
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border',
                        issue.status === 'Resolved' || issue.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                          issue.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100/50' :
                            'bg-slate-50 text-slate-500 border-slate-200/50'
                      )}>
                        <span className="h-1.2 w-1.2 rounded-full bg-current" />
                        {issue.status}
                      </span>

                      {/* Priority */}
                      <span className={cn('inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border', getPriorityColor(issue.priority))}>
                        {issue.priority}
                      </span>

                      {/* Type Tag */}
                      <span className={cn('inline-flex rounded-lg px-2 py-0.5 text-[9px] font-bold border', getTypeStyle(issue.type))}>
                        {issue.type}
                      </span>

                      {/* Assignees */}
                      {issue.assignees && issue.assignees.length > 0 && (
                        <div className="flex -space-x-1 ml-auto shrink-0">
                          {issue.assignees.map((a, idx) => (
                            <div key={idx} title={a.name}
                              className={cn('h-5.5 w-5.5 rounded-lg text-[6px] font-bold text-white flex items-center justify-center ring-2 ring-white shrink-0 shadow-3xs', a.bg)}
                            >
                              {a.initials}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop View Row (rendered inside display: contents parent grid) */}
                  <div className="hidden md:contents">
                    {/* Title & description */}
                    <div className="flex items-start gap-3 min-w-0 pl-2">
                      <button
                        onClick={e => handleToggleStatus(issue, e)}
                        className={cn(
                          'mt-0.5 h-4.5 w-4.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer',
                          issue.status === 'Resolved' || issue.status === 'Closed'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 bg-white hover:border-indigo-455'
                        )}
                      >
                        {(issue.status === 'Resolved' || issue.status === 'Closed') && <span className="text-[8px] font-black">✓</span>}
                      </button>
                      <div className="min-w-0">
                        <p className={cn(
                          'text-xs font-bold text-slate-800 group-hover:text-indigo-650 transition-colors truncate',
                          (issue.status === 'Resolved' || issue.status === 'Closed') && 'line-through text-slate-400'
                        )}>
                          {issue.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-normal max-w-lg">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    {/* Project */}
                    <span className="text-[10px] font-bold text-indigo-650 truncate">
                      {issue.projectName}
                    </span>

                    {/* Status */}
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold border w-fit',
                      issue.status === 'Resolved' || issue.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                        issue.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100/50' :
                          'bg-slate-50 text-slate-500 border-slate-200/50'
                    )}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {issue.status}
                    </span>

                    {/* Priority */}
                    <span className={cn('inline-flex rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider border w-fit', getPriorityColor(issue.priority))}>
                      {issue.priority}
                    </span>

                    {/* Type Tag */}
                    <span className={cn('inline-flex rounded-lg px-2 py-1 text-[9px] font-bold border w-fit', getTypeStyle(issue.type))}>
                      {issue.type}
                    </span>

                    {/* Assignees */}
                    <div className="flex -space-x-1.5">
                      {issue.assignees.map((a, idx) => (
                        <div key={idx} title={a.name}
                          className={cn('h-6 w-6 rounded-lg text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shrink-0', a.bg)}
                        >
                          {a.initials}
                        </div>
                      ))}
                    </div>

                    {/* Delete */}
                    {canDeleteIssue && (
                      <button
                        onClick={e => handleDeleteIssue(issue.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete Issue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* modal - Add Issue Modal */}
      <AddIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projects={projects}
        availableMembers={availableMembers}
        onSuccess={handleIssueSuccess}
      />

      {/* modal - Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-7 space-y-5 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-655 border border-red-100/30">
                  <Trash2 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Delete Issue</h3>
              </div>
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Are you sure you want to delete this issue? This action is permanent and cannot be undone.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-655 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteIssue}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-750 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                Delete
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
                    Issue Workspace Details
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
                          onChange={(e) => handleUpdateStatus(e.target.value as any)}
                          className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                      <div className="relative">
                        <select
                          value={activeDetailItem.priority}
                          onChange={(e) => handleUpdatePriority(e.target.value as any)}
                          className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Type */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Type</label>
                      <div className="relative">
                        <select
                          value={activeDetailItem.type}
                          onChange={(e) => handleUpdateType(e.target.value as any)}
                          className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-55 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8"
                        >
                          <option value="Bug">Bug</option>
                          <option value="Security">Security</option>
                          <option value="Improvement">Improvement</option>
                          <option value="Task">Task</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Due Date */}
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

                  {/* Logged Hours */}
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
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-150 bg-white hover:bg-slate-55 text-xs font-bold text-slate-700 shadow-3xs transition-all cursor-pointer w-36 text-left select-none"
                        >
                          <Clock className="h-4 w-4 text-indigo-550 shrink-0" />
                          <span>{activeDetailItem.actualHours || 0} hours</span>
                          <span className="text-[8px] text-slate-400 ml-auto font-bold uppercase tracking-wider">Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assignees</label>
                  <div className="flex flex-wrap gap-2">
                    {activeDetailItem.assignees && activeDetailItem.assignees.length > 0 ? (
                      activeDetailItem.assignees.map((a: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-3xs"
                        >
                          <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shrink-0 shadow-3xs", a.bg || 'bg-indigo-500')}>
                            {a.initials}
                          </div>
                          <span>{a.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic">No assignees</span>
                    )}
                  </div>
                </div>

                {/* Discussion */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5 pb-1 font-sans">
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
                  <span>Delete Issue</span>
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
    </>
  );
}
