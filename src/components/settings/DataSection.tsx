import React from 'react';
import { Database, RefreshCcw } from 'lucide-react';

interface DataSectionProps {
  handleResetData: () => void;
}

export function DataSection({
  handleResetData,
}: DataSectionProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-black text-slate-800">Workspace Storage Parameters</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Control browser storage parameters and hard factory resets.</p>
      </div>

      <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-5 space-y-3.5">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-800">Clear all records / Reset Sandbox</h4>
            <p className="text-[10px] text-rose-600 mt-0.5 leading-relaxed">
              This action is destructive and irreversible. Clicking this button clears all project, task, roadmap milestones, and configuration files stored inside your browser. Your sandbox environment will be immediately reset back to standard starter kits.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetData}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-rose-600/10 cursor-pointer transition-colors"
        >
          <RefreshCcw className="h-3.5 w-3.5 animate-spin-reverse" />
          <span>Reset Workspace Sandbox</span>
        </button>
      </div>
    </div>
  );
}
