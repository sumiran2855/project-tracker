import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Bookmark,
  X,
  Clock,
  ChevronDown, 
  Trash2, 
  UploadCloud, 
  CheckSquare, 
  MessageSquare 
} from 'lucide-react';
import { cn, formatCommentTime, getCommentTimestamp } from '@/lib/utils';
import { getAttachmentUrl } from '@/services/useSprintService';
import type { SprintDetailDrawerProps } from '@/types/sprint.types';

export function SprintDetailDrawer({
  isOpen,
  activeDetailItem,
  onClose,
  isClient,
  canEditHours,
  tasks,
  user,
  newCommentText,
  setNewCommentText,
  newSubtaskText,
  setNewSubtaskText,
  uploadingImage,
  handleUpdateStatus,
  handleUpdatePriority,
  handleUpdateTargetDate,
  handleSaveHoursValue,
  handleUpdateRelatedTask,
  handleAddAttachment,
  handleRemoveAttachment,
  handleAddComment,
  handleToggleSubtask,
  handleAddSubtask,
  handleDeleteActiveItem,
}: SprintDetailDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-3xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-0 flex flex-col h-full animate-slideIn">
        {activeDetailItem && (
          <>
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4.5 w-4.5 text-indigo-600 fill-indigo-600/10" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 font-sans">
                  {activeDetailItem.itemType === 'task' ? 'Task Workspace Details' : 'Issue Workspace Details'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-550 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 no-scrollbar">
              {/* Title */}
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                  {activeDetailItem.title}
                </h2>
                {activeDetailItem.description && (
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-405 leading-relaxed mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3.5 rounded-2xl">
                    {activeDetailItem.description}
                  </p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-3xs">
                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.status}
                        disabled={isClient}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer shadow-3xs disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {activeDetailItem.itemType === 'task' ? (
                          <>
                            <option value="To Do" className="dark:bg-slate-900">To Do</option>
                            <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
                            <option value="In Review" className="dark:bg-slate-900">In Review</option>
                            <option value="Done" className="dark:bg-slate-900">Done</option>
                          </>
                        ) : (
                          <>
                            <option value="To Do" className="dark:bg-slate-900">Open</option>
                            <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
                            <option value="In Review" className="dark:bg-slate-900">Resolved</option>
                            <option value="Done" className="dark:bg-slate-900">Closed</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Priority</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.priority === 'Critical' ? 'Urgent' : activeDetailItem.priority}
                        disabled={isClient}
                        onChange={(e) => handleUpdatePriority(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer shadow-3xs disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Low" className="dark:bg-slate-900">Low</option>
                        <option value="Medium" className="dark:bg-slate-900">Medium</option>
                        <option value="High" className="dark:bg-slate-900">High</option>
                        <option value="Urgent" className="dark:bg-slate-900">Critical / Urgent</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        dir="rtl"
                        disabled={isClient}
                        value={activeDetailItem.dueDate && activeDetailItem.dueDate !== 'No Due Date' ? activeDetailItem.dueDate : ''}
                        onChange={(e) => handleUpdateTargetDate(e.target.value)}
                        onClick={(e) => {
                          if (isClient) return;
                          try {
                            e.currentTarget.showPicker();
                          } catch (err) {}
                        }}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-202 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer shadow-3xs h-9 disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Logged Hours */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Logged Hours</label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs h-9">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{activeDetailItem.actualHours || 0} hours total</span>
                      </div>
                      {canEditHours && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Log hours..."
                            id="sprint-log-hours-input"
                            className="w-24 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-9"
                          />
                          <button
                            type="button"
                            onClick={handleSaveHoursValue}
                            className="bg-indigo-600 hover:bg-indigo-800 text-white rounded-xl px-3.5 py-1.5 text-[10px] font-black shadow-3xs cursor-pointer h-9 shrink-0 transition-colors"
                          >
                            Log
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Task for issues */}
              {activeDetailItem.itemType === 'issue' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Related Task</label>
                  <div className="relative">
                    <select
                      value={activeDetailItem.relatedTaskId || ''}
                      onChange={(e) => handleUpdateRelatedTask(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-202 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8"
                    >
                      <option value="" className="dark:bg-slate-900">Not related to any task</option>
                      {tasks.filter(t => t.projectId === activeDetailItem.projectId).map(t => (
                        <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Assignees */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assignees</h3>
                <div className="flex flex-wrap gap-2">
                  {(!activeDetailItem.assignees || activeDetailItem.assignees.length === 0) ? (
                    <span className="text-xs font-semibold text-slate-400">Unassigned</span>
                  ) : (
                    activeDetailItem.assignees.map((a: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-3xs text-xs font-bold text-slate-700 dark:text-slate-300">
                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[9px] text-white font-black shadow-3xs", a.bg || "bg-indigo-600")}>
                          {a.initials}
                        </div>
                        <span>{a.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Screenshots / Attachments for issues */}
              {activeDetailItem.itemType === 'issue' && (
                <div className="space-y-2 pt-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Screenshots / Attachments</label>
                  
                  {activeDetailItem.attachments && activeDetailItem.attachments.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {activeDetailItem.attachments.map((url: string, idx: number) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-202 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                          <img
                            src={getAttachmentUrl(url)}
                            alt={`Attachment ${idx + 1}`}
                            onClick={() => window.open(getAttachmentUrl(url), '_blank')}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                          {!isClient && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAttachment(url);
                              }}
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 hover:bg-red-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white cursor-pointer shadow-sm"
                              title="Delete screenshot"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-202 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer">
                    <UploadCloud className="h-4 w-4 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">
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
              )}

              {/* Subtask Checklist */}
              {activeDetailItem.itemType === 'task' && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 pb-1 font-sans">
                    <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                    Subtask Checklist
                  </h3>

                  <div className="border border-slate-202/85 dark:border-slate-800 rounded-2xl p-4.5 space-y-4 bg-white dark:bg-slate-950/20 shadow-3xs">
                    <div className="space-y-2">
                      {(!activeDetailItem.subtasks || activeDetailItem.subtasks.length === 0) ? (
                        <div className="py-2 text-center text-slate-400 font-semibold text-[11px]">
                          No subtasks defined yet.
                        </div>
                      ) : (
                        activeDetailItem.subtasks.map((sub: any) => (
                          <label key={sub.id} className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 p-2.5 rounded-xl shadow-3xs hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              disabled={isClient}
                              onChange={() => handleToggleSubtask(sub.id)}
                              className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 disabled:opacity-75 disabled:cursor-not-allowed"
                            />
                            <span className={cn(
                              "text-xs font-bold text-slate-700",
                              sub.completed && "line-through text-slate-400 dark:text-slate-500"
                            )}>
                              {sub.title}
                            </span>
                          </label>
                        ))
                      )}
                    </div>

                    {/* Add checklist item */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <input
                        type="text"
                        value={newSubtaskText}
                        onChange={(e) => setNewSubtaskText(e.target.value)}
                        placeholder="Add another checklist task item..."
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        onClick={handleAddSubtask}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400 px-4.5 py-2 text-xs font-black transition-all cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Discussion */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 pb-1 font-sans">
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
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
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition-all resize-none shadow-3xs placeholder:text-slate-405 dark:placeholder:text-slate-550"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-800 text-white px-5 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs"
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
                      <div key={comment.id} className="flex gap-3 bg-slate-50/65 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/85 p-3.5 rounded-2xl shadow-3xs">
                        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs bg-indigo-600")}>
                          {comment.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{comment.author}</span>
                            <span className="text-[9px] text-slate-400 font-bold">{formatCommentTime(comment.time)}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1 leading-normal whitespace-pre-wrap">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
              <button
                onClick={handleDeleteActiveItem}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs bg-white dark:bg-slate-900"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{activeDetailItem.itemType === 'task' ? 'Delete Task' : 'Delete Issue'}</span>
              </button>
              
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 text-xs font-black transition-all cursor-pointer shadow-3xs"
              >
                Close
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
