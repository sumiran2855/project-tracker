import React from 'react';
import { 
  Bookmark, 
  X, 
  Folder, 
  ChevronDown, 
  Clock, 
  CheckSquare, 
  CheckCircle2, 
  MessageSquare, 
  Trash2,
  Calendar
} from 'lucide-react';
import { cn, formatCommentTime, getCommentTimestamp } from '@/lib/utils';
import type { Task, GlobalTask, TasksTaskDetailDrawerProps } from '@/types/tasks.types';

export function TaskDetailDrawer({
  selectedTask,
  setSelectedTask,
  isClient,
  canEditHours,
  canDeleteTask,
  newSubtaskTitle,
  setNewSubtaskTitle,
  newCommentText,
  setNewCommentText,
  user,
  handleUpdateTask,
  handleDeleteTask,
  submitUpdateTask,
}: TasksTaskDetailDrawerProps) {
  if (!selectedTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-955/40 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedTask(null)} />
      
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slideIn">
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-indigo-650 font-black text-[10px] uppercase tracking-widest">
              <Bookmark className="h-4 w-4 text-indigo-500" />
              <span>Global Task Workspace Details</span>
            </div>
            <button 
              onClick={() => setSelectedTask(null)}
              className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{selectedTask.title}</h2>
            <div className="flex items-center gap-1.5 text-xs text-indigo-650 font-bold">
              <Folder className="h-4 w-4" />
              <span>Associated Project: {selectedTask.projectName}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-150 rounded-2xl p-4">
              {selectedTask.description || "No description provided for this task."}
            </p>
          </div>

          {/* Task Options */}
          <div className="grid grid-cols-2 gap-4 bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs">
            
            {/* Status */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <div className="relative">
                <select
                  value={selectedTask.status}
                  disabled={isClient}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, status: e.target.value as Task['status'] })}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer pr-8 focus:outline-none appearance-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-455 pointer-events-none" />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Priority</span>
              <div className="relative">
                <select
                  value={selectedTask.priority}
                  disabled={isClient}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, priority: e.target.value as Task['priority'] })}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer pr-8 focus:outline-none appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-455 pointer-events-none" />
              </div>
            </div>

            {/* Hours Spent */}
            <div className="col-span-2 border-t border-slate-100 pt-3.5 space-y-2 animate-fadeIn">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hours Spent (Actual)</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-750 flex items-center gap-1.5 shadow-2xs">
                  <Clock className="h-4 w-4 text-slate-405 shrink-0" />
                  <span>{selectedTask.actualHours || 0} hours total</span>
                </div>
                {canEditHours && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="Log hours..."
                      id="task-log-hours-input"
                      className="w-24 text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const input = document.getElementById('task-log-hours-input') as HTMLInputElement;
                        const val = parseFloat(input?.value || '0');
                        if (val > 0) {
                          await submitUpdateTask(selectedTask, val, true);
                          if (input) input.value = '';
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

            {/* Dates */}
            <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  {selectedTask.startDate}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5 mt-1">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  {selectedTask.dueDate}
                </span>
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Assignees</span>
            <div className="flex flex-wrap gap-2.5">
              {(selectedTask.assignees || []).map((assignee, idx) => (
                <div key={idx} className="flex items-center gap-1.8 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[9px] text-white font-black shadow-3xs mr-2", assignee.bg || 'bg-indigo-550')}>
                    {assignee.initials}
                  </div>
                  <span className="text-[10px] font-bold text-slate-650">{assignee.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-3 pt-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-indigo-650" />
              <span>Subtask Checklist</span>
            </span>
            
            <div className="space-y-2 bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
              {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) ? (
                <p className="text-[10px] text-slate-400 font-bold text-center py-4">No subtasks defined.</p>
              ) : (
                selectedTask.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between group/sub">
                    <button
                      disabled={isClient}
                      onClick={() => {
                        const updatedSubs = selectedTask.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                        handleUpdateTask({ ...selectedTask, subtasks: updatedSubs });
                      }}
                      className={cn("flex items-center gap-2.5 flex-1 text-left", isClient ? "cursor-not-allowed" : "cursor-pointer")}
                    >
                      <div className={cn(
                        "h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-colors",
                        sub.completed ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-350 bg-white"
                      )}>
                        {sub.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className={cn("text-xs font-bold transition-all", sub.completed ? "line-through text-slate-400" : "text-slate-700")}>
                        {sub.title}
                      </span>
                    </button>
                    
                    {!isClient && (
                      <button 
                        onClick={() => {
                          const updatedSubs = selectedTask.subtasks.filter(s => s.id !== sub.id);
                          handleUpdateTask({ ...selectedTask, subtasks: updatedSubs });
                        }}
                        className="text-slate-450 opacity-0 group-hover/sub:opacity-100 hover:text-red-500 transition-opacity p-1 hover:bg-slate-105 rounded-lg cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSubtaskTitle.trim()) return;
                    const newSub = { id: `sub_${Date.now()}`, title: newSubtaskTitle, completed: false };
                    handleUpdateTask({ ...selectedTask, subtasks: [...(selectedTask.subtasks || []), newSub] });
                    setNewSubtaskTitle('');
                  }}
                  className="flex gap-2 border-t border-slate-200/80 pt-3.5 mt-3.5"
                >
                  <input
                    type="text"
                    required
                    placeholder="Add checklist item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-405 focus:border-indigo-500 focus:outline-none"
                  />
                  <button type="submit" className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-xs font-bold transition-colors cursor-pointer shrink-0">
                    Add
                  </button>
                </form>
            </div>
          </div>

          {/* Discussion */}
          <div className="space-y-4 pt-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-indigo-650" />
              <span>Discussion ({selectedTask.comments?.length || 0})</span>
            </span>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCommentText.trim()) return;
                  const currentUserInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'DU';
                  const currentUserName = user?.name || 'Dev User';
                  const newComm = { id: `comm_${Date.now()}`, author: currentUserName, initials: currentUserInitials, text: newCommentText, time: new Date().toISOString() };
                  handleUpdateTask({ ...selectedTask, comments: [newComm, ...(selectedTask.comments || [])] });
                  setNewCommentText('');
                }}
                className="flex gap-3"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'DU'}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Post a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="px-4.5 py-1.8 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold shadow-sm cursor-pointer">
                      Comment
                    </button>
                  </div>
                </div>
              </form>

            <div className="space-y-3.5 pt-2">
              {[...(selectedTask.comments || [])]
                .sort((a, b) => getCommentTimestamp(b) - getCommentTimestamp(a))
                .map(comment => (
                  <div key={comment.id} className="flex gap-3 bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
                    <div className={cn("h-7 w-7 rounded-lg text-[9px] font-black text-white flex items-center justify-center shrink-0 shadow-3xs bg-indigo-600")}>
                      {comment.initials}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-850">{comment.author}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{formatCommentTime(comment.time)}</span>
                      </div>
                      <p className="text-xs text-slate-655 font-medium leading-relaxed break-words">{comment.text}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-4.5 flex justify-between items-center">
          {canDeleteTask ? (
            <button
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Task</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => setSelectedTask(null)}
            className="px-4.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-650 text-xs font-bold shadow-3xs cursor-pointer hover:bg-slate-50 transition-colors"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
