import { Columns, ListTodo, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TasksTabsProps } from '@/types/tasks.types';

export function TasksTabs({
  activeTab,
  setActiveTab,
}: TasksTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
      {/* Switching Tabs */}
      <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto border border-slate-100">
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
                  ? "bg-white text-indigo-650 shadow-sm ring-1 ring-slate-200/50" 
                  : "text-slate-400 hover:text-slate-650"
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
