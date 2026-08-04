import React from 'react';
import { Plus, CheckSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GlobalTask } from '@/services/useTasksService';
import type { Task } from '@/types/tasks.types';

interface TasksBoardProps {
  filteredTasks: GlobalTask[];
  isClient: boolean;
  canCreateTask: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  setNewTaskStatus: (status: Task['status']) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
  handleDrop: (e: React.DragEvent, targetStatus: Task['status']) => void;
  setSelectedTask: (task: GlobalTask) => void;
}

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
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/50';
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
            className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-4.5 flex flex-col min-h-[350px] shadow-2xs"
          >
            {/* Col Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  status === 'To Do' ? 'bg-slate-400' :
                  status === 'In Progress' ? 'bg-indigo-500' :
                  status === 'In Review' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <span className="text-xs font-black text-slate-808 uppercase tracking-wider">{status}</span>
                <span className="rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {canCreateTask && (
                <button 
                  onClick={() => {
                    setNewTaskStatus(status);
                    setIsTaskModalOpen(true);
                  }}
                  className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Tasks List */}
            <div className="space-y-3.5 flex-1 pr-1.5 overflow-y-auto max-h-[60vh] no-scrollbar">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-bold text-center h-28 select-none">
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
                        "group flex flex-col justify-between bg-white border border-slate-200/85 hover:border-slate-350 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 relative overflow-hidden",
                        isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      <div className="space-y-3.5">
                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <span className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                            {task.priority}
                          </span>
                          <span className="text-[8px] text-indigo-500 font-extrabold uppercase tracking-widest max-w-[120px] truncate" title={task.projectName}>
                            {task.projectName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-650 transition-colors">
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed mt-1.5 font-medium">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
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
                            <div key={idx} className={cn("h-5.5 w-5.5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", assignee.bg || 'bg-indigo-600')} title={assignee.name}>
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
