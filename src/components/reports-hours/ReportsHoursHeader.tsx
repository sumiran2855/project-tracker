import { Clock, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportsHoursHeaderProps } from '@/types/reports.types';

export function ReportsHoursHeader({ loading, onSync, onBack }: ReportsHoursHeaderProps) {
  return (
    <div className="px-6 sm:px-8 py-6">
      <div className="max-w-8xl mx-auto space-y-3.5">
        
        {/* Top Badge Category */}
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          Time Management
        </div>

        {/* Main Title and Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Icon Container */}
            <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-3xs">
              <Clock className="h-5.5 w-5.5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Hours Logged Report
            </h1>
          </div>

          {/* Solid Indigo/Purple Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSync}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-3xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn("h-3 w-3 text-slate-400", loading && "animate-spin")} />
              Sync Data
            </button>
            
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed max-w-3xl">
          Analyze aggregate team capacity, individual workloads, and historical time log entries across the lifecycle.
        </p>

      </div>
    </div>
  );
}
