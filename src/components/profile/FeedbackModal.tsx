import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

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
      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-scaleIn">
        <div className="flex flex-col items-center space-y-4">
          {type === 'success' ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Check className="h-6 w-6 stroke-[3px]" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <AlertCircle className="h-6 w-6" />
            </div>
          )}
          <h3 className="text-lg font-black text-slate-800">{title}</h3>
          <p className="text-xs text-slate-550 font-bold leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm",
              type === 'success' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-650 hover:bg-red-700"
            )}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
