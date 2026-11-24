import React from 'react';
import { X, Trash2, AlertTriangle, Info } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconBgClass =
    variant === 'danger'
      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100/30 dark:border-red-900/30'
      : variant === 'warning'
        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/30 dark:border-amber-900/30'
        : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100/30 dark:border-indigo-900/30';

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : variant === 'warning'
        ? 'bg-amber-600 hover:bg-amber-700 text-white'
        : 'bg-indigo-600 hover:bg-indigo-700 text-white';

  const IconComponent = variant === 'danger' ? Trash2 : variant === 'warning' ? AlertTriangle : Info;

  return (
    <Portal>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-6 sm:p-7 space-y-5 animate-scaleIn"
        >

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${iconBgClass}`}>
                <IconComponent className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body */}
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 ${confirmBtnClass}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
