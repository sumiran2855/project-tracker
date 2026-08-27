import { cn } from '@/lib/utils';
import type { TasksTimelineViewProps } from '@/types/tasks.types';

export function TasksTimelineView({
  displayTasks,
  onSelectTask,
  getPriorityColor,
}: TasksTimelineViewProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs overflow-hidden">
      {displayTasks.length === 0 ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
          No tasks to display in timeline. Create tasks to render the Gantt chart.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timeline calendar bar header */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <div className="w-1/3 shrink-0">Task details</div>
            <div className="flex-1 flex justify-between relative pl-4">
              <span>Jul 01</span>
              <span>Jul 07</span>
              <span>Jul 14</span>
              <span>Jul 21</span>
              <span>Jul 28</span>
              <span className="absolute inset-y-0 left-0 right-0 border-l border-r border-dashed border-slate-202/50 dark:border-slate-800/80" />
            </div>
          </div>

          {/* Timeline rows */}
          <div className="space-y-4">
            {displayTasks.map(task => {
              // Let us calculate start and end day within July 2026 (days 1 to 31)
              let startDay = 1;
              let endDay = 15;
              try {
                if (task.startDate) {
                  const day = new Date(task.startDate).getDate();
                  if (!isNaN(day)) startDay = day;
                }
                if (task.dueDate) {
                  const day = new Date(task.dueDate).getDate();
                  if (!isNaN(day)) endDay = day;
                }
              } catch {}

              // Constrain startDay/endDay to 1 - 31 range
              startDay = Math.max(1, Math.min(31, startDay));
              endDay = Math.max(startDay, Math.min(31, endDay));

              const span = endDay - startDay + 1;
              const leftOffsetPercent = ((startDay - 1) / 31) * 100;
              const widthPercent = (span / 31) * 100;

              // Color based on status
              const barColor = 
                task.status === 'Done' ? 'from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.2)]' :
                task.status === 'In Review' ? 'from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.2)]' :
                task.status === 'In Progress' ? 'from-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.2)]' :
                'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600';

              return (
                <div 
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="flex items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition-colors cursor-pointer group"
                >
                  {/* Left metadata */}
                  <div className="w-1/3 shrink-0 pr-4">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[8px] font-black uppercase tracking-wider border rounded-md px-1.5 py-0.2", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        {startDay} - {endDay} Jul
                      </span>
                    </div>
                  </div>

                  {/* Right Gantt Bar Track */}
                  <div className="flex-1 h-9 bg-slate-50/55 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden pl-4">
                    {/* Absolute timeline grid marks */}
                    <div className="absolute inset-y-0 left-1/4 border-l border-dashed border-slate-100 dark:border-slate-800" />
                    <div className="absolute inset-y-0 left-2/4 border-l border-dashed border-slate-100 dark:border-slate-800" />
                    <div className="absolute inset-y-0 left-3/4 border-l border-dashed border-slate-100 dark:border-slate-800" />

                    {/* Gantt Bar */}
                    <div
                      className={cn("absolute top-2 h-5 rounded-lg bg-gradient-to-r flex items-center justify-between px-2 text-[8px] font-bold text-white transition-all", barColor)}
                      style={{
                        left: `${leftOffsetPercent}%`,
                        width: `${widthPercent}%`,
                        minWidth: '24px'
                      }}
                    >
                      <span className="truncate hidden sm:inline">{task.title}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
