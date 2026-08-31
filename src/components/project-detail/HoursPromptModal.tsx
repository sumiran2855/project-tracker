import { X, Clock } from 'lucide-react';
import type { HoursPromptModalProps } from '@/types/tasks.types';
import { Portal } from '@/components/ui/portal';

export function HoursPromptModal({
  promptValue,
  setPromptValue,
  onClose,
  onConfirm,
}: HoursPromptModalProps) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-6 sm:p-8 space-y-6 animate-scaleIn">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border border-pink-100/30 dark:border-pink-900/30">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">Log Spent Hours</h3>
          </div>
          <button 
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            You marked this task as <strong className="text-slate-700 dark:text-slate-300">Done</strong>. Enter any additional hours spent on this task today:
          </p>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Hours Spent</label>
            <input
              type="number"
              min={0}
              required
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-855 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/8 transition-all"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Confirm & Log
          </button>
        </div>

      </div>
    </div>
    </Portal>
  );
}
