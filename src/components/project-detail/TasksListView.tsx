import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TasksListViewProps } from '@/types/tasks.types';

export function TasksListView({
  displayTasks,
  canDeleteTask,
  onMoveTask,
  onDeleteTask,
  onSelectTask,
  getPriorityColor,
}: TasksListViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="py-3.5 px-6">Task Title</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Assignees</th>
              <th className="py-3.5 px-4 text-center">Subtasks</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
            {displayTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                  No tasks created yet. Click "Add Task" to get started.
                </td>
              </tr>
            ) : (
              displayTasks.map(task => {
                const totalSubs = task.subtasks?.length || 0;
                const compSubs = task.subtasks?.filter(s => s.completed).length || 0;
                return (
                  <tr 
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTask(task.id, task.status === 'Done' ? 'To Do' : 'Done');
                          }}
                          className="h-4.5 w-4.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-center text-white hover:text-indigo-600 transition-colors shrink-0"
                        >
                          {task.status === 'Done' && (
                            <div className="h-2.5 w-2.5 rounded bg-indigo-600" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors", task.status === 'Done' && "line-through text-slate-400 dark:text-slate-550")}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-sm">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                        task.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30' :
                        task.status === 'In Review' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30' :
                        task.status === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30' :
                        'bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800'
                      )}>
                        {task.status}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4">
                      <span className={cn("rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                      {task.dueDate}
                    </td>

                    {/* Assignees */}
                    <td className="py-4 px-4">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {task.assignees?.map((assignee, idx) => (
                          <div key={idx} className={cn("h-6 w-6 rounded-md text-[7px] font-extrabold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-3xs shrink-0", assignee.bg)} title={assignee.name}>
                            {assignee.initials}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Subtask count */}
                    <td className="py-4 px-4 text-center">
                      {totalSubs > 0 ? (
                        <span className={cn("text-xs font-bold", compSubs === totalSubs ? "text-emerald-600" : "text-slate-500 dark:text-slate-400")}>
                          {compSubs} / {totalSubs}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 dark:text-slate-700 font-bold">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {canDeleteTask && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="text-slate-400 dark:text-slate-500 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
