'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Folder, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createProjectAction, updateProjectAction } from '@/actions/projects';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: any[];
  onSuccess?: () => void;
  projectToEdit?: any;
}

export function AddProjectModal({ isOpen, onClose, availableMembers, onSuccess, projectToEdit }: AddProjectModalProps) {
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<'Planning' | 'In Progress' | 'In Review' | 'Completed'>('Planning');
  const [newProjQuarter, setNewProjQuarter] = useState<'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Future'>('Q2 2026');
  const [newProjStartDate, setNewProjStartDate] = useState('');
  const [newProjDueDate, setNewProjDueDate] = useState('');
  const [newProjTechStack, setNewProjTechStack] = useState('');
  const [newProjPriority, setNewProjPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [newProjBudget, setNewProjBudget] = useState('');
  const [newProjSlackChannel, setNewProjSlackChannel] = useState('');
  const [newProjRepositoryUrl, setNewProjRepositoryUrl] = useState('');
  const [newProjTags, setNewProjTags] = useState('');
  const [newProjMembers, setNewProjMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal closes/opens or projectToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setNewProjName(projectToEdit.name || '');
        setNewProjDesc(projectToEdit.description || '');
        setNewProjStatus(projectToEdit.status || 'Planning');
        setNewProjQuarter(projectToEdit.targetQuarter || 'Q2 2026');
        setNewProjStartDate(projectToEdit.startDate || '');
        setNewProjDueDate(projectToEdit.dueDate || '');
        setNewProjTechStack(projectToEdit.techStack ? projectToEdit.techStack.join(', ') : '');
        setNewProjPriority(projectToEdit.priority || 'Medium');
        setNewProjBudget(projectToEdit.budget || '');
        setNewProjSlackChannel(projectToEdit.slackChannel || '');
        setNewProjRepositoryUrl(projectToEdit.repositoryUrl || '');
        setNewProjTags(projectToEdit.tags ? projectToEdit.tags.join(', ') : '');
        setNewProjMembers(projectToEdit.members ? projectToEdit.members.map((m: any) => m.name || m.userId) : []);
      } else {
        setNewProjName('');
        setNewProjDesc('');
        setNewProjStatus('Planning');
        setNewProjQuarter('Q2 2026');
        setNewProjStartDate('');
        setNewProjDueDate('');
        setNewProjTechStack('');
        setNewProjPriority('Medium');
        setNewProjBudget('');
        setNewProjSlackChannel('');
        setNewProjRepositoryUrl('');
        setNewProjTags('');
        setNewProjMembers([]);
      }
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const selectedMembers = availableMembers
      .filter((m) => newProjMembers.some((nameOrId) => nameOrId === m.name || nameOrId === m.id))
      .map((m) => ({
        userId: m.id,
        name: m.name,
        initials: m.initials || m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        bg: m.bg || 'bg-indigo-100 text-indigo-750',
      }));

    const tagsArray = newProjTags ? newProjTags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const techStackArray = newProjTechStack ? newProjTechStack.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const projectData: any = {
      name: newProjName,
      description: newProjDesc,
      status: newProjStatus,
      targetQuarter: newProjQuarter,
      startDate: newProjStartDate || undefined,
      dueDate: newProjDueDate || undefined,
      techStack: techStackArray,
      priority: newProjPriority,
      budget: newProjBudget || '40 hours',
      slackChannel: newProjSlackChannel || undefined,
      repositoryUrl: newProjRepositoryUrl || undefined,
      tags: tagsArray,
      members: selectedMembers,
    };

    if (!projectToEdit) {
      projectData.progress = 0;
      projectData.completedTasks = 0;
      projectData.tasksCount = 0;
    }

    const res = projectToEdit
      ? await updateProjectAction(projectToEdit.id, projectData)
      : await createProjectAction(projectData);

    if (res.success) {
      onSuccess?.();
      onClose();
    } else {
      setErrorMsg(res.error || `Failed to ${projectToEdit ? 'update' : 'create'} project`);
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
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-655 border border-indigo-100/30">
              <Folder className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">
              {projectToEdit ? 'Edit Project Details' : 'Add New Initiative'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-2 -mr-2 min-h-0">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                {errorMsg}
              </div>
            )}

            {/* Section 1: General Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <span>01. General Information</span>
              </h4>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe Integration V2"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description / Goals</label>
                <textarea
                  rows={3}
                  placeholder="Describe the main milestones, goals, and what this project is about..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                />
              </div>
            </div>

            {/* Section 2: Timeline & Status */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                <span>02. Timeline & Planning</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</label>
                  <div className="relative">
                    <select
                      value={newProjStatus}
                      onChange={(e) => setNewProjStatus(e.target.value as any)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Quarter</label>
                  <div className="relative">
                    <select
                      value={newProjQuarter}
                      onChange={(e) => setNewProjQuarter(e.target.value as any)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                    >
                      <option value="Q2 2026">Q2 2026</option>
                      <option value="Q3 2026">Q3 2026</option>
                      <option value="Q4 2026">Q4 2026</option>
                      <option value="Future">Future</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={newProjStartDate}
                    onChange={(e) => setNewProjStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={newProjDueDate}
                    onChange={(e) => setNewProjDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Technical & Operational Metadata */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                <span>03. Tech Stack & Operations</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Node.js, Stripe"
                    value={newProjTechStack}
                    onChange={(e) => setNewProjTechStack(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                  <div className="relative">
                    <select
                      value={newProjPriority}
                      onChange={(e) => setNewProjPriority(e.target.value as any)}
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Budget / Est. Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 120 hours"
                    value={newProjBudget}
                    onChange={(e) => setNewProjBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Slack / Discord Channel</label>
                  <input
                    type="text"
                    placeholder="e.g. #initiative-auth"
                    value={newProjSlackChannel}
                    onChange={(e) => setNewProjSlackChannel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Repository Link</label>
                  <input
                    type="text"
                    placeholder="e.g. https://github.com/..."
                    value={newProjRepositoryUrl}
                    onChange={(e) => setNewProjRepositoryUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-450 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend, Billing, Design"
                  value={newProjTags}
                  onChange={(e) => setNewProjTags(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-semibold placeholder-slate-455 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                />
              </div>
            </div>

            {/* Section 4: Members selection */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                <span>04. Team Allocation</span>
              </h4>
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Team Members</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableMembers.map((member) => {
                    const isSelected = newProjMembers.some((nameOrId) => nameOrId === member.name || nameOrId === member.id);
                    return (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewProjMembers(newProjMembers.filter((m) => m !== member.name && m !== member.id));
                          } else {
                            setNewProjMembers([...newProjMembers, member.name]);
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

          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0 mt-4">
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
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
