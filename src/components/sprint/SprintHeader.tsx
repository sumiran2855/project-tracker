import { Sparkles, Calendar, FlameKindling, Kanban, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintHeaderProps } from '@/types/sprint.types';

export function SprintHeader({
  weekRangeStr,
  viewMode,
  setViewMode,
}: SprintHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Sprint Operations Center</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-650 text-white shadow-md shadow-indigo-500/20">
            <FlameKindling className="h-4.5 w-4.5" />
          </div>
          Weekly Sprint details
        </h1>
        <p className="text-slate-455 text-xs font-bold mt-1 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Timeframe: <span className="text-slate-700">{weekRangeStr}</span></span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-1" />
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[9px] uppercase tracking-wider">
            Sprint Active
          </span>
        </p>
      </div>

      {/* View Switchers */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
          <button
            onClick={() => setViewMode('board')}
            className={cn(
              "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              viewMode === 'board' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-805"
            )}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Sprint Board</span>
          </button>
          <button
            onClick={() => setViewMode('sheet')}
            className={cn(
              "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              viewMode === 'sheet' ? "bg-white text-slate-805 shadow-2xs" : "text-slate-500 hover:text-slate-805"
            )}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Spreadsheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
