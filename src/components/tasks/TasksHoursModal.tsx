import { Clock, X } from 'lucide-react';
import type { TasksHoursModalProps } from '@/types/tasks.types';

export function TasksHoursModal({
  isOpen,
  promptTask,
  promptValue,
  setPromptValue,
  onClose,
  onSave,
}: TasksHoursModalProps) {
  if (!isOpen || !promptTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Log Task Completion Hours</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{promptTask.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Please enter any additional hours spent on this task today.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Hours Logged (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              autoFocus
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="w-full text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. 4"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
            >
              Confirm & Complete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
