'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Bug, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createIssueAction, uploadIssueAttachmentAction } from '@/actions/issues';
import { getTasksByProjectAction } from '@/actions/tasks';
import { Issue } from '@/actions/issues';

function getAttachmentUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api$/, '');
  return `${serverBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

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
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignees, setNewAssignees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // New fields state
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch tasks when project changes
  useEffect(() => {
    if (newProject) {
      getTasksByProjectAction(newProject).then((res) => {
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
  }, [newProject]);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      const initialProjId = projects[0]?.id || '';
      setNewProject(initialProjId);
      setNewTitle('');
      setNewDesc('');
      setNewType(defaultType);
      setNewPriority('Medium');
      setNewStatus('Open');
      
      const inOneWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setNewDueDate(inOneWeek);
      
      setNewAssignees([]);
      setErrorMsg('');
      setLoading(false);
      setAttachments([]);
      setSelectedTaskId('');
    }
  }, [isOpen, projects, defaultType]);

  const selectedProj = projects.find((p) => p.id === newProject || (p as any)._id === newProject);

  let assignableMembers: any[] = [];
  if (selectedProj) {
    const projMembers = selectedProj.members || [];
    const projMemberNames = new Set(projMembers.map((m: any) => (m.name || '').toLowerCase()));
    
    assignableMembers = availableMembers.filter(
      (m) => m.role?.toLowerCase() !== 'admin' && projMemberNames.has((m.name || '').toLowerCase())
    );
    
    if (assignableMembers.length === 0 && projMembers.length > 0) {
      assignableMembers = projMembers.filter((m: any) => m.role?.toLowerCase() !== 'admin');
    }
  } else {
    assignableMembers = availableMembers.filter((m) => m.role?.toLowerCase() !== 'admin');
  }

  const handleProjectChange = (projId: string) => {
    setNewProject(projId);
    const targetProj = projects.find((p) => p.id === projId);
    if (targetProj && Array.isArray(targetProj.members)) {
      const targetMemberNames = new Set(targetProj.members.map((m: any) => (m.name || '').toLowerCase()));
      setNewAssignees((prev) => prev.filter((name) => targetMemberNames.has(name.toLowerCase())));
    }
  };

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

    const combinedMembers = [...availableMembers, ...(targetProj.members || [])];
    const selectedAssignees = newAssignees.map((name) => {
      const found = combinedMembers.find((m) => m.name === name);
      return {
        id: found?.id || found?.userId || '',
        name: name,
      };
    });

    const relatedTask = tasks.find((t) => t.id === selectedTaskId);

    const issueData = {
      title: newTitle,
      description: newDesc,
      status: newStatus,
      priority: newPriority,
      type: newType,
      projectId: newProject,
      projectName: targetProj.name,
      dueDate: newDueDate || 'No Due Date',
      assignees: selectedAssignees,
      commentsCount: 0,
      relatedTaskId: selectedTaskId || undefined,
      relatedTaskTitle: relatedTask ? relatedTask.title : undefined,
      attachments: attachments,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadIssueAttachmentAction(formData);
      if (res.success && res.url) {
        setAttachments((prev) => [...prev, res.url!]);
      } else {
        setErrorMsg(res.error || 'Failed to upload image.');
      }
    }
    setUploadingImage(false);
  };

  const handleRemoveAttachment = (urlToRemove: string) => {
    setAttachments((prev) => prev.filter((url) => url !== urlToRemove));
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
                  onChange={(e) => handleProjectChange(e.target.value)}
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

            {/* Related Task Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Related Task (Optional)</label>
              <div className="relative">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                >
                  <option value="">Not related to any task</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
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

            {/* Target Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Date / Due Date</label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
              />
            </div>

            {/* Assignees */}
            <div className="space-y-2.5 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Team Members</label>
              <div className="flex flex-wrap gap-2.5">
                {assignableMembers.length > 0 ? (
                  assignableMembers.map((member) => {
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
                        <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-3xs shrink-0", member.bg || 'bg-indigo-500')}>
                          {member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span>{member.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">No team members assigned to this project.</p>
                )}
              </div>
            </div>

            {/* Screenshots / Attachments */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Screenshots / Attachments (Optional)</label>
              
              {/* Attachment Preview Grid */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {attachments.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer">
                      <img
                        src={getAttachmentUrl(url)}
                        alt={`Attachment ${idx + 1}`}
                        onClick={() => window.open(getAttachmentUrl(url), '_blank')}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(url);
                        }}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 hover:bg-red-650 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white cursor-pointer shadow-sm"
                        title="Delete screenshot"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Dropzone */}
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50/50 hover:border-indigo-300 transition-all cursor-pointer gap-1.5 p-4">
                <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-505">
                  {uploadingImage ? 'Uploading image...' : 'Click to upload screenshot(s)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
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
