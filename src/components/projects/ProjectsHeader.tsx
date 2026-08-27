import { Sparkles, Folder, Plus } from 'lucide-react';
import type { ProjectsHeaderProps } from '@/types/projects.types';

export function ProjectsHeader({
  canCreateProject,
  onNewProjectClick,
}: ProjectsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Workspace Overview</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 mt-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 shadow-xs border border-indigo-100/30 dark:border-indigo-900/30">
            <Folder className="h-5 w-5" />
          </div>
          Project Hub
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-1">
          Manage, schedule, and track all ongoing corporate initiative pipelines.
        </p>
      </div>

      {/* Create Project Trigger */}
      {canCreateProject && (
        <button 
          onClick={onNewProjectClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Project</span>
        </button>
      )}
    </div>
  );
}
