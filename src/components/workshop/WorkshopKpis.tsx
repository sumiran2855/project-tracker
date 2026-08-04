import React from 'react';
import { cn } from '@/lib/utils';

interface WorkshopKpisProps {
  totalProjects: number;
  inProgressCount: number;
  inReviewCount: number;
  planningCount: number;
  completedCount: number;
}

export function WorkshopKpis({
  totalProjects,
  inProgressCount,
  inReviewCount,
  planningCount,
  completedCount
}: WorkshopKpisProps) {
  const stats = [
    { label: 'Total Projects', value: totalProjects, color: 'from-slate-500 to-slate-655' },
    { label: 'In Progress', value: inProgressCount, color: 'from-indigo-500 to-indigo-650' },
    { label: 'In Review', value: inReviewCount, color: 'from-amber-500 to-amber-600' },
    { label: 'Planning', value: planningCount, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: completedCount, color: 'from-emerald-500 to-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white border border-slate-200/90 p-4.5 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow flex flex-col justify-between relative overflow-hidden group">
          <span className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", stat.color)} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
