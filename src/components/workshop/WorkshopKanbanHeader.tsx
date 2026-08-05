import { ArrowLeft, FolderDot, RefreshCw, Plus, Bug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WorkshopKanbanHeaderProps } from '@/types/workshop.types';
import type { Project } from '@/types/projects.types';

export function WorkshopKanbanHeader({
  selectedProject,
  setViewMode,
  handleRefreshKanban,
  isEmployee,
  setActiveModal
}: WorkshopKanbanHeaderProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'In Review':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Planning':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-650 border-indigo-500/20';
    }
  };

  const getPriorityColor = (priority?: Project['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-655 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-655 border-orange-500/20';
      case 'Medium':
        return 'bg-indigo-500/10 text-indigo-650 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div className="space-y-1.5">
        <button
          onClick={() => setViewMode('sheet')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-55 text-[11px] font-black text-slate-550 cursor-pointer shadow-3xs transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Spreadsheet Grid</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-808 tracking-tight flex items-center gap-2">
            <FolderDot className="h-6 w-6 text-indigo-600 shrink-0" />
            {selectedProject.name}
          </h1>
          <Badge className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border", getStatusColor(selectedProject.status))}>
            {selectedProject.status}
          </Badge>
          <Badge className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border", getPriorityColor(selectedProject.priority))}>
            {selectedProject.priority || 'Medium'} Priority
          </Badge>
        </div>
        <p className="text-xs text-slate-455 leading-relaxed max-w-2xl font-semibold">{selectedProject.description}</p>
      </div>

      {/* Action Buttons for new task/issue */}
      <div className="flex gap-2 shrink-0 items-center">
        <button
          onClick={handleRefreshKanban}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer shadow-3xs hover:rotate-90 transition-transform duration-300"
          title="Refresh Kanban Board cards"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {!isEmployee && (
          <>
            <button
              onClick={() => setActiveModal('task')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
            <button
              onClick={() => setActiveModal('issue')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-650 hover:bg-red-755 text-white px-3.5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Bug className="h-4 w-4" />
              <span>Report Issue</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
