import { CalendarDays, X, ChevronDown } from 'lucide-react';
import type { EditProjectModalProps } from '@/types/projects.types';
import { Portal } from '@/components/ui/portal';

export function EditProjectModal({
  isOpen,
  onClose,
  project,
  editStartDate,
  setEditStartDate,
  editDueDate,
  setEditDueDate,
  editQuarter,
  setEditQuarter,
  handleSaveProjectDates,
}: EditProjectModalProps) {
  if (!isOpen || !project) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-6 sm:p-8 space-y-6 animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/35 dark:border-indigo-900/30">
              <CalendarDays className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">Edit Timeline</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-none mt-0.5">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProjectDates} className="space-y-5">

          {/* Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Start Date</label>
              <input
                type="date"
                required
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</label>
              <input
                type="date"
                required
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Target Quarter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Release Target Quarter</label>
            <div className="relative">
              <select
                value={editQuarter}
                onChange={(e) => setEditQuarter(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
              >
                <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
                <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
                <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
                <option value="Future">Future / Backlog</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer active:scale-98"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
            >
              Save Schedule
            </button>
          </div>

        </form>
      </div>
    </div>
    </Portal>
  );
}
