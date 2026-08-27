import { BarChart3, RefreshCw, Printer, Sparkles } from 'lucide-react';
import type { ReportsHeaderProps } from '@/types/reports.types';

export function ReportsHeader({ onRefresh, onPrint }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Workspace Metrics</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 mt-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 shadow-xs border border-indigo-100/30 dark:border-indigo-900/30">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          Workspace Insights
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Realtime workload metrics, team capacity status, and sprint progression statistics.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          onClick={onRefresh}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-3xs cursor-pointer active:scale-98 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
        
        <button 
          onClick={onPrint}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-800 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer active:scale-98 transition-all"
        >
          <Printer className="h-4 w-4" />
          <span>Print Report</span>
        </button>
      </div>
    </div>
  );
}
