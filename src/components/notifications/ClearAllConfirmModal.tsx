import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

interface ClearAllConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isClearing?: boolean;
}

export function ClearAllConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isClearing = false,
}: ClearAllConfirmModalProps) {
  if (!isOpen) return null;

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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/30">
                <Trash2 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Clear All Notifications
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isClearing}
              className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to clear all notifications?
            </p>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
              This action will remove all items from your notifications list. You will not be able to recover them.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isClearing}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isClearing}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isClearing ? (
                <span>Clearing...</span>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
