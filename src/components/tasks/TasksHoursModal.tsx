import React from 'react';
import { Clock, X } from 'lucide-react';
import type { GlobalTask } from '@/services/useTasksService';

interface TasksHoursModalProps {
  isOpen: boolean;
  promptTask: GlobalTask | null;
  promptValue: string;
  setPromptValue: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-150 space-y-5 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-indigo-650 font-black text-xs uppercase tracking-widest">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Log Task Completion Hours</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-105 border border-slate-150 flex items-center justify-center text-slate-505 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800">{promptTask.title}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
              className="w-full text-sm font-bold rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. 4"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
            >
              Confirm & Complete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
