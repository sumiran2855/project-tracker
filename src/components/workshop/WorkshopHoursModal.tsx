import { Clock3 } from 'lucide-react';
import type { WorkshopHoursModalProps } from '@/types/workshop.types';

export function WorkshopHoursModal({
  showHoursModal,
  hoursModalTarget,
  inputHours,
  setInputHours,
  handleSaveTransitionHours,
  setShowHoursModal,
  setHoursModalTarget
}: WorkshopHoursModalProps) {
  if (!showHoursModal || !hoursModalTarget) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-scaleIn">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Log Resolution Hours</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Record hours spent on this ticket</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
          How many actual hours did you spend to solve this {hoursModalTarget.type}?
        </p>

        <input
          type="number"
          value={inputHours}
          onChange={(e) => setInputHours(e.target.value)}
          placeholder="e.g. 4.5"
          step="0.5"
          min="0"
          className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 transition-all"
          autoFocus
        />

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => { setShowHoursModal(false); setHoursModalTarget(null); }}
            className="px-3.5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          >
            Skip / Cancel
          </button>
          <button
            onClick={handleSaveTransitionHours}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-800 text-white rounded-xl cursor-pointer shadow-md transition-all active:scale-98"
          >
            Log hours & Complete
          </button>
        </div>
      </div>
    </div>
  );
}
