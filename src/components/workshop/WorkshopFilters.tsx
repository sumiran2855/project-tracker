import { Search, X, Eye } from 'lucide-react';
import type { WorkshopFiltersProps } from '@/types/workshop.types';

export function WorkshopFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  visibleColumns,
  setVisibleColumns,
  showColMenu,
  setShowColMenu
}: WorkshopFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
      
      {/* Search */}
      <div className="relative w-full lg:flex-1">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter projects by title, description, stack tags..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all font-semibold"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {/* Status Filter */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-200 font-extrabold pr-2"
          >
            <option value="All" className="dark:bg-slate-900">All statuses</option>
            <option value="Planning" className="dark:bg-slate-900">Planning</option>
            <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
            <option value="In Review" className="dark:bg-slate-900">In Review</option>
            <option value="Completed" className="dark:bg-slate-900">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-700 dark:text-slate-200 font-extrabold pr-2"
          >
            <option value="All" className="dark:bg-slate-900">All priorities</option>
            <option value="Low" className="dark:bg-slate-900">Low</option>
            <option value="Medium" className="dark:bg-slate-900">Medium</option>
            <option value="High" className="dark:bg-slate-900">High</option>
            <option value="Critical" className="dark:bg-slate-900">Critical</option>
          </select>
        </div>

        {/* Column Visibility */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowColMenu(!showColMenu)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Visible Fields</span>
          </button>
          {showColMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-30 space-y-2 animate-scaleIn">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1.5 border-b border-slate-100 dark:border-slate-800">Toggle Column Views</p>
              {Object.keys(visibleColumns).map((col) => (
                <label key={col} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col as keyof typeof visibleColumns]}
                    onChange={() => setVisibleColumns({
                      ...visibleColumns,
                      [col]: !visibleColumns[col as keyof typeof visibleColumns]
                    })}
                    className="rounded border-slate-300 dark:border-slate-700 bg-transparent text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
