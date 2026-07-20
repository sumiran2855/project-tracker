'use client';

import { useState, useEffect } from 'react';
import {
  Map,
  Plus,
  Search,
  Filter,
  Calendar,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FolderOpen,
  Milestone,
  ArrowRight,
  ChevronRight,
  SquareChartGantt,
  Layers,
  Edit2,
  Trash2,
  CalendarDays,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction } from '@/actions/projects';

// Interfaces
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
  startDate?: string; // Timeline support
  targetQuarter?: 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Future'; // Board support
  members: Member[];
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
}

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  projectId: string;
  completed: boolean;
  assignedTo?: string;
}

// 6 months timeline parameters
const TIMELINE_START = new Date('2026-06-01');
const TIMELINE_END = new Date('2026-11-30');
const TOTAL_TIMELINE_DAYS = 183; // Approx days in 6 months (Jun-Nov)

export default function RoadmapPage() {
  const { user } = useUser();
  const canManageRoadmap = usePermission('roadmap:manage');
  const isEmployee = user?.role === 'Employee';

  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'board' | 'milestones'>('timeline');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  // Add Milestone Form States
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('');

  // Modal States
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Add Milestone Form States
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneProject, setNewMilestoneProject] = useState('');

  // Edit Project Dates Form States
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editQuarter, setEditQuarter] = useState<Project['targetQuarter']>('Future');

  // Initialize data from backend API
  useEffect(() => {
    async function loadData() {
      const res = await getProjectsAction();
      let loadedProjects: Project[] = [];

      if (res.success && res.data) {
        loadedProjects = res.data as any[];
      } else {
        const storedProjects = localStorage.getItem('pwt_projects');
        if (storedProjects) {
          try {
            loadedProjects = JSON.parse(storedProjects);
          } catch (e) {
            console.error(e);
          }
        }
      }

      // Filter out any lingering hardcoded seed projects if user has real backend data
      const migratedProjects = loadedProjects.map((proj) => {
        const copy = { ...proj };

        if (!copy.startDate) {
          if (copy.dueDate && copy.dueDate !== 'No Due Date') {
            try {
              const due = new Date(copy.dueDate);
              due.setDate(due.getDate() - 30);
              copy.startDate = due.toISOString().split('T')[0];
            } catch {
              copy.startDate = new Date().toISOString().split('T')[0];
            }
          } else {
            copy.startDate = new Date().toISOString().split('T')[0];
          }
        }

        if (!copy.targetQuarter) {
          if (copy.dueDate && copy.dueDate !== 'No Due Date') {
            try {
              const date = new Date(copy.dueDate);
              const month = date.getMonth();
              const year = date.getFullYear();
              if (month >= 3 && month <= 5) copy.targetQuarter = `Q2 ${year}` as any;
              else if (month >= 6 && month <= 8) copy.targetQuarter = `Q3 ${year}` as any;
              else if (month >= 9 && month <= 11) copy.targetQuarter = `Q4 ${year}` as any;
              else copy.targetQuarter = 'Future';
            } catch {
              copy.targetQuarter = 'Future';
            }
          } else {
            copy.targetQuarter = 'Future';
          }
        }

        return copy;
      });

      setProjects(migratedProjects);
      localStorage.setItem('pwt_projects', JSON.stringify(migratedProjects));

      // 2. Load Milestones
      const storedMilestones = localStorage.getItem('pwt_milestones');
      let loadedMilestones: MilestoneItem[] = [];
      if (storedMilestones) {
        try {
          loadedMilestones = JSON.parse(storedMilestones);
        } catch (e) {
          console.error(e);
        }
      }
      setMilestones(loadedMilestones);
    }

    loadData();
  }, []);

  // Save states back
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('pwt_projects', JSON.stringify(updatedProjects));
  };

  const saveMilestones = (updatedMilestones: MilestoneItem[]) => {
    setMilestones(updatedMilestones);
    localStorage.setItem('pwt_milestones', JSON.stringify(updatedMilestones));
  };

  // Drag and Drop (Quarterly Columns)
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDrop = (e: React.DragEvent, targetQuarter: Project['targetQuarter']) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    // Firefox/Safari support fallback
    if (!projectId) return;

    const updated = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, targetQuarter };
      }
      return p;
    });
    saveProjects(updated);
  };

  // Drop helper for HTML5 dragover
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Add Milestone
  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !newMilestoneProject) return;

    const newMilestone: MilestoneItem = {
      id: `milestone_${Date.now()}`,
      title: newMilestoneTitle,
      description: newMilestoneDesc,
      dueDate: newMilestoneDueDate || new Date().toISOString().split('T')[0],
      projectId: newMilestoneProject,
      completed: false,
      assignedTo: newMilestoneAssignee || undefined,
    };

    saveMilestones([newMilestone, ...milestones]);

    // Reset Form
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneDueDate('');
    setNewMilestoneProject('');
    setNewMilestoneAssignee('');
    setIsMilestoneModalOpen(false);
  };

  // Toggle Milestone status
  const handleToggleMilestone = (id: string) => {
    const updated = milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
    saveMilestones(updated);
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      const updated = milestones.filter(m => m.id !== id);
      saveMilestones(updated);
    }
  };

  // Edit Project Dates
  const handleOpenEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setEditStartDate(project.startDate || '2026-07-01');
    setEditDueDate(project.dueDate || '2026-07-31');
    setEditQuarter(project.targetQuarter || 'Future');
    setIsEditProjectModalOpen(true);
  };

  const handleSaveProjectDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated = projects.map(p => {
      if (p.id === editingProject.id) {
        return {
          ...p,
          startDate: editStartDate,
          dueDate: editDueDate,
          targetQuarter: editQuarter,
        };
      }
      return p;
    });

    saveProjects(updated);
    setIsEditProjectModalOpen(false);
    setEditingProject(null);
  };

  // Scoped projects based on user role and filters
  const scopedProjects = isEmployee
    ? projects.filter(proj => proj.members.some(m => m.name === user?.name))
    : projects.filter(proj => employeeFilter === 'All' || proj.members.some(m => m.name === employeeFilter));

  // Filter calculations
  const filteredProjects = scopedProjects.filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMilestones = milestones.filter(m => {
    const matchesProject = projectFilter === 'All' || m.projectId === projectFilter;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isProjectVisible = scopedProjects.some(p => p.id === m.projectId);
    const matchesAssignee = !isEmployee || m.assignedTo === user?.name;

    return matchesProject && matchesSearch && isProjectVisible && matchesAssignee;
  });

  // KPI Statistics
  const totalInitiatives = filteredProjects.length;
  const activeQuarters = Array.from(new Set(filteredProjects.map(p => p.targetQuarter).filter(Boolean))).length;
  const completedMilestones = filteredMilestones.filter(m => m.completed).length;
  const totalMilestones = filteredMilestones.length;
  const onTrackInitiatives = filteredProjects.filter(p => p.progress >= 50 && p.status !== 'Completed').length;

  const getStatusStyles = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border-amber-250';
      case 'Planning':
        return 'bg-blue-50 text-blue-700 border-blue-250';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-250';
    }
  };

  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Build columns for the quarterly board view
  const columns: { id: Project['targetQuarter']; label: string; desc: string }[] = [
    { id: 'Q2 2026', label: 'Q2 2026', desc: 'Apr - Jun Release Goals' },
    { id: 'Q3 2026', label: 'Q3 2026', desc: 'Jul - Sep Core Milestones' },
    { id: 'Q4 2026', label: 'Q4 2026', desc: 'Oct - Dec Final Deliveries' },
    { id: 'Future', label: 'Future / Backlog', desc: 'Upcoming Roadmaps' },
  ];

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-8 w-full min-w-0">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Workspace Planning</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 shadow-xs border border-indigo-100/30">
                <Map className="h-5 w-5" />
              </div>
              Product Roadmap
            </h1>
            <p className="text-xs text-slate-455 font-medium mt-1">
              Map initiative timelines, release targets, and track milestones across the lifecycle.
            </p>
          </div>

          {/* Action button */}
          {canManageRoadmap && (
            <button
              onClick={() => {
                if (projects.length > 0) {
                  setNewMilestoneProject(projects[0].id);
                }
                setIsMilestoneModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Milestone</span>
            </button>
          )}
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Initiatives', value: totalInitiatives, icon: FolderOpen, tint: '#64748b' },
            { label: 'Active Quarters', value: activeQuarters, icon: Layers, tint: '#6366f1' },
            { label: 'Milestones Completed', value: `${completedMilestones}/${totalMilestones}`, icon: Milestone, tint: '#10b981' },
            { label: 'On Track Projects', value: onTrackInitiatives, icon: TrendingUp, tint: '#f59e0b' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
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

                {/* Value + label + accent line */}
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


        {/* Controls & Tab selector */}
        <div className="flex flex-col xl:flex-row items-center gap-4 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">

          {/* Switching Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-xl w-full xl:w-auto border border-slate-100">
            {[
              { id: 'timeline', label: 'Timeline Gantt', icon: SquareChartGantt },
              { id: 'board', label: 'Quarterly Board', icon: Layers },
              { id: 'milestones', label: 'Key Milestones', icon: Milestone },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 xl:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer",
                    active
                      ? "bg-white text-indigo-650 shadow-sm ring-1 ring-slate-200/50"
                      : "text-slate-400 hover:text-slate-650"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Global Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:flex-1">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'milestones'
                    ? "Search milestones by title, description..."
                    : "Search projects by title, description..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Conditional Dropdown filters */}
            {activeTab === 'milestones' ? (
              <div className="relative flex items-center justify-between sm:justify-start w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-slate-500 shadow-2xs shrink-0">
                <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project:</span>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="flex-1 sm:flex-initial bg-transparent text-slate-700 outline-none pr-4 py-2 cursor-pointer font-bold text-right sm:text-left"
                >
                  <option value="All">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="relative flex items-center justify-between sm:justify-start w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-slate-500 shadow-2xs shrink-0">
                <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-initial bg-transparent text-slate-700 outline-none pr-4 py-2 cursor-pointer font-bold text-right sm:text-left"
                >
                  <option value="All">All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}

            {!isEmployee && (
              <div className="relative flex items-center justify-between sm:justify-start w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-bold text-slate-500 shadow-2xs shrink-0">
                <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee:</span>
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className="flex-1 sm:flex-initial bg-transparent text-slate-700 outline-none pr-4 py-2 cursor-pointer font-bold text-right sm:text-left"
                >
                  <option value="All">All Employees</option>
                  {Array.from(new Set(projects.flatMap(p => p.members.map(m => m.name)))).map(empName => (
                    <option key={empName} value={empName}>{empName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Main Tab Views */}
        <div className="min-h-[50vh]">

          {/* 1. TIMELINE GANTT CHART VIEW */}
          {activeTab === 'timeline' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
              {filteredProjects.length === 0 ? (
                <div className="py-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <SquareChartGantt className="h-8 w-8 text-slate-300" />
                  <span>No projects matched the search criteria.</span>
                </div>
              ) : (
                <div className="w-full overflow-x-auto pb-4">
                  <div className="space-y-6 min-w-[760px]">
                    {/* Timeline Header (Months) */}
                  <div className="flex border-b border-slate-100 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest relative">
                    <div className="w-1/3 shrink-0">Initiative details</div>

                    {/* Monthly column headers */}
                    <div className="flex-1 flex justify-between relative pl-6 pr-6">
                      <span className="w-1/6 text-center">Jun 26</span>
                      <span className="w-1/6 text-center">Jul 26</span>
                      <span className="w-1/6 text-center">Aug 26</span>
                      <span className="w-1/6 text-center">Sep 26</span>
                      <span className="w-1/6 text-center">Oct 26</span>
                      <span className="w-1/6 text-center">Nov 26</span>
                    </div>
                  </div>

                  {/* Timeline grid rows */}
                  <div className="space-y-4">
                    {filteredProjects.map(project => {
                      let startDay = new Date(project.startDate || '2026-07-01');
                      let endDay = new Date(project.dueDate || '2026-07-31');

                      // Clamp to timeline range
                      let adjustedStart = new Date(Math.max(TIMELINE_START.getTime(), startDay.getTime()));
                      let adjustedEnd = new Date(Math.min(TIMELINE_END.getTime(), endDay.getTime()));

                      // If dates are invalid, fallback
                      if (isNaN(adjustedStart.getTime())) adjustedStart = new Date('2026-07-01');
                      if (isNaN(adjustedEnd.getTime())) adjustedEnd = new Date('2026-07-31');
                      if (adjustedEnd < adjustedStart) adjustedEnd = adjustedStart;

                      // Compute offsets
                      const startDiffMs = adjustedStart.getTime() - TIMELINE_START.getTime();
                      const startDiffDays = startDiffMs / (1000 * 60 * 60 * 24);

                      const spanDiffMs = adjustedEnd.getTime() - adjustedStart.getTime();
                      const spanDiffDays = spanDiffMs / (1000 * 60 * 60 * 24) + 1;

                      // Percentages
                      const leftOffsetPercent = (startDiffDays / TOTAL_TIMELINE_DAYS) * 100;
                      const widthPercent = (spanDiffDays / TOTAL_TIMELINE_DAYS) * 100;

                      // Color styles
                      const barColor =
                        project.status === 'Completed' ? 'from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                          project.status === 'In Review' ? 'from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.15)]' :
                            project.status === 'In Progress' ? 'from-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.15)]' :
                              'from-blue-400 to-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.15)]';

                      // Project linked milestones
                      const projectMilestones = milestones.filter(m => m.projectId === project.id);

                      return (
                        <div
                          key={project.id}
                          className="flex items-center hover:bg-slate-50/50 p-2.5 rounded-2xl transition-all group"
                        >
                          {/* Project title and summary info */}
                          <div className="w-1/3 shrink-0 pr-4 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-650 transition-colors">
                                {project.name}
                              </h4>
                              <button
                                onClick={() => handleOpenEditProjectModal(project)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-100 rounded-lg transition-all"
                                title="Edit Initiative Dates"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn("text-[8px] font-black uppercase tracking-wider border rounded-md px-1.5 py-0.2", getStatusStyles(project.status))}>
                                {project.status}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">
                                {project.progress}% completed ({projectMilestones.length} milestones)
                              </span>
                            </div>
                          </div>

                          {/* Gantt track */}
                          <div className="flex-1 h-12 bg-slate-50/60 rounded-2xl border border-slate-100 relative overflow-hidden pl-6 pr-6 flex items-center">
                            {/* Monthly vertical dividers */}
                            <div className="absolute inset-y-0 left-1/6 border-l border-dashed border-slate-200/40" />
                            <div className="absolute inset-y-0 left-2/6 border-l border-dashed border-slate-200/40" />
                            <div className="absolute inset-y-0 left-3/6 border-l border-dashed border-slate-200/40" />
                            <div className="absolute inset-y-0 left-4/6 border-l border-dashed border-slate-200/40" />
                            <div className="absolute inset-y-0 left-5/6 border-l border-dashed border-slate-200/40" />

                            {/* Gantt Project Duration Bar */}
                            <div
                              onClick={() => handleOpenEditProjectModal(project)}
                              className={cn(
                                "absolute h-6.5 rounded-xl bg-gradient-to-r flex items-center justify-between px-3 text-[9px] font-extrabold text-white cursor-pointer hover:scale-[1.01] hover:brightness-105 active:scale-99 transition-all shadow-xs",
                                barColor
                              )}
                              style={{
                                left: `${leftOffsetPercent}%`,
                                width: `${widthPercent}%`,
                                minWidth: '36px'
                              }}
                            >
                              <span className="truncate">{project.name}</span>
                              <span className="text-[7px] bg-white/20 px-1 rounded-md shrink-0 ml-1.5">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} - {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                              </span>
                            </div>

                            {/* Visual milestones points on the track */}
                            {projectMilestones.map(m => {
                              try {
                                const milestoneDate = new Date(m.dueDate);
                                if (milestoneDate >= TIMELINE_START && milestoneDate <= TIMELINE_END) {
                                  const diff = milestoneDate.getTime() - TIMELINE_START.getTime();
                                  const days = diff / (1000 * 60 * 60 * 24);
                                  const pct = (days / TOTAL_TIMELINE_DAYS) * 100;

                                  return (
                                    <div
                                      key={m.id}
                                      className={cn(
                                        "absolute h-2.5 w-2.5 rotate-45 border-2 ring-3 transition-all z-20 group/ms hover:scale-125",
                                        m.completed
                                          ? "bg-emerald-500 border-white ring-emerald-500/20"
                                          : "bg-white border-amber-500 ring-amber-500/20"
                                      )}
                                      style={{ left: `${pct}%`, top: 'calc(50% - 5px)' }}
                                      title={`Milestone: ${m.title} (${m.dueDate})`}
                                    />
                                  );
                                }
                              } catch { }
                              return null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            </div>
          )}

          {/* 2. QUARTERLY BOARD VIEW */}
          {activeTab === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {columns.map(col => {
                const columnProjects = filteredProjects.filter(p => p.targetQuarter === col.id);

                return (
                  <div
                    key={col.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-5 flex flex-col min-h-[400px] shadow-2xs transition-colors hover:border-slate-300"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{col.label}</h3>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">{col.desc}</p>
                      </div>
                      <span className="rounded-full bg-white border border-slate-250 text-slate-500 text-[10px] font-black px-2.5 py-0.5 shadow-3xs">
                        {columnProjects.length}
                      </span>
                    </div>

                    {/* Cards container */}
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[65vh] pr-1.5 scrollbar-thin mt-2">
                      {columnProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-extrabold text-center h-32 select-none">
                          Drag Projects Here
                        </div>
                      ) : (
                        columnProjects.map(project => {
                          const projectMilestones = milestones.filter(m => m.projectId === project.id);
                          const completedMilestonesCount = projectMilestones.filter(m => m.completed).length;

                          return (
                            <div
                              key={project.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, project.id)}
                              className="group bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative overflow-hidden"
                            >
                              <span className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                              <div className="space-y-3">
                                {/* Metadata */}
                                <div className="flex items-center justify-between">
                                  <span className={cn("rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getStatusStyles(project.status))}>
                                    {project.status}
                                  </span>
                                  <button
                                    onClick={() => handleOpenEditProjectModal(project)}
                                    className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Dates"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Project Title */}
                                <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                                  {project.name}
                                </h4>

                                <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                                  {project.description}
                                </p>

                                {/* Progress bar */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                    <span>Sprint Progress</span>
                                    <span>{project.progress}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all duration-350",
                                        project.status === 'Completed' ? 'bg-emerald-500' :
                                          project.status === 'In Review' ? 'bg-amber-500' : 'bg-indigo-600'
                                      )}
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Footer stats */}
                              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold">
                                  <Milestone className="h-3 w-3" />
                                  <span>{completedMilestonesCount}/{projectMilestones.length} Milestones</span>
                                </div>

                                <div className="flex -space-x-1.5 overflow-hidden">
                                  {project.members.filter((m: any) => m.role?.toLowerCase() !== 'admin').map((member, i) => (
                                    <div key={i} className={cn("h-5 w-5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", member.bg)} title={member.name}>
                                      {member.initials}
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

          {/* 3. KEY MILESTONES CHECKLIST VIEW */}
          {activeTab === 'milestones' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Milestone className="h-4.5 w-4.5 text-indigo-650" />
                  <h3 className="text-sm font-black text-slate-800">Workspace Milestones Checklist</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Milestones Met: {completedMilestones} / {totalMilestones} ({totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%)
                </p>
              </div>

              {filteredMilestones.length === 0 ? (
                <div className="py-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-slate-350" />
                  <span>No milestones found matching the filters.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMilestones.map(milestone => {
                    const linkedProj = projects.find(p => p.id === milestone.projectId);

                    return (
                      <div
                        key={milestone.id}
                        className={cn(
                          "flex items-start justify-between p-4 rounded-2xl border transition-all duration-200",
                          milestone.completed
                            ? "bg-slate-50/50 border-slate-150/70 opacity-75"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        )}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleMilestone(milestone.id)}
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer mt-0.5",
                              milestone.completed
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                : "bg-white border-slate-250 text-transparent hover:border-indigo-500"
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="space-y-1 min-w-0">
                            {/* Title */}
                            <h4 className={cn(
                              "text-xs font-black text-slate-800 leading-snug",
                              milestone.completed && "line-through text-slate-450"
                            )}>
                              {milestone.title}
                            </h4>

                            {/* Description */}
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                              {milestone.description}
                            </p>

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[9px] font-bold">
                              {linkedProj && (
                                <span className="text-indigo-600 bg-indigo-50/50 border border-indigo-150/50 rounded-md px-1.5 py-0.5 uppercase tracking-wider">
                                  {linkedProj.name}
                                </span>
                              )}

                              {milestone.assignedTo && (
                                <span className="text-emerald-700 bg-emerald-50/50 border border-emerald-150/50 rounded-md px-1.5 py-0.5 tracking-wider">
                                  Assignee: {milestone.assignedTo}
                                </span>
                              )}

                              <span className="text-slate-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        {canManageRoadmap && (
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-3"
                            title="Delete Milestone"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: ADD MILESTONE */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/35">
                  <Milestone className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Create Target Milestone</h3>
              </div>
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMilestone} className="space-y-5">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beta Launch to Customers"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core requirements or targets for this release step..."
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                />
              </div>

              {/* Project & Due date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Initiative Project</label>
                  <div className="relative">
                    <select
                      value={newMilestoneProject}
                      onChange={(e) => setNewMilestoneProject(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Milestone To</label>
                <div className="relative">
                  <select
                    value={newMilestoneAssignee}
                    onChange={(e) => setNewMilestoneAssignee(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                  >
                    <option value="">Unassigned</option>
                    {(projects.find(p => p.id === newMilestoneProject)?.members || []).map(member => (
                      <option key={member.name} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
                >
                  Create Milestone
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PROJECT DATES */}
      {isEditProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/35">
                  <CalendarDays className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Edit Timeline</h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">{editingProject.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditProjectModalOpen(false);
                  setEditingProject(null);
                }}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProjectDates} className="space-y-5">

              {/* Start Date & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Target Quarter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Release Target Quarter</label>
                <div className="relative">
                  <select
                    value={editQuarter}
                    onChange={(e) => setEditQuarter(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                  >
                    <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
                    <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
                    <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
                    <option value="Future">Future / Backlog</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
                >
                  Save Schedule
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </>
  );
}
