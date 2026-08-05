import { Loader2, ListTodo, Bug, Clock3, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WorkshopKanbanBoardProps } from '@/types/workshop.types';

export function WorkshopKanbanBoard({
  kanbanLoading,
  kanbanColumns,
  draggedOverCol,
  isClient,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragStart,
  handleCardClick
}: WorkshopKanbanBoardProps) {
  const getCardPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'Urgent':
      case 'Critical':
        return 'bg-red-50 text-red-655 border border-red-150';
      case 'High':
        return 'bg-orange-50 text-orange-655 border border-orange-150';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-650 border border-indigo-150';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-150';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start min-h-[60vh]">
      {kanbanLoading ? (
        <div className="col-span-4 flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        </div>
      ) : (
        kanbanColumns.map((col) => {
          const totalCount = col.tasks.length + col.issues.length;
          const isOver = draggedOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                "flex flex-col bg-slate-50 border rounded-2xl p-3 space-y-3 min-h-[500px] transition-colors duration-200",
                isOver ? "border-indigo-500 bg-indigo-50/20" : "border-slate-200"
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full border", col.id === 'done' ? 'bg-emerald-500 animate-pulse' : col.id === 'inreview' ? 'bg-amber-500' : col.id === 'inprogress' ? 'bg-indigo-500' : 'bg-slate-400')} />
                  <h3 className="text-xs font-black text-slate-750">{col.title}</h3>
                </div>
                <Badge className="bg-white border border-slate-200 text-slate-505 font-extrabold text-[9px] px-1.5 py-0.5 shadow-3xs">
                  {totalCount}
                </Badge>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5">
                {totalCount === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-semibold text-[10px] border border-dashed border-slate-200 rounded-xl bg-white/40">
                    Drop cards here
                  </div>
                ) : (
                  <>
                    {/* Tasks */}
                    {col.tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable={!isClient}
                        onDragStart={(e) => handleDragStart(e, task.id, 'task')}
                        onClick={() => handleCardClick(task.id, 'task')}
                        className={cn(
                          "bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between hover:shadow-2xs hover:border-indigo-150 transition-all relative overflow-hidden group",
                          isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
                          task.status === 'Done' && "opacity-80"
                        )}
                      >
                        <span className="absolute inset-y-0 left-0 w-1 bg-indigo-500" />
                        <div className="space-y-1 pl-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5">
                              <ListTodo className="h-3.5 w-3.5 text-indigo-650 shrink-0 mt-0.5" />
                              <h4 className={cn(
                                "text-xs font-bold text-slate-805 tracking-tight leading-snug group-hover:text-indigo-650 transition-colors",
                                task.status === 'Done' && "line-through text-slate-400"
                              )}>
                                {task.title}
                              </h4>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold line-clamp-2">
                            {task.description}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 mt-3.5 pt-2.5 pl-1 text-[9px]">
                          <div className="flex items-center gap-1">
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase", getCardPriorityBadge(task.priority))}>
                              {task.priority}
                            </span>
                            {task.actualHours ? (
                              <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 font-bold">
                                <Clock3 className="h-2.5 w-2.5" />
                                {task.actualHours}h
                              </span>
                            ) : null}
                          </div>

                          {/* Assignees */}
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1 overflow-hidden">
                              {task.assignees?.map((a, i) => (
                                <div
                                  key={i}
                                  title={a.name}
                                  className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold ring-2 ring-white shadow-3xs shrink-0", a.bg)}
                                >
                                  {a.initials}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Issues */}
                    {col.issues.map((issue) => (
                      <div
                        key={issue.id}
                        draggable={!isClient}
                        onDragStart={(e) => handleDragStart(e, issue.id, 'issue')}
                        onClick={() => handleCardClick(issue.id, 'issue')}
                        className={cn(
                          "bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between hover:shadow-2xs hover:border-red-150 transition-all relative overflow-hidden group",
                          isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
                          issue.status === 'Closed' && "opacity-80"
                        )}
                      >
                        <span className="absolute inset-y-0 left-0 w-1 bg-red-500" />
                        <div className="space-y-1 pl-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5">
                              <Bug className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                              <h4 className={cn(
                                "text-xs font-bold text-slate-805 tracking-tight leading-snug group-hover:text-red-650 transition-colors",
                                issue.status === 'Closed' && "line-through text-slate-400"
                              )}>
                                {issue.title}
                              </h4>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            <Badge className="bg-red-50 text-red-550 border border-red-100 text-[8px] py-px px-1 font-bold shrink-0">{issue.type}</Badge>
                            {issue.relatedTaskTitle && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shrink-0" title={`Related Task: ${issue.relatedTaskTitle}`}>
                                <Bookmark className="h-2 w-2 shrink-0 text-slate-500" />
                                <span className="truncate max-w-[80px]">{issue.relatedTaskTitle}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-455 leading-relaxed font-semibold line-clamp-2 mt-1">
                            {issue.description}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 mt-3.5 pt-2.5 pl-1 text-[9px]">
                          <div className="flex items-center gap-1">
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase", getCardPriorityBadge(issue.priority))}>
                              {issue.priority}
                            </span>
                            {(issue as any).actualHours ? (
                              <span className="flex items-center gap-0.5 bg-emerald-55 text-emerald-600 border border-emerald-100 rounded px-1.5 py-0.5 font-bold">
                                <Clock3 className="h-2.5 w-2.5" />
                                {(issue as any).actualHours}h
                              </span>
                            ) : null}
                          </div>

                          {/* Assignees */}
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1 overflow-hidden">
                              {issue.assignees?.map((a, i) => (
                                <div
                                  key={i}
                                  title={a.name}
                                  className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold ring-2 ring-white shadow-3xs shrink-0", a.bg)}
                                >
                                  {a.initials}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
