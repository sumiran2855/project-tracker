import { cn } from '@/lib/utils';
import type { TeamCapacityListProps } from '@/types/reports.types';

export function TeamCapacityList({ teamStatsList }: TeamCapacityListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Team Allocation Capacity</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Tasks workload status per team member</p>
      </div>

      <div className="space-y-4 flex-1 mt-6">
        {teamStatsList.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500">No member allocations tracked.</div>
        ) : (
          teamStatsList.map((member, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-3xs", member.bg)}>
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-800 dark:text-slate-100 truncate">{member.name}</span>
                  <span className="text-slate-400 dark:text-slate-500">{member.taskCount} tasks ({member.load}%)</span>
                </div>
                {/* Capacity progress */}
                <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      member.taskCount > 6 ? 'bg-red-500' :
                      member.taskCount > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${member.load}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
