import { Search, Filter, X } from 'lucide-react';

interface ProjectsFilterRowProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export function ProjectsFilterRow({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: ProjectsFilterRowProps) {
  return (
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
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-655"
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
  );
}
