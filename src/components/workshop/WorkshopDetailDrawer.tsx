import { Bookmark, X, ChevronDown, Calendar, Clock, UploadCloud, Trash2, CheckSquare, MessageSquare } from 'lucide-react';
import { cn, formatCommentTime, getCommentTimestamp } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { WorkshopDetailDrawerProps } from '@/types/workshop.types';
import { getAttachmentUrl } from '@/services/useWorkshopService';

export function WorkshopDetailDrawer({
  activeDetailItem,
  setActiveDetailItem,
  isClient,
  canEditHours,
  user,
  selectedProjTasks,
  handleUpdateStatus,
  handleUpdatePriority,
  handleUpdateStartDate,
  handleSaveHoursValue,
  handleUpdateTargetDate,
  handleUpdateRelatedTask,
  handleAddAttachment,
  handleRemoveAttachment,
  handleToggleSubtask,
  handleAddSubtask,
  handleAddComment,
  handleDeleteActiveItem,
  newSubtaskText,
  setNewSubtaskText,
  newCommentText,
  setNewCommentText,
  uploadingImage
}: WorkshopDetailDrawerProps) {
  return (
    <Sheet open={!!activeDetailItem} onOpenChange={(open) => { if (!open) setActiveDetailItem(null); }}>
      <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-3xl bg-white border-l border-slate-200 shadow-2xl p-0 flex flex-col h-full animate-slideIn">
        {activeDetailItem && (
          <>
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4.5 w-4.5 text-indigo-650 fill-indigo-650/10" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-650 font-sans">
                  {activeDetailItem.itemType === 'task' ? 'Task Workspace Details' : 'Issue Workspace Details'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailItem(null)}
                className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-205 flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
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

                {/* Description */}
                {activeDetailItem.description && (
                  <div className="mt-3.5 bg-slate-50/50 border border-slate-150 rounded-2xl p-4 text-xs font-semibold text-slate-550 leading-relaxed">
                    {activeDetailItem.description}
                  </div>
                )}
              </div>

              {/* Status, Priority, Dates Block Card */}
              <div className="border border-slate-200/85 rounded-2xl p-4.5 space-y-4 bg-white shadow-3xs">
                {/* Status & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Status dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.status}
                        disabled={isClient}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {activeDetailItem.itemType === 'task' ? (
                          <>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Done">Done</option>
                          </>
                        ) : (
                          <>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Priority dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Priority</label>
                    <div className="relative">
                      <select
                        value={activeDetailItem.priority}
                        disabled={isClient}
                        onChange={(e) => handleUpdatePriority(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs text-slate-808 font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        {activeDetailItem.itemType === 'task' ? (
                          <option value="Urgent">Urgent</option>
                        ) : (
                          <option value="Critical">Critical</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Divider (Thin line) */}
                <div className="border-t border-slate-100" />

                {/* Dates Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date (Tasks only) */}
                  {activeDetailItem.itemType === 'task' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Start Date</label>
                      <div className="relative">
                        <button
                          type="button"
                          disabled={isClient}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-3xs transition-all w-full text-left select-none disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          <Calendar className="h-4 w-4 text-indigo-555 shrink-0" />
                          <span>
                            {activeDetailItem.startDate && activeDetailItem.startDate !== 'No Date'
                              ? (() => {
                                const parts = activeDetailItem.startDate.split('-');
                                if (parts.length === 3) return activeDetailItem.startDate;
                                return new Date(activeDetailItem.startDate).toISOString().split('T')[0];
                              })()
                              : 'Set Start Date'
                            }
                          </span>
                        </button>
                        {!isClient && (
                          <input
                            type="date"
                            dir="rtl"
                            value={activeDetailItem.startDate && activeDetailItem.startDate !== 'No Date' ? activeDetailItem.startDate : ''}
                            onChange={(e) => handleUpdateStartDate(e.target.value)}
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
                  ) : (
                    <div className="space-y-1">
                      {/* Logged Hours instead of Start Date for bugs */}
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Logged Hours</label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-705 flex items-center gap-1.5 shadow-2xs h-9">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{activeDetailItem.actualHours || 0}h total</span>
                        </div>
                        {canEditHours && (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="Log..."
                              id="workshop-log-hours-input"
                              className="w-20 text-xs font-bold rounded-xl border border-slate-200 px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-9"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('workshop-log-hours-input') as HTMLInputElement;
                                const val = parseFloat(input?.value || '0');
                                handleSaveHoursValue(val);
                                if (input) input.value = '';
                              }}
                              className="bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl px-2.5 py-1.5 text-[10px] font-black shadow-3xs cursor-pointer h-9 shrink-0 transition-colors"
                            >
                              Log
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Due Date (Always present) */}
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
              </div>

              {/* Logged Hours row for tasks, since start date occupied its slot */}
              {activeDetailItem.itemType === 'task' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Logged Hours</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-705 flex items-center gap-1.5 shadow-2xs h-9">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{activeDetailItem.actualHours || 0}h total</span>
                    </div>
                    {canEditHours && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="Log..."
                          id="workshop-log-hours-input"
                          className="w-20 text-xs font-bold rounded-xl border border-slate-200 px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-9"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('workshop-log-hours-input') as HTMLInputElement;
                            const val = parseFloat(input?.value || '0');
                            handleSaveHoursValue(val);
                            if (input) input.value = '';
                          }}
                          className="bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl px-2.5 py-1.5 text-[10px] font-black shadow-3xs cursor-pointer h-9 shrink-0 transition-colors"
                        >
                          Log
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Related Task for issues */}
              {activeDetailItem.itemType === 'issue' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Related Task</label>
                  <div className="relative">
                    <select
                      value={activeDetailItem.relatedTaskId || ''}
                      onChange={(e) => handleUpdateRelatedTask(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-150 bg-white hover:bg-slate-55 px-3 py-2.5 text-xs text-slate-700 font-bold focus:outline-none shadow-3xs cursor-pointer pr-8"
                    >
                      <option value="">Not related to any task</option>
                      {selectedProjTasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Assignees */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Assignees</label>
                <div className="flex flex-wrap gap-2">
                  {activeDetailItem.assignees.map((a, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-3xs"
                    >
                      <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shrink-0 shadow-3xs", a.bg || 'bg-indigo-500')}>
                        {a.initials}
                      </div>
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screenshots / Attachments for issues */}
              {activeDetailItem.itemType === 'issue' && (
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

                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-250 bg-slate-55 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer">
                    <UploadCloud className="h-4 w-4 text-slate-405" />
                    <span className="text-[10px] font-bold text-slate-505">
                      {uploadingImage ? 'Uploading image...' : 'Upload screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAddAttachment(e.target.files)}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              )}

              {/* Subtask Checklist */}
              {activeDetailItem.itemType === 'task' && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-650 flex items-center gap-1.5 pb-1 font-sans">
                    <CheckSquare className="h-3.5 w-3.5 text-indigo-655" />
                    Subtask Checklist
                  </h3>

                  <div className="border border-slate-200/85 rounded-2xl p-4.5 space-y-4 bg-white shadow-3xs">
                    <div className="space-y-2">
                      {(!activeDetailItem.subtasks || activeDetailItem.subtasks.length === 0) ? (
                        <div className="py-2 text-center text-slate-400 font-semibold text-[11px]">
                          No subtasks defined yet.
                        </div>
                      ) : (
                        activeDetailItem.subtasks.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-2.5 bg-white border border-slate-150 p-2.5 rounded-xl shadow-3xs hover:border-slate-200 transition-colors cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              disabled={isClient}
                              onChange={() => handleToggleSubtask(sub.id)}
                              className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5 disabled:opacity-75 disabled:cursor-not-allowed"
                            />
                            <span className={cn(
                              "text-xs font-bold text-slate-700",
                              sub.completed && "line-through text-slate-400"
                            )}>
                              {sub.title}
                            </span>
                          </label>
                        ))
                      )}
                    </div>

                    {/* Add checklist item */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <input
                        type="text"
                        value={newSubtaskText}
                        onChange={(e) => setNewSubtaskText(e.target.value)}
                        placeholder="Add another checklist task item..."
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 bg-white transition-all placeholder:text-slate-400"
                      />
                      <button
                        onClick={handleAddSubtask}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-650 px-4.5 py-2 text-xs font-black transition-all cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Discussion */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-indigo-655 flex items-center gap-1.5 pb-1 font-sans">
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
                    .map((comment) => (
                      <div key={comment.id} className="bg-slate-50/50 border border-slate-200 p-3 rounded-2xl shadow-3xs flex gap-3">
                        <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[9px] text-white font-extrabold shrink-0 shadow-2xs bg-indigo-500")}>
                          {comment.initials}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-808">{comment.author}</span>
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
                <span>{activeDetailItem.itemType === 'task' ? 'Delete Task' : 'Delete Issue'}</span>
              </button>
              <button
                onClick={() => setActiveDetailItem(null)}
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
