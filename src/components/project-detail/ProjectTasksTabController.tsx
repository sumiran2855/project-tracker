import { Columns, ListTodo, CalendarDays, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectTasksTabControllerProps } from '@/types/tasks.types';

export function ProjectTasksTabController({
  activeTab,
  setActiveTab,
  canCreateTask,
  onAddTaskClick,
}: ProjectTasksTabControllerProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs">
      
      {/* Switch Tabs Segment */}
      <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto border border-slate-100 dark:border-slate-800">
        {[
          { id: 'kanban', label: 'Kanban Board', icon: Columns },
          { id: 'list', label: 'Task List', icon: ListTodo },
          { id: 'timeline', label: 'Timeline / Gantt', icon: CalendarDays },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                active 
                  ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800" 
                  : "text-slate-405 dark:text-slate-500 hover:text-slate-655 dark:hover:text-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Task Trigger */}
      {canCreateTask && (
        <button 
          onClick={onAddTaskClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Task</span>
        </button>
      )}
    </div>
  );
}
