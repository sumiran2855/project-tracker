import { ListTodo, Clock, CheckSquare, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TasksKpisProps } from '@/types/tasks.types';

export function TasksKpis({
  totalCount,
  pendingCount,
  inProgressCount,
  inReviewCount,
  doneCount,
}: TasksKpisProps) {
  const stats = [
    { label: 'Total Tasks', value: totalCount, icon: ListTodo, color: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' },
    { label: 'In Progress', value: inProgressCount, icon: CheckSquare, color: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400' },
    { label: 'In Review', value: inReviewCount, icon: TrendingUp, color: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-indigo-900 text-amber-600 dark:text-amber-400' },
    { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-405' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{s.label}</span>
              <div className={cn("p-1.5 rounded-lg border", s.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-3">{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}
