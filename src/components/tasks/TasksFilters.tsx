import React from 'react';
import { Search, X } from 'lucide-react';
import type { Project } from '@/services/useTasksService';

interface TasksFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  projectFilter: string;
  setProjectFilter: (project: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  projects: Project[];
}

export function TasksFilters({
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  projects,
}: TasksFiltersProps) {
  return (
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
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 text-slate-400 cursor-pointer">
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
            className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full focus:ring-0 focus:outline-none"
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
            className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full focus:ring-0 focus:outline-none"
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
            className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full focus:ring-0 focus:outline-none"
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
  );
}
