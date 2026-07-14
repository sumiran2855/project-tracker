'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePermission } from '@/contexts/UserContext';
import { 
  Folder, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Paperclip, 
  Calendar,
  X,
  Sparkles,
  TrendingUp,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'SaaS Onboarding Flow',
    description: 'Redesign and polish the signup and onboarding screens to reduce user drop-offs.',
    status: 'In Progress',
    progress: 65,
    tags: ['Design', 'UX Research'],
    tasksCount: 12,
    completedTasks: 8,
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
    tasksCount: 18,
    completedTasks: 16,
    commentsCount: 18,
    attachmentsCount: 6,
    dueDate: '2026-07-18',
    members: [
      { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
    ],
  },
  {
    id: '3',
    name: 'Corporate Marketing Site',
    description: 'Build and launch the new Tailwind-based marketing website with responsive assets.',
    status: 'In Progress',
    progress: 40,
    tags: ['Marketing', 'Frontend'],
    tasksCount: 10,
    completedTasks: 4,
    commentsCount: 8,
    attachmentsCount: 2,
    dueDate: '2026-08-05',
    members: [
      { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
      { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
    ],
  },
  {
    id: '4',
    name: 'Mobile App Wireframes',
    description: 'Create low-fidelity layout plans for the React Native iOS/Android clients.',
    status: 'Completed',
    progress: 100,
    tags: ['UX Design', 'Mobile'],
    tasksCount: 8,
    completedTasks: 8,
    commentsCount: 32,
    attachmentsCount: 12,
    dueDate: '2026-06-30',
    members: [
      { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
      { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
    ],
  },
  {
    id: '5',
    name: 'Billing & Stripe Integration',
    description: 'Integrate Stripe subscriptions, webhooks, and invoice generation flows.',
    status: 'Planning',
    progress: 15,
    tags: ['Backend', 'Finance'],
    tasksCount: 20,
    completedTasks: 3,
    commentsCount: 2,
    attachmentsCount: 1,
    dueDate: '2026-08-20',
    members: [
      { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
      { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
    ],
  },
  {
    id: '6',
    name: 'Realtime Analytics Dash',
    description: 'Setup Postgres timescaledb queries and display charts for active workspace metrics.',
    status: 'Planning',
    progress: 0,
    tags: ['Core API', 'Analytics'],
    tasksCount: 6,
    completedTasks: 0,
    commentsCount: 0,
    attachmentsCount: 0,
    dueDate: '2026-09-10',
    members: [
      { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
    ],
  },
];

const availableMembers: Member[] = [
  { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
  { name: 'Oliver Twist', initials: 'OT', bg: 'bg-amber-500' },
];

export default function ProjectsPage() {
  const canCreateProject = usePermission('project:create');
  const canDeleteProject = usePermission('project:delete');

  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<Project['status']>('Planning');
  const [newProjTags, setNewProjTags] = useState('');
  const [newProjDueDate, setNewProjDueDate] = useState('');
  const [newProjMembers, setNewProjMembers] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pwt_projects');
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse projects from localStorage', e);
      }
    }
  }, []);

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('pwt_projects', JSON.stringify(updatedProjects));
  };

  // Calculate stats
  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inReviewCount = projects.filter(p => p.status === 'In Review').length;
  const planningCount = projects.filter(p => p.status === 'Planning').length;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const selectedMembers = availableMembers.filter(m => newProjMembers.includes(m.name));

    const newProject: Project = {
      id: String(Date.now()),
      name: newProjName,
      description: newProjDesc,
      status: newProjStatus,
      progress: newProjStatus === 'Completed' ? 100 : newProjStatus === 'Planning' ? 0 : 10,
      tags: newProjTags.split(',').map(t => t.trim()).filter(Boolean),
      tasksCount: 0,
      completedTasks: 0,
      commentsCount: 0,
      attachmentsCount: 0,
      dueDate: newProjDueDate || 'No Due Date',
      members: selectedMembers.length > 0 ? selectedMembers : [availableMembers[0]],
    };

    const updated = [newProject, ...projects];
    saveProjects(updated);

    // Reset Form & Close Modal
    setNewProjName('');
    setNewProjDesc('');
    setNewProjStatus('Planning');
    setNewProjTags('');
    setNewProjDueDate('');
    setNewProjMembers([]);
    setIsModalOpen(false);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking delete
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter(p => p.id !== id);
      saveProjects(updated);
    }
  };

  // Filter & Sort Projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    } else if (sortBy === 'dueDate') {
      if (a.dueDate === 'No Due Date') return 1;
      if (b.dueDate === 'No Due Date') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const getStatusStyles = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'Planning':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'No Due Date') return 'No Due Date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 shadow-xs border border-indigo-100/30">
              <Folder className="h-5 w-5" />
            </div>
            Project Hub
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1">
            Manage, schedule, and track all ongoing corporate initiative pipelines.
          </p>
        </div>

        {/* Create Project Trigger */}
        {canCreateProject && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tracks', value: totalProjects,    icon: FolderOpen,   tint: '#64748b' },
          { label: 'In Progress',  value: inProgressCount, icon: Clock,         tint: '#6366f1' },
          { label: 'In Review',    value: inReviewCount,   icon: TrendingUp,    tint: '#f59e0b' },
          { label: 'Planning',     value: planningCount,   icon: AlertCircle,   tint: '#3b82f6' },
          { label: 'Completed',    value: completedCount,  icon: CheckCircle2,  tint: '#10b981' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 cursor-default transition-all duration-300 hover:-translate-y-px",
                idx === 4 && "col-span-2 lg:col-span-1"
              )}
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  `0 6px 16px -4px ${stat.tint}18, 0 2px 6px -2px ${stat.tint}10`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
              }}
            >
              {/* Radial tint wash on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at top right, ${stat.tint}09 0%, transparent 70%)` }}
              />

              {/* Icon */}
              <div className="relative">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${stat.tint}20, ${stat.tint}0d)`,
                    border: `1px solid ${stat.tint}28`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.tint }} />
                </div>
              </div>

              {/* Value + label + accent */}
              <div className="relative mt-5">
                <p
                  className="text-[28px] font-black leading-none tracking-tight text-slate-800"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {stat.label}
                </p>
                <div
                  className="mt-3 h-0.5 w-8 rounded-full opacity-40 group-hover:w-11 transition-all duration-500"
                  style={{ backgroundColor: stat.tint }}
                />
              </div>
            </div>
          );
        })}
      </div>


      {/* Filter and Sorting Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, description, tags..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-600 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="name">Sort by Name</option>
            <option value="progress">Sort by Progress</option>
            <option value="dueDate">Sort by Due Date</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No projects found</h3>
          <p className="text-xs text-slate-450 max-w-sm">
            Try adjusting your search criteria, filter, or create a brand new project tracker.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col justify-between bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-lg hover:border-slate-350 transition-all duration-350 p-6 relative overflow-hidden"
            >
              {/* Corner decoration gradient */}
              <span className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border", getStatusStyles(project.status))}>
                    {project.status}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(project.dueDate)}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-450 font-medium leading-relaxed mt-2 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-slate-50 text-slate-500 border border-slate-200/60 px-2 py-0.5 text-[9px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Footer Section */}
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                  <span>Task Progress</span>
                  <span>
                    {project.completedTasks}/{project.tasksCount} ({project.progress}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4 relative">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      project.status === 'Completed'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : project.status === 'In Review'
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                        : 'bg-indigo-650 shadow-[0_0_8px_rgba(79,70,229,0.3)]'
                    )}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                {/* Footer stack */}
                <div className="flex items-center justify-between">
                  {/* Avatars */}
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members.map((member, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-xl text-[9px] font-extrabold text-white ring-2 ring-white shadow-xs shrink-0",
                          member.bg
                        )}
                        title={member.name}
                      >
                        {member.initials}
                      </div>
                    ))}
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex items-center gap-3.5 text-slate-400">
                    <div className="flex items-center gap-1.2 text-[10px] font-bold" title="Comments">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{project.commentsCount}</span>
                    </div>
                    <div className="flex items-center gap-1.2 text-[10px] font-bold" title="Attachments">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>{project.attachmentsCount}</span>
                    </div>
                    
                    {canDeleteProject && (
                      <button 
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-1"
                        title="Delete Project"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      </div>

      {/* Modal - New Project Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30">
                  <Folder className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Add New Initiative</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProject} className="space-y-5">
              
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe Integration V2"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the main milestones and goals..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                />
              </div>

              {/* Status & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Initial Status</label>
                  <div className="relative">
                    <select
                      value={newProjStatus}
                      onChange={(e) => setNewProjStatus(e.target.value as Project['status'])}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={newProjDueDate}
                    onChange={(e) => setNewProjDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend, Billing, Design"
                  value={newProjTags}
                  onChange={(e) => setNewProjTags(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>

              {/* Members selection */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Team Members</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableMembers.map((member) => {
                    const isSelected = newProjMembers.includes(member.name);
                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewProjMembers(newProjMembers.filter(m => m !== member.name));
                          } else {
                            setNewProjMembers([...newProjMembers, member.name]);
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

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                  Create Project
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </>
  );
}
