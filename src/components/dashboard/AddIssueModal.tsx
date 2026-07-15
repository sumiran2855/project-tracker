'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Bug, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createIssueAction } from '@/actions/issues';
import { Issue } from '@/actions/issues';

interface AddIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: any[];
  availableMembers: any[];
  onSuccess?: () => void;
  defaultType?: 'Bug' | 'Security' | 'Improvement' | 'Task';
}

export function AddIssueModal({ isOpen, onClose, projects, availableMembers, onSuccess, defaultType = 'Bug' }: AddIssueModalProps) {
  const [newProject, setNewProject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<Issue['type']>(defaultType);
  const [newPriority, setNewPriority] = useState<Issue['priority']>('Medium');
  const [newStatus, setNewStatus] = useState<Issue['status']>('Open');
  const [newAssignees, setNewAssignees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setNewProject(projects[0]?.id || '');
      setNewTitle('');
      setNewDesc('');
      setNewType(defaultType);
      setNewPriority('Medium');
      setNewStatus('Open');
      setNewAssignees([]);
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen, projects, defaultType]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const targetProj = projects.find((p) => p.id === newProject);
    if (!targetProj) {
      setErrorMsg('Please select a destination project.');
      setLoading(false);
      return;
    }

    const selectedAssignees = availableMembers
      .filter((m) => newAssignees.includes(m.name))
      .map((m) => ({
        id: m.id,
        name: m.name,
      }));

    const issueData = {
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
      type: newType,
      projectId: newProject,
      projectName: targetProj.name,
      dueDate: 'No Due Date',
      assignees: selectedAssignees,
      commentsCount: 0,
    };

    const res = await createIssueAction(issueData);
    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create issue');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30">
              <Bug className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Add New Issue</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateIssue} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-2 -mr-2 min-h-0">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-655">
                {errorMsg}
              </div>
            )}

            {/* Project Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Destination Project</label>
              <div className="relative">
                <select
                  required
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                >
                  <option value="" disabled>Select project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Issue Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Signature mismatch in custom auth endpoint"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description / Details</label>
              <textarea
                rows={3}
                placeholder="Describe logs, environment, and replication steps..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
              />
            </div>

            {/* Type, Priority & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Type</label>
                <div className="relative">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                  >
                    <option value="Bug">Bug</option>
                    <option value="Security">Security</option>
                    <option value="Improvement">Improvement</option>
                    <option value="Task">Task</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                <div className="relative">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Team Members</label>
              <div className="flex flex-wrap gap-2.5">
                {availableMembers.map((member) => {
                  const isSelected = newAssignees.includes(member.name);
                  return (
                    <button
                      key={member.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setNewAssignees(newAssignees.filter(m => m !== member.name));
                        } else {
                          setNewAssignees([...newAssignees, member.name]);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-200 text-indigo-700 shadow-3xs ring-1 ring-indigo-200/50"
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300 shadow-3xs"
                      )}
                    >
                      <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-3xs shrink-0", member.bg)}>
                        {member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span>{member.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 text-xs font-bold transition-all cursor-pointer active:scale-98"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Issue
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
