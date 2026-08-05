import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Bookmark, X, ChevronDown, Clock, UploadCloud, MessageSquare, Trash2 } from 'lucide-react';
import { cn, formatCommentTime, getCommentTimestamp } from '@/lib/utils';
import type { Issue, IssueDetailDrawerProps } from '@/types/issues.types';


function getAttachmentUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api$/, '');
  return `${serverBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function IssueDetailDrawer({
  activeDetailItem,
  onClose,
  isClient,
  canEditHours,
  activeProjectTasks,
  uploadingImage,
  user,
  newCommentText,
  setNewCommentText,
  handleUpdateStatus,
  handleUpdatePriority,
  handleUpdateType,
  handleUpdateTargetDate,
  handleUpdateRelatedTask,
  handleAddAttachment,
  handleRemoveAttachment,
  handleLogHours,
  handleAddComment,
  handleDeleteActiveItem,
}: IssueDetailDrawerProps) {
  const [hoursToLog, setHoursToLog] = useState('');

  return (
    <Sheet open={!!activeDetailItem} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-3xl bg-white border-l border-slate-200 shadow-2xl p-0 flex flex-col h-full animate-slideIn">
        {activeDetailItem && (
          <>
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4.5 w-4.5 text-indigo-650 fill-indigo-650/10" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-650 font-sans">
                  Issue Workspace Details
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
              {/* Title */}
              <div>
                <h2 className="text-lg font-black text-slate-808 tracking-tight leading-snug">
                  {activeDetailItem.title}
                </h2>
                {activeDetailItem.description && (
                  <p className="text-xs font-semibold text-slate-450 leading-relaxed mt-2 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
                    {activeDetailItem.description}
                  </p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4 space-y-4 shadow-3xs">
                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.status}
                        disabled={isClient}
                        onChange={(e) => handleUpdateStatus(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.priority}
                        disabled={isClient}
                        onChange={(e) => handleUpdatePriority(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-55 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Type</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.type}
                        disabled={isClient}
                        onChange={(e) => handleUpdateType(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-55 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Bug">Bug</option>
                        <option value="Security">Security</option>
                        <option value="Improvement">Improvement</option>
                        <option value="Task">Task</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Due Date</label>
                    <div className="relative">
                      <button
                        type="button"
                        disabled={isClient}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-all w-full text-left select-none disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <Clock className="h-4 w-4 text-indigo-555 shrink-0" />
                        <span>
                          {activeDetailItem.dueDate && activeDetailItem.dueDate !== 'No Due Date'
                            ? (() => {
                              const parts = activeDetailItem.dueDate.split('-');
                              if (parts.length === 3) return activeDetailItem.dueDate;
                              return new Date(activeDetailItem.dueDate).toISOString().split('T')[0];
                            })()
                            : 'Set Due Date'
                          }
                        </span>
                      </button>
                      {!isClient && (
                        <input
                          type="date"
                          dir="rtl"
                          value={activeDetailItem.dueDate && activeDetailItem.dueDate !== 'No Due Date' ? activeDetailItem.dueDate : ''}
                          onChange={(e) => handleUpdateTargetDate(e.target.value)}
                          onClick={(e) => {
                            try {
                              (e.target as HTMLInputElement).showPicker();
                            } catch (err) {}
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Logged Hours & Related Task */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Logged Hours */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Logged Hours</label>
                    <div className="flex flex-col gap-1.5">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-750 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="h-4 w-4 text-slate-405 shrink-0" />
                        <span>{activeDetailItem.actualHours || 0} hours total</span>
                      </div>
                      {canEditHours && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Log hours..."
                            value={hoursToLog}
                            onChange={(e) => setHoursToLog(e.target.value)}
                            className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const val = parseFloat(hoursToLog);
                              if (val > 0) {
                                const success = await handleLogHours(val);
                                if (success) {
                                  setHoursToLog('');
                                }
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold shadow-3xs transition-all cursor-pointer shrink-0"
                          >
                            Log
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Related Task */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Related Task</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.relatedTaskId || ''}
                        onChange={(e) => handleUpdateRelatedTask(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-55 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8"
                      >
                        <option value="">Not related to any task</option>
                        {activeProjectTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assignees</label>
                <div className="flex flex-wrap gap-2">
                  {activeDetailItem.assignees && activeDetailItem.assignees.length > 0 ? (
                    activeDetailItem.assignees.map((a: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-3xs"
                      >
                        <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shrink-0 shadow-3xs", a.bg || 'bg-indigo-500')}>
                          {a.initials}
                        </div>
                        <span>{a.name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold italic">No assignees</span>
                  )}
                </div>
              </div>

              {/* Screenshots / Attachments */}
              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Screenshots / Attachments</label>
                
                {activeDetailItem.attachments && activeDetailItem.attachments.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {activeDetailItem.attachments.map((url: string, idx: number) => (
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

                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-250 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer">
                  <UploadCloud className="h-4 w-4 text-slate-405" />
                  <span className="text-[10px] font-bold text-slate-505">
                    {uploadingImage ? 'Uploading image...' : 'Upload screenshot'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddAttachment}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Discussion */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5 pb-1 font-sans">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-650" />
                  Discussion ({activeDetailItem.comments?.length || 0})
                </h3>

                {/* Input comment field */}
                <div className="flex gap-3 items-start">
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs mt-1 bg-indigo-600")}>
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'DU'}
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Ask a question or post progress notes..."
                      rows={2.5}
                      className="w-full border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 bg-white transition-all resize-none shadow-3xs placeholder:text-slate-400"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white px-5 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comment Thread list */}
                <div className="space-y-3 pt-2">
                  {[...(activeDetailItem.comments || [])]
                    .sort((a, b) => getCommentTimestamp(b) - getCommentTimestamp(a))
                    .map((comment: any) => (
                      <div key={comment.id} className="bg-slate-50/50 border border-slate-200 p-3 rounded-2xl shadow-3xs flex gap-3">
                        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs bg-indigo-500")}>
                          {comment.initials}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{comment.author}</span>
                            <span className="text-[8px] font-bold text-slate-400">{formatCommentTime(comment.time)}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-655 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/35">
              <button
                onClick={handleDeleteActiveItem}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-105 text-red-600 text-xs font-black transition-all cursor-pointer shadow-3xs border border-red-100"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Issue</span>
              </button>
              <button
                onClick={onClose}
                className="px-4.5 py-2.5 rounded-xl bg-white hover:bg-slate-55 border border-slate-250 text-slate-655 text-xs font-black transition-all cursor-pointer shadow-3xs"
              >
                Close Drawer
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
