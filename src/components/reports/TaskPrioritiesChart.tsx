import React from 'react';
import { cn } from '@/lib/utils';
import { PriorityStats } from '@/services/useReportsService';

interface TaskPrioritiesChartProps {
  tasksCount: number;
  priorityStatsList: PriorityStats[];
}

export function TaskPrioritiesChart({ tasksCount, priorityStatsList }: TaskPrioritiesChartProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-black text-slate-800">Task Priorities</h3>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Breakdown of operational tasks by priority level</p>
      </div>

      <div className="flex flex-col items-center justify-center my-6 relative">
        {/* SVG Donut */}
        <svg width="150" height="150" viewBox="0 0 150 150" className="rotate-270">
          <circle cx="75" cy="75" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
          {(() => {
            let accumulatedPercent = 0;
            return priorityStatsList.map((stat, idx) => {
              const radius = 50;
              const circumference = 2 * Math.PI * radius; // ~314.16
              const strokeDash = (stat.percentage / 100) * circumference;
              const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
              
              accumulatedPercent += stat.percentage;

              return (
                <circle
                  key={idx}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  className={cn("transition-all duration-500", stat.color.split(' ')[0])}
                  strokeWidth="18"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap={stat.percentage > 0 ? "round" : "butt"}
                />
              );
            });
          })()}
        </svg>
        
        {/* Center Label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-lg font-black text-slate-800">{tasksCount}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Tasks</span>
        </div>
      </div>

      {/* Donut Legend */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[10px] font-bold">
        {priorityStatsList.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", stat.color.split(' ')[1])} />
            <span className="text-slate-505">{stat.name}:</span>
            <span className="text-slate-800 font-black ml-auto">{stat.value} ({stat.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
