import { Sparkles, CheckSquare, Plus } from 'lucide-react';
import type { TasksHeaderProps } from '@/types/tasks.types';

export function TasksHeader({
  canCreateTask,
  projects,
  setNewTaskProject,
  setIsTaskModalOpen,
}: TasksHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Workspace Operations</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-655 border border-indigo-100/30 shadow-xs">
            <CheckSquare className="h-4.5 w-4.5" />
          </div>
          Tasks Board
        </h1>
        <p className="text-xs text-slate-450 font-medium mt-1">
          Aggregated workspace items across all development initiatives.
        </p>
      </div>

      {canCreateTask && (
        <button 
          onClick={() => {
            if (projects.length > 0) {
              setNewTaskProject(projects[0].id);
            }
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Task</span>
        </button>
      )}
    </div>
  );
}
