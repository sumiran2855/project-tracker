import React from 'react';
import { cn } from '@/lib/utils';
import type { SprintItem } from '@/services/useSprintService';

interface SprintSpreadsheetProps {
  filteredSprintItems: SprintItem[];
  monday: Date;
  handleItemClick: (item: SprintItem) => void;
}

export function SprintSpreadsheet({
  filteredSprintItems,
  monday,
  handleItemClick,
}: SprintSpreadsheetProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Type</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Title</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Project</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Assignees</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Priority</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Due Date</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455">Status</th>
              <th className="px-5 py-4.5 text-[9px] font-black uppercase tracking-wider text-slate-455 text-right">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSprintItems.map(item => (
              <tr
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <td className="px-5 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase tracking-wider shrink-0",
                    item.itemType === 'task' ? "bg-indigo-50 text-indigo-650 border border-indigo-100/30" : "bg-rose-50 text-rose-600 border border-rose-100/30"
                  )}>
                    {item.itemType === 'task' ? 'Task' : 'Issue'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs font-black text-slate-808 group-hover:text-indigo-650 transition-colors tracking-tight">
                    {item.title}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-500">
                  {item.projectName}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center -space-x-1 overflow-hidden">
                    {(item.assignees || []).map((a, idx) => (
                      <div
                        key={idx}
                        title={a.name}
                        className={cn(
                          "h-5 w-5 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs",
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
                    item.priority === 'Urgent' || item.priority === 'Critical' ? "text-rose-600" :
                    item.priority === 'High' ? "text-amber-500" : "text-slate-400"
                  )}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs font-bold text-slate-500">
                  <span className={cn(
                    new Date(item.dueDate) < new Date(monday) && item.status !== 'Done' ? "text-rose-600 font-black" : ""
                  )}>
                    {item.dueDate === 'No Due Date' ? 'No Due Date' : new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border",
                    item.status === 'Done' ? "bg-emerald-50 text-emerald-600 border-emerald-100/30" :
                    item.status === 'In Review' ? "bg-amber-50 text-amber-600 border-amber-100/30" :
                    item.status === 'In Progress' ? "bg-indigo-50 text-indigo-650 border-indigo-100/30" :
                    "bg-slate-50 text-slate-500 border-slate-100"
                  )}>
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-xs font-bold text-slate-700">
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
