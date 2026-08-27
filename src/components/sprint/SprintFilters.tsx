import { Search, ChevronDown } from 'lucide-react';
import type { SprintFiltersProps } from '@/types/sprint.types';

export function SprintFilters({
  searchQuery,
  setSearchQuery,
  filterProject,
  setFilterProject,
  filterType,
  setFilterType,
  projects,
  filteredCount,
}: SprintFiltersProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-3xs">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        
        {/* Search box */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sprint work..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 pl-10 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Project Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="relative w-full sm:w-40">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900">All Types</option>
            <option value="Tasks" className="dark:bg-slate-900">Tasks Only</option>
            <option value="Issues" className="dark:bg-slate-900">Issues Only</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
        Showing <span className="text-slate-800 dark:text-slate-200">{filteredCount}</span> items
      </div>
    </div>
  );
}
