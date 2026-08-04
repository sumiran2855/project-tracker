import React from 'react';
import { Search, X, Eye } from 'lucide-react';

interface WorkshopFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  visibleColumns: {
    quarter: boolean;
    priority: boolean;
    status: boolean;
    progress: boolean;
    techStack: boolean;
    budget: boolean;
    team: boolean;
  };
  setVisibleColumns: (cols: any) => void;
  showColMenu: boolean;
  setShowColMenu: (val: boolean) => void;
}

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
    <div className="flex flex-col lg:flex-row items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
      
      {/* Search */}
      <div className="relative w-full lg:flex-1">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter projects by title, description, stack tags..."
          className="w-full rounded-xl border border-slate-200 bg-slate-55 py-2.5 pl-10 pr-4 text-xs text-slate-808 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-semibold"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-655 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {/* Status Filter */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 shadow-2xs shrink-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-750 font-extrabold pr-2"
          >
            <option value="All">All statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 shadow-2xs shrink-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mr-2">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer text-slate-750 font-extrabold pr-2"
          >
            <option value="All">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Column Visibility */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowColMenu(!showColMenu)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-655 shadow-2xs cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Visible Fields</span>
          </button>
          {showColMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2 animate-scaleIn">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-450 pb-1.5 border-b border-slate-100">Toggle Column Views</p>
              {Object.keys(visibleColumns).map((col) => (
                <label key={col} className="flex items-center gap-2 text-xs font-bold text-slate-650 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col as keyof typeof visibleColumns]}
                    onChange={() => setVisibleColumns({
                      ...visibleColumns,
                      [col]: !visibleColumns[col as keyof typeof visibleColumns]
                    })}
                    className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5"
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
