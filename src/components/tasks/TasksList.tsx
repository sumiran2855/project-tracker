import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TasksListProps } from '@/types/tasks.types';

export function TasksList({
  filteredTasks,
  canDeleteTask,
  handleUpdateTask,
  handleDeleteTask,
  setSelectedTask,
}: TasksListProps) {
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
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-450">
              <th className="py-3.5 px-6">Task Title</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Assignees</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs font-bold text-slate-400">
                  No tasks match the filters. Try adjusting search criteria.
                </td>
              </tr>
            ) : (
              filteredTasks.map(task => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                >
                  {/* Title */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStatus: Task['status'] = task.status === 'Done' ? 'To Do' : 'Done';
                          handleUpdateTask({ ...task, status: nextStatus });
                        }}
                        className="h-4.5 w-4.5 rounded-lg border border-slate-250 hover:border-indigo-500 bg-white flex items-center justify-center text-white hover:text-indigo-650 transition-colors shrink-0 cursor-pointer"
                      >
                        {task.status === 'Done' && (
                          <div className="h-2.5 w-2.5 rounded bg-indigo-600" />
                        )}
                      </button>
                      <p className={cn("text-xs font-bold text-slate-800 group-hover:text-indigo-655 transition-colors", task.status === 'Done' && "line-through text-slate-400")}>
                        {task.title}
                      </p>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="py-4 px-4 text-xs font-bold text-indigo-655">
                    {task.projectName}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                      task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                      task.status === 'In Review' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                      task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100/50' :
                      'bg-slate-50 text-slate-500 border-slate-200/50'
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
                  <td className="py-4 px-4 text-xs font-bold text-slate-500">
                    {task.dueDate}
                  </td>

                  {/* Assignees */}
                  <td className="py-4 px-4">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {(task.assignees || []).map((assignee, idx) => (
                        <div key={idx} className={cn("h-6 w-6 rounded-md text-[7px] font-extrabold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", assignee.bg || 'bg-indigo-600')} title={assignee.name}>
                          {assignee.initials}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    {canDeleteTask && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-slate-400 hover:text-red-505 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
