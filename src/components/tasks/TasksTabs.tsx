import { Columns, ListTodo, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TasksTabsProps } from '@/types/tasks.types';

export function TasksTabs({
  activeTab,
  setActiveTab,
}: TasksTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs">
      {/* Switching Tabs */}
      <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto border border-slate-100 dark:border-slate-800">
        {[
          { id: 'board', label: 'Kanban Board', icon: Columns },
          { id: 'list', label: 'Detailed List', icon: ListTodo },
          { id: 'calendar', label: 'Calendar View', icon: CalendarDays },
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
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
