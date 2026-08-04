import React from 'react';
import { Search, X, SquareChartGantt, Layers, Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from '@/services/useRoadmapService';

interface RoadmapControlsProps {
  activeTab: 'timeline' | 'board' | 'milestones';
  setActiveTab: (tab: 'timeline' | 'board' | 'milestones') => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  projectFilter: string;
  setProjectFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  employeeFilter: string;
  setEmployeeFilter: (val: string) => void;
  projects: Project[];
  isEmployee: boolean;
}

export function RoadmapControls({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  statusFilter,
  setStatusFilter,
  employeeFilter,
  setEmployeeFilter,
  projects,
  isEmployee,
}: RoadmapControlsProps) {
  // Extract unique employee names
  const allEmployeeNames = Array.from(
    new Set(projects.flatMap(p => p.members.map(m => m.name)))
  );

  return (
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
                  : "text-slate-400 hover:text-slate-655"
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
              {allEmployeeNames.map(empName => (
                <option key={empName} value={empName}>{empName}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
