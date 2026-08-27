import { Bookmark, Folder, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintBoardProps } from '@/types/sprint.types';

export function SprintBoard({
  filteredSprintItems,
  columns,
  draggedOverCol,
  isClient,
  monday,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragStart,
  handleItemClick,
  setSelectedEmployee,
}: SprintBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {columns.map(col => {
        const colItems = filteredSprintItems.filter(item => item.status === col);
        return (
          <div 
            key={col} 
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={cn(
              "p-4 rounded-3xl flex flex-col min-h-[450px] transition-all border", 
              draggedOverCol === col ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-900 border-dashed" : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">{col}</span>
              </div>
              <span className="rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-[9px] font-black text-slate-500 dark:text-slate-400 shadow-3xs">
                {colItems.length}
              </span>
            </div>

            <div className="flex-1 space-y-3.5">
              {colItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl text-slate-300 dark:text-slate-600 text-[10px] font-bold text-center h-28 select-none">
                  No tasks or issues in this stage
                </div>
              ) : (
                colItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    draggable={!isClient}
                    onDragStart={(e) => handleDragStart(e, item.id, item.itemType)}
                    className={cn(
                      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-4 rounded-2xl shadow-3xs select-none transition-all hover:shadow-md hover:-translate-y-0.5 group active:opacity-60",

                      isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-extrabold text-[8px] uppercase tracking-wider",
                        item.itemType === 'task' ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30" : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/30 dark:border-rose-900/30"
                      )}>
                        {item.itemType === 'task' ? 'Task' : `Issue: ${item.type || 'Bug'}`}
                      </span>

                      {item.itemType === 'issue' && item.relatedTaskTitle && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 shrink-0" title={`Related Task: ${item.relatedTaskTitle}`}>
                          <Bookmark className="h-2 w-2 shrink-0 text-slate-500" />
                          <span className="truncate max-w-[80px]">{item.relatedTaskTitle}</span>
                        </span>
                      )}
                      
                      {/* Priority Badge */}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider ml-auto",
                        item.priority === 'Urgent' || item.priority === 'Critical' ? "text-rose-600 dark:text-rose-450" :
                        item.priority === 'High' ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"
                      )}>
                        {item.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 flex items-center gap-1 truncate">
                      <Folder className="h-3 w-3 text-slate-400" />
                      <span>{item.projectName}</span>
                    </p>

                    <div className="border-t border-slate-100/80 dark:border-slate-800 pt-3 mt-3 flex items-center justify-between">
                      {/* Due date */}
                      <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 dark:text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span className={cn(
                          new Date(item.dueDate) < new Date(monday) && item.status !== 'Done' ? "text-rose-600 dark:text-rose-450 font-black" : ""
                        )}>
                          {item.dueDate === 'No Due Date' ? 'No Due Date' : new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Assignees initials circle */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {(item.assignees || []).map((a, idx) => (
                          <div
                            key={idx}
                            title={a.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(a);
                            }}
                            className={cn(
                              "h-5.5 w-5.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[7px] text-white font-extrabold shadow-3xs cursor-pointer hover:scale-110 transition-transform",

                              a.bg || "bg-indigo-600"
                            )}
                          >
                            {a.initials}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
