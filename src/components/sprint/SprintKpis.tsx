import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { SprintKpisProps } from '@/types/sprint.types';

export function SprintKpis({
  completionPercentage,
  completedItems,
  totalItems,
  completedTasksCount,
  totalTasksCount,
  resolvedIssuesCount,
  totalIssuesCount,
  totalLoggedHours,
}: SprintKpisProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 animate-fadeIn">
      {/* SVG Progress Circle Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 flex items-center gap-5 shadow-3xs">
        <div className="relative flex h-20 w-20 items-center justify-center shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="none" stroke="#f1f5f9" strokeWidth="5.5" className="stroke-slate-100 dark:stroke-slate-950" />
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="url(#indigoGradSprint)"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={2 * Math.PI * 25 - (completionPercentage / 100) * 2 * Math.PI * 25}
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="indigoGradSprint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-sm font-black text-slate-800 dark:text-slate-100">{completionPercentage}%</span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Weekly Progress</p>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">
            {completionPercentage === 100 ? "Sprint Finished! 🎉" : "Almost there"}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold mt-1">
            {completedItems} of {totalItems} items completed
          </p>
        </div>
      </div>

      {/* Tasks completed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-3xs flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Sprint Tasks</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">{completedTasksCount} / {totalTasksCount}</h3>
          <div className="w-24 h-1 bg-slate-100 dark:bg-slate-950 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-indigo-500" 
              style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Issues resolved */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-3xs flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Resolved Issues</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">{resolvedIssuesCount} / {totalIssuesCount}</h3>
          <div className="w-24 h-1 bg-slate-100 dark:bg-slate-950 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: `${totalIssuesCount > 0 ? (resolvedIssuesCount / totalIssuesCount) * 100 : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hours Logged */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-3xs flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100/30 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">Sprint Hours</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">{totalLoggedHours}h</h3>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Logged work time</p>
        </div>
      </div>
    </div>
  );
}
