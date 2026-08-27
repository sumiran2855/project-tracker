import { Search, Filter, X } from 'lucide-react';
import type { ProjectsFilterRowProps } from '@/types/projects.types';

export function ProjectsFilterRow({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: ProjectsFilterRowProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by title, description, tags..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 w-full sm:w-auto shrink-0">
        <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter Status:</span>
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 sm:flex-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="All" className="dark:bg-slate-900">All Statuses</option>
          <option value="Planning" className="dark:bg-slate-900">Planning</option>
          <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
          <option value="In Review" className="dark:bg-slate-900">In Review</option>
          <option value="Completed" className="dark:bg-slate-900">Completed</option>
        </select>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="flex-1 sm:flex-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="name">Sort by Name</option>
          <option value="progress">Sort by Progress</option>
          <option value="dueDate">Sort by Due Date</option>
        </select>
      </div>
    </div>
  );
}
