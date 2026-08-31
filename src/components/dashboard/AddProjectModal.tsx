'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Folder, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createProjectAction, updateProjectAction } from '@/actions/projects';
import { useUser } from '@/contexts/UserContext';
import type { AddProjectModalProps } from '@/types/projects.types';
import { Portal } from '@/components/ui/portal';

export function AddProjectModal({ isOpen, onClose, availableMembers, onSuccess, projectToEdit }: AddProjectModalProps) {
  const { user } = useUser();
  const userRole = user?.role || '';

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
  const [newProjManagerId, setNewProjManagerId] = useState('');
  const [newProjTeamLeadId, setNewProjTeamLeadId] = useState('');
  const [newProjClientId, setNewProjClientId] = useState('');
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
        setNewProjMembers(
          projectToEdit.members
            ? projectToEdit.members
                .filter((m: any) => m.role?.toLowerCase() !== 'admin')
                .map((m: any) => m.name || m.userId)
            : []
        );
        setNewProjManagerId(projectToEdit.managerId || '');
        setNewProjTeamLeadId(projectToEdit.teamLeadId || '');
        setNewProjClientId(projectToEdit.clientId || '');
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
        setNewProjManagerId('');
        setNewProjTeamLeadId('');
        setNewProjClientId('');
      }
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const isTeamLead = userRole.toLowerCase() === 'team lead';
    const isManager = userRole.toLowerCase() === 'manager';

    if (isTeamLead && !newProjManagerId) {
      setErrorMsg('Manager is a mandatory field.');
      setLoading(false);
      return;
    }
    if (isManager && !newProjTeamLeadId) {
      setErrorMsg('Team Lead is a mandatory field.');
      setLoading(false);
      return;
    }
    if (!newProjClientId) {
      setErrorMsg('Client is a mandatory field.');
      setLoading(false);
      return;
    }

    const allSelectedIds = new Set(
      availableMembers
        .filter((m) => m.role?.toLowerCase() !== 'admin')
        .filter((m) => newProjMembers.some((nameOrId) => nameOrId === m.name || nameOrId === m.id))
        .map((m) => m.id)
    );

    if (newProjManagerId) allSelectedIds.add(newProjManagerId);
    if (newProjTeamLeadId) allSelectedIds.add(newProjTeamLeadId);
    if (newProjClientId) allSelectedIds.add(newProjClientId);

    const selectedMembers = availableMembers
      .filter((m) => allSelectedIds.has(m.id))
      .map((m) => ({
        userId: m.id,
        name: m.name,
        initials: m.initials || m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        bg: m.bg || 'bg-indigo-100 text-indigo-700',
        role: m.role,
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
      managerId: newProjManagerId || undefined,
      teamLeadId: newProjTeamLeadId || undefined,
      clientId: newProjClientId || undefined,
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
    <Portal>
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
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6 animate-scaleIn max-h-[90vh] flex flex-col">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30">
                <Folder className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {projectToEdit ? 'Edit Project Details' : 'Add New Initiative'}
              </h3>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-2 -mr-2 min-h-0">
              
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-600 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: General Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                  <span>01. General Information</span>
                </h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe Integration V2"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Description / Goals</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the main milestones, goals, and what this project is about..."
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
                  />
                </div>

                {/* Project Assignments Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Client Select (Always Displayed & Mandatory) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Client *</label>
                    <div className="relative">
                      <select
                        value={newProjClientId}
                        onChange={(e) => setNewProjClientId(e.target.value)}
                        required
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                      >
                        <option value="">Select a Client...</option>
                        {availableMembers
                          .filter((m) => m.role?.toLowerCase() === 'client')
                          .map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Manager Select (For Team Lead or Admin) */}
                  {(userRole.toLowerCase() === 'team lead' || userRole.toLowerCase() === 'admin') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">
                        Manager {userRole.toLowerCase() === 'team lead' ? '*' : ''}
                      </label>
                      <div className="relative">
                        <select
                          value={newProjManagerId}
                          onChange={(e) => setNewProjManagerId(e.target.value)}
                          required={userRole.toLowerCase() === 'team lead'}
                          className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                        >
                          <option value="">Select a Manager...</option>
                          {availableMembers
                            .filter((m) => m.role?.toLowerCase() === 'manager')
                            .map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Team Lead Select (For Manager or Admin) */}
                  {(userRole.toLowerCase() === 'manager' || userRole.toLowerCase() === 'admin') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">
                        Team Lead {userRole.toLowerCase() === 'manager' ? '*' : ''}
                      </label>
                      <div className="relative">
                        <select
                          value={newProjTeamLeadId}
                          onChange={(e) => setNewProjTeamLeadId(e.target.value)}
                          required={userRole.toLowerCase() === 'manager'}
                          className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                        >
                          <option value="">Select a Team Lead...</option>
                          {availableMembers
                            .filter((m) => m.role?.toLowerCase() === 'team lead')
                            .map((lead) => (
                              <option key={lead.id} value={lead.id}>
                                {lead.name}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Timeline & Status */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>02. Timeline & Planning</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</label>
                    <div className="relative">
                      <select
                        value={newProjStatus}
                        onChange={(e) => setNewProjStatus(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
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
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Quarter</label>
                    <div className="relative">
                      <select
                        value={newProjQuarter}
                        onChange={(e) => setNewProjQuarter(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
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
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Start Date</label>
                    <input
                      type="date"
                      value={newProjStartDate}
                      onChange={(e) => setNewProjStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</label>
                    <input
                      type="date"
                      value={newProjDueDate}
                      onChange={(e) => setNewProjDueDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Technical & Operational Metadata */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>03. Tech Stack & Operations</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Node.js, Stripe"
                      value={newProjTechStack}
                      onChange={(e) => setNewProjTechStack(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Priority</label>
                    <div className="relative">
                      <select
                        value={newProjPriority}
                        onChange={(e) => setNewProjPriority(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
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
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Budget / Est. Hours</label>
                    <input
                      type="text"
                      placeholder="e.g. 120 hours"
                      value={newProjBudget}
                      onChange={(e) => setNewProjBudget(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Slack / Discord Channel</label>
                    <input
                      type="text"
                      placeholder="e.g. #initiative-auth"
                      value={newProjSlackChannel}
                      onChange={(e) => setNewProjSlackChannel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Repository Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/..."
                      value={newProjRepositoryUrl}
                      onChange={(e) => setNewProjRepositoryUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend, Billing, Design"
                    value={newProjTags}
                    onChange={(e) => setNewProjTags(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
                  />
                </div>
              </div>

              {/* Section 4: Members selection */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-505 border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>04. Team Allocation</span>
                </h4>
                
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-505">Assign Team Members</label>
                  <div className="flex flex-wrap gap-2.5">
                    {availableMembers.filter((m) => {
                      const role = m.role?.toLowerCase();
                      if (role === 'admin' || role === 'client') return false;
                      if (role === 'manager' && newProjManagerId) return false;
                      if (role === 'team lead' && newProjTeamLeadId) return false;
                      return true;
                    }).map((member) => {
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
                            "flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-200 cursor-pointer",
                            isSelected 
                              ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-3xs ring-1 ring-indigo-200/50" 
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-605 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-3xs"
                          )}
                        >
                          <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-3xs shrink-0", member.bg)}>
                            {member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="shrink-0">{member.name}</span>
                          <span className={cn(
                            "text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full shrink-0",
                            member.role?.toLowerCase() === 'manager' && "bg-emerald-100 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
                            member.role?.toLowerCase() === 'team lead' && "bg-indigo-100 text-indigo-800 border border-indigo-200/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
                            member.role?.toLowerCase() === 'client' && "bg-sky-100 text-sky-800 border border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30",
                            (member.role?.toLowerCase() === 'employee' || !member.role) && "bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          )}>
                            {member.role || 'Employee'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0 mt-4">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {projectToEdit ? 'Save Changes' : 'Create Project'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </Portal>
  );
}
