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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[
        { label: 'Total Tasks', value: totalCount, icon: ListTodo, color: 'bg-slate-100 border-slate-200 text-slate-605' },
        { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-slate-100 border-slate-200 text-slate-500' },
        { label: 'In Progress', value: inProgressCount, icon: CheckSquare, color: 'bg-indigo-50/50 border-indigo-150 text-indigo-650' },
        { label: 'In Review', value: inReviewCount, icon: TrendingUp, color: 'bg-amber-50/50 border-amber-150 text-amber-600' },
        { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'bg-emerald-50/50 border-emerald-150 text-emerald-600' },
      ].map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
              <div className={cn("p-1.5 rounded-lg border", s.color.split(' ')[0], s.color.split(' ')[1], s.color.split(' ')[2])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-800 mt-3">{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}
