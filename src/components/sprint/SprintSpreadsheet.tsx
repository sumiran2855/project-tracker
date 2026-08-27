import { cn } from '@/lib/utils';
import type { SprintSpreadsheetProps } from '@/types/sprint.types';

export function SprintSpreadsheet({
  filteredSprintItems,
  monday,
  handleItemClick,
}: SprintSpreadsheetProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-3xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Type</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Title</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Project</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Assignees</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Priority</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSprintItems.map(item => (
              <tr
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-950/20 transition-colors cursor-pointer group"
              >
                <td className="px-5 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase tracking-wider shrink-0",
                    item.itemType === 'task' ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30" : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/30 dark:border-rose-900/30"
                  )}>
                    {item.itemType === 'task' ? 'Task' : 'Issue'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                    {item.title}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {item.projectName}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center -space-x-1 overflow-hidden">
                    {(item.assignees || []).map((a, idx) => (
                      <div
                        key={idx}
                        title={a.name}
                        className={cn(
                          "h-5 w-5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs",
                          a.bg || "bg-indigo-600"
                        )}
                      >
                        {a.initials}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-[9px] font-black uppercase tracking-wider">
                  <span className={cn(
                    item.priority === 'Urgent' || item.priority === 'Critical' ? "text-rose-600 dark:text-rose-450" :
                    item.priority === 'High' ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className={cn(
                    new Date(item.dueDate) < new Date(monday) && item.status !== 'Done' ? "text-rose-600 dark:text-rose-450 font-black" : ""
                  )}>
                    {item.dueDate === 'No Due Date' ? 'No Due Date' : new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border",
                    item.status === 'Done' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/30 dark:border-emerald-900/30" :
                    item.status === 'In Review' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border-amber-100/30 dark:border-indigo-900/30" :
                    item.status === 'In Progress' ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100/30 dark:border-indigo-900/30" :
                    "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800"
                  )}>
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                  {(item.workLogs || []).reduce((sum: number, wl: any) => sum + (Number(wl.hours) || 0), 0)}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
