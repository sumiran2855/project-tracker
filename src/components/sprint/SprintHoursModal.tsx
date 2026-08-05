import { Clock } from 'lucide-react';
import type { SprintHoursModalProps } from '@/types/sprint.types';

export function SprintHoursModal({
  isOpen,
  hoursModalTarget,
  inputHours,
  setInputHours,
  onClose,
  onSave,
}: SprintHoursModalProps) {
  if (!isOpen || !hoursModalTarget) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-scaleIn">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-805">Log Resolution Hours</h3>
            <p className="text-[10px] text-slate-455 font-semibold uppercase tracking-wider">Record hours spent</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          How many actual hours did you spend to solve this {hoursModalTarget.type}?
        </p>

        <input
          type="number"
          value={inputHours}
          onChange={(e) => setInputHours(e.target.value)}
          placeholder="e.g. 4.5"
          step="0.5"
          min="0"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all"
          autoFocus
        />

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            Skip / Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-xs font-bold bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl cursor-pointer shadow-md transition-all active:scale-98"
          >
            Log hours & Complete
          </button>
        </div>
      </div>
    </div>
  );
}
