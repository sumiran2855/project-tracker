import { Plus, CheckSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, GlobalTask, TasksBoardProps } from '@/types/tasks.types';

export function TasksBoard({
  filteredTasks,
  isClient,
  canCreateTask,
  setIsTaskModalOpen,
  setNewTaskStatus,
  handleDragStart,
  handleDrop,
  setSelectedTask,
}: TasksBoardProps) {
  const columns: Task['status'][] = ['To Do', 'In Progress', 'In Review', 'Done'];

  const getPriorityColor = (prio: Task['priority']) => {
    switch (prio) {
      case 'Urgent':
        return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30';
      case 'High':
        return 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/30';
      case 'Medium':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {columns.map(status => {
        const colTasks = filteredTasks.filter(t => t.status === status);
        return (
          <div 
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            className="bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4.5 flex flex-col min-h-[350px] shadow-2xs"
          >
            {/* Col Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  status === 'To Do' ? 'bg-slate-400' :
                  status === 'In Progress' ? 'bg-indigo-500' :
                  status === 'In Review' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">{status}</span>
                <span className="rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {canCreateTask && (
                <button 
                  onClick={() => {
                    setNewTaskStatus(status);
                    setIsTaskModalOpen(true);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Tasks List */}
            <div className="space-y-3.5 flex-1 pr-1.5 overflow-y-auto max-h-[60vh] no-scrollbar">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-300 dark:text-slate-600 text-[10px] font-bold text-center h-28 select-none">
                  Drop Tasks Here
                </div>
              ) : (
                colTasks.map(task => {
                  const total = task.subtasks?.length || 0;
                  const done = (task.subtasks || []).filter(s => s.completed).length;
                  return (
                    <div
                      key={task.id}
                      draggable={!isClient}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "group flex flex-col justify-between bg-white dark:bg-slate-950 border border-slate-202/85 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 relative overflow-hidden",
                        isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      <div className="space-y-3.5">
                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <span className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                            {task.priority}
                          </span>
                          <span className="text-[8px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-widest max-w-[120px] truncate" title={task.projectName}>
                            {task.projectName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1.5 font-medium">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
                          {total > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckSquare className="h-3.5 w-3.5" />
                              {done}/{total}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.dueDate}
                          </span>
                        </div>

                        <div className="flex -space-x-1 overflow-hidden">
                          {(task.assignees || []).map((assignee, idx) => (
                            <div key={idx} className={cn("h-5.5 w-5.5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-950 shadow-3xs shrink-0", assignee.bg || 'bg-indigo-600')} title={assignee.name}>
                              {assignee.initials}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
