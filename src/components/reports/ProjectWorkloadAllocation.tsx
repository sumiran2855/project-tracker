import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectWorkloadAllocationProps } from '@/types/reports.types';

export function ProjectWorkloadAllocation({ projectStatsList }: ProjectWorkloadAllocationProps) {
  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-800">Project Workload Allocation</h3>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Completed vs total task loads per project workspace</p>
      </div>

      <div className="flex-1 mt-4">
        {projectStatsList.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400">No project metrics to plot.</div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {projectStatsList.map((proj) => {
              let progressColor = "bg-indigo-650";
              let badgeStyles = "bg-indigo-50 text-indigo-700 border-indigo-100/50";
              let statusLabel = "In Progress";
              
              if (proj.progress === 100) {
                progressColor = "bg-emerald-500";
                badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-100/50";
                statusLabel = "Completed";
              } else if (proj.progress === 0) {
                progressColor = "bg-slate-200";
                badgeStyles = "bg-slate-50 text-slate-500 border-slate-200/50";
                statusLabel = "To Do";
              } else if (proj.progress > 75) {
                progressColor = "bg-purple-600";
                badgeStyles = "bg-purple-50 text-purple-700 border-purple-100/50";
                statusLabel = "In Review";
              }

              return (
                <div 
                  key={proj.id} 
                  className="group flex flex-col md:flex-row md:items-center justify-between py-4 hover:bg-slate-50/60 px-3 -mx-3 rounded-2xl transition-all duration-200 gap-4"
                >
                  {/* Left Side: Name + Details */}
                  <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-455 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100/60 transition-all duration-200">
                      <Folder className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-650 transition-colors duration-200">
                        {proj.name}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                        Active Initiative
                      </span>
                    </div>
                  </div>

                  {/* Middle: Progress Bar */}
                  <div className="flex-1 min-w-0 md:px-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span className="font-extrabold text-slate-800">{proj.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500 ease-out", progressColor)}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Right Side: Tasks Count + Status Badge */}
                  <div className="flex items-center gap-4 shrink-0 md:w-1/4 md:justify-end">
                    <span className="text-xs font-bold text-slate-700">
                      {proj.completedTasks} <span className="text-slate-400 font-semibold">/ {proj.totalTasks} Tasks</span>
                    </span>
                    <span className={cn("rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border", badgeStyles)}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
