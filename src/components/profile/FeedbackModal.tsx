import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedbackModalProps } from '@/types/profile.types';

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  message,
  type,
}: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-scaleIn">
        <div className="flex flex-col items-center space-y-4">
          {type === 'success' ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              <Check className="h-6 w-6 stroke-[3px]" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-450 border border-red-100 dark:border-rose-900/30">
              <AlertCircle className="h-6 w-6" />
            </div>
          )}
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm",
              type === 'success' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            )}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
