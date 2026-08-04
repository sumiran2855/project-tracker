import React from 'react';
import { Milestone, X, ChevronDown } from 'lucide-react';
import { Project } from '@/services/useRoadmapService';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  newMilestoneTitle: string;
  setNewMilestoneTitle: (val: string) => void;
  newMilestoneDesc: string;
  setNewMilestoneDesc: (val: string) => void;
  newMilestoneDueDate: string;
  setNewMilestoneDueDate: (val: string) => void;
  newMilestoneProject: string;
  setNewMilestoneProject: (val: string) => void;
  newMilestoneAssignee: string;
  setNewMilestoneAssignee: (val: string) => void;
  projects: Project[];
  handleCreateMilestone: (e: React.FormEvent) => void;
}

export function MilestoneModal({
  isOpen,
  onClose,
  newMilestoneTitle,
  setNewMilestoneTitle,
  newMilestoneDesc,
  setNewMilestoneDesc,
  newMilestoneDueDate,
  setNewMilestoneDueDate,
  newMilestoneProject,
  setNewMilestoneProject,
  newMilestoneAssignee,
  setNewMilestoneAssignee,
  projects,
  handleCreateMilestone,
}: MilestoneModalProps) {
  if (!isOpen) return null;

  // Selected project members
  const selectedProjMembers = projects.find(p => p.id === newMilestoneProject)?.members || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/35">
              <Milestone className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Create Target Milestone</h3>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateMilestone} className="space-y-5">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Milestone Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Beta Launch to Customers"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              rows={2}
              placeholder="Summarize the core requirements or targets for this release step..."
              value={newMilestoneDesc}
              onChange={(e) => setNewMilestoneDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
            />
          </div>

          {/* Project & Due date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Initiative Project</label>
              <div className="relative">
                <select
                  value={newMilestoneProject}
                  onChange={(e) => setNewMilestoneProject(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Date</label>
              <input
                type="date"
                required
                value={newMilestoneDueDate}
                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Milestone To</label>
            <div className="relative">
              <select
                value={newMilestoneAssignee}
                onChange={(e) => setNewMilestoneAssignee(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
              >
                <option value="">Unassigned</option>
                {selectedProjMembers.map(member => (
                  <option key={member.name} value={member.name}>{member.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer active:scale-98"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
            >
              Create Milestone
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
