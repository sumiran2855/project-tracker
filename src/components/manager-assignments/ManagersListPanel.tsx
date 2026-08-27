import { Users, Search, X, ChevronRight, Briefcase, User } from 'lucide-react';
import type { ManagersListPanelProps } from '@/types/manager-assignments.types';

export function ManagersListPanel({
  managers,
  filteredManagers,
  managerSearch,
  setManagerSearch,
  selectedManagerId,
  setSelectedManagerId,
  getInitials,
  getGradient,
}: ManagersListPanelProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-md shadow-slate-100/50 dark:shadow-none flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-indigo-600" />
          Managers ({managers.length})
        </h2>
      </div>

      {/* Manager Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search managers..."
          value={managerSearch}
          onChange={(e) => setManagerSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 transition-all font-semibold"
        />
        {managerSearch && (
          <button onClick={() => setManagerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-none animate-fadeIn">
        {filteredManagers.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-8">No matching managers found.</p>
        ) : (
          filteredManagers.map(manager => {
            const initials = getInitials(manager.name);
            const gradient = getGradient(manager.name);
            const isSelected = selectedManagerId === manager.id;

            return (
              <div
                key={manager.id}
                onClick={() => setSelectedManagerId(manager.id)}
                className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-800/40 hover:scale-[1.01]'
                }`}
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-2xs shrink-0 bg-gradient-to-br ${gradient}`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{manager.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold truncate mt-0.5">{manager.email}</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-0.5 text-[8px] font-bold text-slate-500 dark:text-slate-400 shadow-3xs">
                      <Briefcase className="h-2.5 w-2.5 text-amber-500" /> Leads: {manager.teamLeads.length}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-0.5 text-[8px] font-bold text-slate-500 dark:text-slate-400 shadow-3xs">
                      <User className="h-2.5 w-2.5 text-emerald-500" /> Staff: {manager.employees.length}
                    </span>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-indigo-600 translate-x-0.5' : ''}`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
