import { TrendingUp, Folder, CheckSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportsKpisProps } from '@/types/reports.types';

export function ReportsKpis({
  completionRate,
  completedTasksCount,
  tasksCount,
  projectsCount,
  overdueTasksCount,
}: ReportsKpisProps) {
  const cards = [
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: `${completedTasksCount} of ${tasksCount} tasks completed`,
      icon: TrendingUp,
      tint: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30',
    },
    {
      label: 'Active Initiatives',
      value: projectsCount,
      subtext: 'Total projects in pipeline',
      icon: Folder,
      tint: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30',
    },
    {
      label: 'Remaining Tasks',
      value: tasksCount - completedTasksCount,
      subtext: 'Tasks to be processed',
      icon: CheckSquare,
      tint: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100/50 dark:border-blue-900/30',
    },
    {
      label: 'Overdue Bottlenecks',
      value: overdueTasksCount,
      subtext: 'Tasks past their due date',
      icon: AlertCircle,
      tint: overdueTasksCount > 0 ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/40 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{stat.label}</span>
              <div className={cn("p-1.5 rounded-lg border", stat.tint)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">{stat.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
