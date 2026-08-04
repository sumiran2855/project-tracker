import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberAnalytic {
  id: string;
  name: string;
  email?: string;
  role?: string;
  initials: string;
  bg?: string;
  assignedCount: number;
  completedCount: number;
  pct: number;
}

interface SprintWorkloadProps {
  memberAnalytics: MemberAnalytic[];
  setSelectedEmployee: (employee: any) => void;
}

export function SprintWorkload({
  memberAnalytics,
  setSelectedEmployee,
}: SprintWorkloadProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-3xs space-y-4">
      <div>
        <h2 className="text-base font-black text-slate-880 tracking-tight flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-indigo-605" />
          Sprint Workload Distribution
        </h2>
        <p className="text-[11px] text-slate-455 font-semibold mt-0.5">Tasks & Issues assigned and resolved per team member</p>
      </div>

      {memberAnalytics.length === 0 ? (
        <div className="py-6 text-center text-slate-400 font-semibold text-xs">
          No workload metrics currently logged.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberAnalytics.map((m, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedEmployee(m)}
              className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-xs text-white font-extrabold shadow-3xs group-hover:scale-105 transition-transform", m.bg || "bg-indigo-600")}>
                  {m.initials}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-805 tracking-tight group-hover:text-indigo-650 transition-colors">{m.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.role || 'Employee'}</p>
                </div>
              </div>

              <div className="mt-4.5 space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-455">Completion</span>
                  <span className="text-slate-805">{m.pct}% ({m.completedCount}/{m.assignedCount})</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-300", m.pct === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
