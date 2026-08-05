import { X, Bookmark, ChevronDown, Clock, CalendarDays, CheckSquare, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react';
import { cn, formatCommentTime, getCommentTimestamp } from '@/lib/utils';
import { updateTaskAction } from '@/actions/tasks';
import type { Task, ProjectDetailTaskDetailDrawerProps } from '@/types/tasks.types';

export function TaskDetailDrawer({
  selectedTask,
  onClose,
  isClient,
  canEditHours,
  canDeleteTask,
  tasks,
  saveTasks,
  onMoveTask,
  setSelectedTask,
  onDeleteTask,
  newSubtaskTitle,
  setNewSubtaskTitle,
  newCommentText,
  setNewCommentText,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddComment,
  user,
}: ProjectDetailTaskDetailDrawerProps) {
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'DU';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-955/40 backdrop-blur-md animate-fadeIn">
      {/* Backdrop close area */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slideIn">
        
        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-6">
          
          {/* Header section */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-indigo-650 font-black text-[10px] uppercase tracking-widest">
              <Bookmark className="h-4 w-4 text-indigo-500" />
              <span>Task Workspace Details</span>
            </div>
            <button 
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{selectedTask.title}</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 border border-slate-150 rounded-2xl p-4">
              {selectedTask.description || "No description provided for this task."}
            </p>
          </div>

          {/* Task configuration options */}
          <div className="grid grid-cols-2 gap-4 bg-white border border-slate-155 p-4 rounded-2xl shadow-3xs">
            
            {/* Status Column */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <div className="relative">
                <select
                  value={selectedTask.status}
                  disabled={isClient}
                  onChange={(e) => onMoveTask(selectedTask.id, e.target.value as Task['status'])}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-455 pointer-events-none" />
              </div>
            </div>

            {/* Priority Column */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Priority</span>
              <div className="relative">
                <select
                  value={selectedTask.priority}
                  disabled={isClient}
                  onChange={(e) => {
                    const updated = tasks.map(t => t.id === selectedTask.id ? { ...t, priority: e.target.value as Task['priority'] } : t);
                    saveTasks(updated);
                    setSelectedTask({ ...selectedTask, priority: e.target.value as Task['priority'] });
                  }}
                  className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-2 text-slate-455 pointer-events-none" />
              </div>
            </div>

            {/* Hours Spent Column */}
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
                      id="project-task-log-hours-input"
                      className="w-24 text-xs font-bold rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const input = document.getElementById('project-task-log-hours-input') as HTMLInputElement;
                        const val = parseFloat(input?.value || '0');
                        if (val > 0) {
                          const res = await updateTaskAction(selectedTask.id, { newWorkLog: { hours: val } } as any);
                          if (res.success && res.data) {
                            const updatedTask = {
                              ...res.data,
                              projectId: selectedTask.projectId,
                              projectName: selectedTask.projectName
                            };
                            setSelectedTask(updatedTask);
                            saveTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
                            if (input) input.value = '';
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

            {/* Dates */}
            <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5 mt-1">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
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
              {selectedTask.assignees?.map((assignee, idx) => (
                <div key={idx} className="flex items-center gap-1.8 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[9px] text-white font-black shadow-3xs", assignee.bg)}>
                    {assignee.initials}
                  </div>
                  <span className="text-[10px] font-bold text-slate-650">{assignee.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist Section */}
          <div className="space-y-3 pt-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="h-4 w-4 text-indigo-650" />
              <span>Subtask Checklist</span>
            </span>
            
            {/* Checklist loop */}
            <div className="space-y-2 bg-slate-50/50 border border-slate-150 rounded-2xl p-4">
              {selectedTask.subtasks?.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold text-center py-4">No subtasks defined yet.</p>
              ) : (
                selectedTask.subtasks?.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between group/sub">
                    <button
                      disabled={isClient}
                      onClick={() => onToggleSubtask(sub.id)}
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
                        onClick={() => onDeleteSubtask(sub.id)}
                        className="text-slate-455 opacity-0 group-hover/sub:opacity-100 hover:text-red-500 transition-opacity p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}

              {/* Add subtask Form */}
                <form onSubmit={onAddSubtask} className="flex gap-2 border-t border-slate-200/80 pt-3.5 mt-3.5">
                  <input
                    type="text"
                    required
                    placeholder="Add another checklist task item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </form>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-indigo-650" />
              <span>Discussion ({selectedTask.comments?.length || 0})</span>
            </span>

            {/* Add Comment input */}
              <form onSubmit={onAddComment} className="flex gap-3">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Ask a question or post progress notes..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4.5 py-1.8 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold shadow-sm shadow-indigo-650/10 cursor-pointer"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </form>

            {/* Comment loops */}
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
                        <span className="text-[10px] font-bold text-slate-800">{comment.author}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{formatCommentTime(comment.time)}</span>
                      </div>
                      <p className="text-xs text-slate-655 font-medium leading-relaxed break-words">{comment.text}</p>
                    </div>
                  </div>
                ))}
            </div>

          </div>

        </div>

        {/* Footer options */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-4.5 flex justify-between items-center">
          {canDeleteTask ? (
            <button
              onClick={() => onDeleteTask(selectedTask.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Task</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-650 text-xs font-bold shadow-3xs cursor-pointer hover:bg-slate-50 transition-colors"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
