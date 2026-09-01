'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ClipboardList, Loader2, Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';
import { createDailyUpdateAction } from '@/actions/daily-updates';
import { getTasksByProjectAction } from '@/actions/tasks';
import { Project } from '@/types/projects.types';
import { Portal } from '@/components/ui/portal';

export interface AddDailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSuccess?: () => void;
}

export function AddDailyUpdateModal({
  isOpen,
  onClose,
  projects,
  onSuccess,
}: AddDailyUpdateModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [date, setDate] = useState('');
  const [hoursSpent, setHoursSpent] = useState<number | ''>(0);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [blockers, setBlockers] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedProjectId) {
      getTasksByProjectAction(selectedProjectId).then((res) => {
        if (res.success && res.data) {
          setTasks(res.data);
        } else {
          setTasks([]);
        }
      });
    } else {
      setTasks([]);
    }
    setSelectedTaskId('');
  }, [selectedProjectId]);

  useEffect(() => {
    if (isOpen) {
      const defaultProj = projects[0]?.id || '';
      setSelectedProjectId(defaultProj);
      setSelectedTaskId('');
      const todayStr = new Date().toISOString().split('T')[0];
      setDate(todayStr);
      setHoursSpent(0);
      setSummary('');
      setDescription('');
      setBlockers('');
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!selectedProjectId) {
      setErrorMsg('Please select a project for this update.');
      setLoading(false);
      return;
    }

    if (!summary.trim()) {
      setErrorMsg('Please enter a brief summary of what was done.');
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a detailed description of your work.');
      setLoading(false);
      return;
    }

    const payload = {
      projectId: selectedProjectId,
      taskId: selectedTaskId || undefined,
      date: date || new Date().toISOString().split('T')[0],
      hoursSpent: typeof hoursSpent === 'number' ? hoursSpent : 0,
      summary: summary.trim(),
      description: description.trim(),
      blockers: blockers.trim() || undefined,
    };

    const res = await createDailyUpdateAction(payload);
    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to submit daily update');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-slate-950/40 backdrop-blur-md animate-fadeIn">
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
          }
          .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}} />
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-6 sm:p-8 space-y-6 animate-scaleIn max-h-[90vh] flex flex-col mt-10 sm:mt-14 mb-8">

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30">
                <ClipboardList className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">Add Daily Work Update</h3>
                <p className="text-[11px] text-slate-400 font-medium">Log what you accomplished today for your team & lead</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2 -mr-2 min-h-0">

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-600 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              {/* Project Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Project *</label>
                <div className="relative">
                  <select
                    required
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                  >
                    <option value="" disabled>Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Task Selection (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Related Task (Optional)</label>
                <div className="relative">
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    disabled={!selectedProjectId}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10 disabled:opacity-50"
                  >
                    <option value="">General Project Work (No specific task)</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Date & Hours Spent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" /> Work Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" /> Hours Spent Today
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    placeholder="e.g. 7.5"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>
              </div>

              {/* Summary / Headline */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <FileText className="h-3 w-3 text-slate-400" /> Key Highlights / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implemented Daily Update REST APIs and integrated frontend dashboard"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Detailed Work Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what you worked on, changes committed, features completed, tests written, or meetings attended..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                />
              </div>

              {/* Blockers / Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Blockers / Assistance Needed (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any roadblocks, pending reviews, API dependencies, or hardware issues..."
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  className="w-full rounded-xl border border-amber-200/80 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-amber-400/60 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/8 transition-all resize-none"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer active:scale-98"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Update
              </button>
            </div>

          </form>
        </div>
      </div>
    </Portal>
  );
}
