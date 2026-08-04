import { Clock, Plus, CheckSquare, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/tasks.types';

interface TasksKanbanViewProps {
  displayTasks: Task[];
  isClient: boolean;
  canCreateTask: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, status: Task['status']) => void;
  onSelectTask: (task: Task) => void;
  onAddTaskClick: (status: Task['status']) => void;
  getPriorityColor: (prio: Task['priority']) => string;
}

export function TasksKanbanView({
  displayTasks,
  isClient,
  canCreateTask,
  onDragStart,
  onDrop,
  onSelectTask,
  onAddTaskClick,
  getPriorityColor,
}: TasksKanbanViewProps) {
  const lanes: Task['status'][] = ['To Do', 'In Progress', 'In Review', 'Done'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {lanes.map(status => {
        const columnTasks = displayTasks.filter(t => t.status === status);
        return (
          <div 
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-4.5 flex flex-col min-h-[300px] shadow-2xs"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  status === 'To Do' ? 'bg-slate-400' :
                  status === 'In Progress' ? 'bg-indigo-500' :
                  status === 'In Review' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{status}</span>
                <span className="rounded-full bg-white border border-slate-200 text-slate-505 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                  {columnTasks.length}
                </span>
              </div>

              {canCreateTask && (
                <button 
                  onClick={() => onAddTaskClick(status)}
                  className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Add task to column"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Task list inside column */}
            <div className="space-y-3.5 flex-1 pr-1.5">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-bold text-center h-28 select-none">
                  Drop Tasks Here
                </div>
              ) : (
                columnTasks.map(task => {
                  const totalSubs = task.subtasks?.length || 0;
                  const compSubs = task.subtasks?.filter(s => s.completed).length || 0;
                  
                  return (
                    <div
                      key={task.id}
                      draggable={!isClient}
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onClick={() => onSelectTask(task)}
                      className={cn(
                        "group flex flex-col justify-between bg-white border border-slate-200/85 hover:border-slate-355 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 relative overflow-hidden",
                        isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      <div className="space-y-3">
                        {/* Top metadata */}
                        <div className="flex items-center justify-between">
                          <span className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                            {task.priority}
                          </span>

                          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.dueDate}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-650 transition-colors">
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Task metrics & Footer */}
                      <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                        {/* Left indicators */}
                        <div className="flex items-center gap-2.5 text-slate-400">
                          {totalSubs > 0 && (
                            <div className="flex items-center gap-1 text-[9px] font-bold" title="Subtasks">
                              <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                              <span className={compSubs === totalSubs ? "text-emerald-600" : ""}>
                                {compSubs}/{totalSubs}
                              </span>
                            </div>
                          )}
                          
                          {task.comments && task.comments.length > 0 && (
                            <div className="flex items-center gap-1 text-[9px] font-bold" title="Comments">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{task.comments.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Member initials */}
                        <div className="flex -space-x-1 overflow-hidden">
                          {task.assignees?.map((assignee, i) => (
                            <div key={i} className={cn("h-5 w-5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-2xs", assignee.bg)} title={assignee.name}>
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
