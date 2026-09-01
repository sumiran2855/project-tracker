'use client';

import { X, Calendar, Clock, Folder, CheckSquare, AlertTriangle, Trash2, Shield } from 'lucide-react';
import { DailyUpdate } from '@/types/daily-updates.types';
import { Portal } from '@/components/ui/portal';

export interface DailyUpdateDetailModalProps {
  update: DailyUpdate | null;
  onClose: () => void;
  onDeleteRequest?: (update: DailyUpdate) => void;
  canDelete?: boolean;
}

export function DailyUpdateDetailModal({
  update,
  onClose,
  onDeleteRequest,
  canDelete = false,
}: DailyUpdateDetailModalProps) {
  if (!update) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-6 sm:p-8 space-y-6 animate-scaleIn max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-md ${update.userAvatarBg || 'bg-indigo-600'}`}>
                {update.userInitials || update.userName?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{update.userName}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {update.userRole}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>{update.date}</span>
                  <span className="mx-1">•</span>
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{update.hoursSpent} hrs logged</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canDelete && onDeleteRequest && (
                <button
                  type="button"
                  onClick={() => onDeleteRequest(update)}
                  className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200/60 dark:border-red-800/40 flex items-center justify-center text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                  title="Delete Update"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 -mr-1">

            {/* Context Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200">
                <Folder className="h-3.5 w-3.5 text-indigo-500" />
                <span>Project: {update.projectName}</span>
              </div>
              {update.taskTitle && (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Task: {update.taskTitle}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Headline / Summary</span>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                {update.summary}
              </h4>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detailed Description</span>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                {update.description}
              </div>
            </div>

            {/* Blockers / Notes */}
            {update.blockers && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Blockers / Assistance Required
                </span>
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 font-medium whitespace-pre-wrap leading-relaxed">
                  {update.blockers}
                </div>
              </div>
            )}

            {/* Submission metadata */}
            <div className="pt-2 text-[10px] text-slate-400 font-medium flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span>Submitted on {new Date(update.createdAt).toLocaleString()}</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Shield className="h-3 w-3 text-indigo-500" /> Role-based visibility applied
              </span>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
}
