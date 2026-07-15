'use client';

import React, { useState } from 'react';
import { Plus, Play, Bug, X, Loader2, Clock } from 'lucide-react';
import { updateProjectAction } from '@/actions/projects';
import { AddProjectModal } from './AddProjectModal';
import { AddIssueModal } from './AddIssueModal';

interface QuickActionsPanelProps {
  projects: any[];
  employees: any[];
}

export function QuickActionsPanel({ projects, employees }: QuickActionsPanelProps) {
  // Modal open states
  const [activeModal, setActiveModal] = useState<'project' | 'logTime' | 'bug' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Log Time Fields
  const [logTimeProjectId, setLogTimeProjectId] = useState('');
  const [logTimeHours, setLogTimeHours] = useState('10');

  const handleOpenModal = (modalType: 'project' | 'logTime' | 'bug') => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);

    if (modalType === 'logTime') {
      setLogTimeProjectId(projects[0]?.id || '');
      setLogTimeHours('10');
    }
    setActiveModal(modalType);
  };

  const parseHoursFromBudget = (budget: string | undefined): number => {
    if (!budget) return 0;
    if (budget.includes('$')) return 0;
    const matches = budget.match(/(\d+)\s*(h|hour|hours|hrs|hr)?/i);
    if (matches) {
      return parseInt(matches[1], 10);
    }
    const num = parseInt(budget.trim(), 10);
    if (!isNaN(num)) {
      return num;
    }
    return 0;
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const selectedProj = projects.find(p => p.id === logTimeProjectId);
    if (!selectedProj) {
      setErrorMsg('Please select a valid project');
      setLoading(false);
      return;
    }

    const currentHours = parseHoursFromBudget(selectedProj.budget);
    const addedHours = parseInt(logTimeHours, 10) || 0;
    const newBudgetString = `${currentHours + addedHours} hours`;

    const res = await updateProjectAction(logTimeProjectId, {
      budget: newBudgetString
    });

    if (res.success) {
      setSuccessMsg(`Successfully logged ${addedHours} hours!`);
      setTimeout(() => {
        setActiveModal(null);
        window.location.reload();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Failed to log hours');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleOpenModal('project')}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all hover:brightness-95 cursor-pointer shadow-xs bg-[#e0e7ff60] text-[#4f46e5]"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => handleOpenModal('logTime')}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all hover:brightness-95 cursor-pointer shadow-xs bg-[#d1fae560] text-[#10b981]"
          >
            <Play className="h-4 w-4 shrink-0" />
            <span>Log Time</span>
          </button>

          <button
            onClick={() => handleOpenModal('bug')}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all hover:brightness-95 cursor-pointer shadow-xs bg-[#fee2e260] text-[#ef4444]"
          >
            <Bug className="h-4 w-4 shrink-0" />
            <span>File a Bug</span>
          </button>
        </div>
      </div>

      {/* Reusable Project Creation Modal */}
      <AddProjectModal
        isOpen={activeModal === 'project'}
        onClose={() => setActiveModal(null)}
        availableMembers={employees}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Reusable Bug Creation Modal */}
      <AddIssueModal
        isOpen={activeModal === 'bug'}
        onClose={() => setActiveModal(null)}
        projects={projects}
        availableMembers={employees}
        defaultType="Bug"
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* 2. Log Time Modal */}
      {activeModal === 'logTime' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-650 border border-emerald-100/30">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Log Project Time</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogTime} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-650">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-250 text-xs font-bold text-emerald-700">
                  {successMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Project</label>
                <select
                  required
                  value={logTimeProjectId}
                  onChange={(e) => setLogTimeProjectId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/8 transition-all cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Budget: {p.budget || '0h'})</option>
                  ))}
                  {projects.length === 0 && <option value="">No projects available</option>}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Add Hours to Project Budget</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={logTimeHours}
                  onChange={(e) => setLogTimeHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/8 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-655 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={loading || projects.length === 0}
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-605 hover:bg-emerald-705 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Log Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
