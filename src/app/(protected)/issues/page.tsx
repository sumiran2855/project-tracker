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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, usePermission } from '@/contexts/UserContext';

interface Member {
  name: string;
  initials: string;
  bg: string;
}

interface Project {
  id: string;
  name: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Bug' | 'Task' | 'Improvement' | 'Security';
  projectId: string;
  projectName: string;
  dueDate: string;
  assignees: Member[];
  commentsCount: number;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'SaaS Onboarding Flow' },
  { id: '2', name: 'API Authentication V2' },
  { id: '3', name: 'Corporate Marketing Site' },
  { id: '4', name: 'Mobile App Wireframes' },
];

const fallbackIssues: Issue[] = [
  {
    id: 'iss-1',
    title: 'Signup validation fails for long passwords',
    description: 'When users input password > 72 chars, the bcrypt hashing function throws an offset error.',
    status: 'In Progress',
    priority: 'Critical',
    type: 'Bug',
    projectId: '1',
    projectName: 'SaaS Onboarding Flow',
    dueDate: '2026-07-15',
    assignees: [
      { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
    ],
    commentsCount: 5,
  },
  {
    id: 'iss-2',
    title: 'OAuth signature mismatch on mobile clients',
    description: 'iOS clients send an incorrect redirect URI leading to standard OAuth validation failures.',
    status: 'Open',
    priority: 'High',
    type: 'Security',
    projectId: '2',
    projectName: 'API Authentication V2',
    dueDate: '2026-07-18',
    assignees: [
      { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
    ],
    commentsCount: 12,
  },
  {
    id: 'iss-3',
    title: 'Responsive navigation overlaps on tablet viewports',
    description: 'Header menus overlap logo elements at widths between 768px and 1024px.',
    status: 'Resolved',
    priority: 'Medium',
    type: 'Bug',
    projectId: '3',
    projectName: 'Corporate Marketing Site',
    dueDate: '2026-07-10',
    assignees: [
      { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
    ],
    commentsCount: 2,
  },
  {
    id: 'iss-4',
    title: 'Missing dark mode colors on dashboard settings modal',
    description: 'Background stays white in dark theme configuration rendering text completely invisible.',
    status: 'Closed',
    priority: 'Low',
    type: 'Improvement',
    projectId: '1',
    projectName: 'SaaS Onboarding Flow',
    dueDate: '2026-07-28',
    assignees: [
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
    ],
    commentsCount: 0,
  }
];

const availableMembers: Member[] = [
  { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
];

export default function IssuesPage() {
  const { user } = useUser();
  const canDeleteIssue = usePermission('issue:delete');

  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newStatus, setNewStatus] = useState<Issue['status']>('Open');
  const [newPriority, setNewPriority] = useState<Issue['priority']>('Medium');
  const [newType, setNewType] = useState<Issue['type']>('Bug');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignees, setNewAssignees] = useState<string[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    // Attempt to load projects
    const storedProjects = localStorage.getItem('pwt_projects');
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects);
        if (parsed.length > 0) {
          setProjects(parsed.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load Issues
    const storedIssues = localStorage.getItem('pwt_issues');
    if (storedIssues) {
      try {
        setIssues(JSON.parse(storedIssues));
      } catch (e) {
        console.error(e);
      }
    } else {
      setIssues(fallbackIssues);
      localStorage.setItem('pwt_issues', JSON.stringify(fallbackIssues));
    }
  }, []);

  const saveIssues = (updatedIssues: Issue[]) => {
    setIssues(updatedIssues);
    localStorage.setItem('pwt_issues', JSON.stringify(updatedIssues));
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProject) return;

    const targetProject = projects.find(p => p.id === newProject);
    const assignees = availableMembers.filter(m => newAssignees.includes(m.name));

    const newIssue: Issue = {
      id: `iss-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
      type: newType,
      projectId: newProject,
      projectName: targetProject ? targetProject.name : 'Unknown Project',
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      assignees: assignees.length > 0 ? assignees : [availableMembers[0]],
      commentsCount: 0
    };

    const updated = [newIssue, ...issues];
    saveIssues(updated);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewProject('');
    setNewStatus('Open');
    setNewPriority('Medium');
    setNewType('Bug');
    setNewDueDate('');
    setNewAssignees([]);
    setIsModalOpen(false);
  };

  const handleDeleteIssue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this issue?')) {
      const updated = issues.filter(iss => iss.id !== id);
      saveIssues(updated);
    }
  };

  const handleToggleStatus = (issue: Issue, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: Issue['status'] = issue.status === 'Resolved' ? 'Open' : 'Resolved';
    const updated = issues.map(iss => iss.id === issue.id ? { ...iss, status: nextStatus } : iss);
    saveIssues(updated);
  };

  // Filter Issues
  const filteredIssues = issues.filter(iss => {
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
              if (projects.length > 0) {
                setNewProject(projects[0].id);
              }
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
                  className="group relative flex flex-col md:grid md:grid-cols-[1.5fr_180px_100px_100px_100px_96px_40px] md:items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 cursor-default transition-all duration-200 hover:-translate-y-px overflow-hidden animate-fadeIn"
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

      {/* modal - Add Issue Modal */}     {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 md:space-y-6 space-y-4 animate-scaleIn max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30">
                  <Bug className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Add New Issue</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateIssue} className="flex-1 flex flex-col min-h-0">
              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-2 -mr-2 min-h-0">
                {/* Project Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Destination Project</label>
                  <div className="relative">
                    <select
                      required
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      <option value="" disabled>Select project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Issue Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signature mismatch in custom auth endpoint"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-805 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description / Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe logs, environment, and replication steps..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-805 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                  />
                </div>

                {/* Type, Priority & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Type</label>
                    <div className="relative">
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as Issue['type'])}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                      >
                        <option value="Bug">Bug</option>
                        <option value="Security">Security</option>
                        <option value="Improvement">Improvement</option>
                        <option value="Task">Task</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                    <div className="relative">
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as Issue['priority'])}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</label>
                    <div className="relative">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as Issue['status'])}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Team Members</label>
                  <div className="flex flex-wrap gap-2.5">
                    {availableMembers.map((member) => {
                      const isSelected = newAssignees.includes(member.name);
                      return (
                        <button
                          key={member.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewAssignees(newAssignees.filter(m => m !== member.name));
                            } else {
                              setNewAssignees([...newAssignees, member.name]);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-200 cursor-pointer",
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-3xs ring-1 ring-indigo-200/50"
                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300 shadow-3xs"
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
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
                >
                  Create Issue
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
