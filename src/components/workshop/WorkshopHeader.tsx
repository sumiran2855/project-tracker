import { Sparkles, FolderDot, Download, Plus } from 'lucide-react';
import type { WorkshopHeaderProps } from '@/types/workshop.types';

export function WorkshopHeader({
  exportToCSV,
  canCreateProject,
  setActiveModal
}: WorkshopHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>PWT Workshop Dashboard</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <FolderDot className="h-4.5 w-4.5" />
          </div>
          Operations Sheet Workspace
        </h1>
        <p className="text-xs text-slate-455 font-medium mt-1">
          Visual workspace metrics, tabular sheet controls, and Kanban board sub-dashboards.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={exportToCSV}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-655 shadow-3xs cursor-pointer active:scale-98 transition-all"
          title="Download Workspace Spreadsheet as Excel CSV file"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>

        {canCreateProject && (
          <button
            onClick={() => setActiveModal('project')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Initiative</span>
          </button>
        )}
      </div>
    </div>
  );
}
