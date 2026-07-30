'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLOR_PALETTE = [
  { bg: 'bg-indigo-500', text: 'text-indigo-500', bar: 'bg-indigo-500' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500', bar: 'bg-emerald-500' },
  { bg: 'bg-violet-500', text: 'text-violet-500', bar: 'bg-violet-500' },
  { bg: 'bg-amber-500', text: 'text-amber-500', bar: 'bg-amber-500' },
  { bg: 'bg-rose-500', text: 'text-rose-500', bar: 'bg-rose-500' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', bar: 'bg-cyan-500' },
  { bg: 'bg-purple-500', text: 'text-purple-500', bar: 'bg-purple-500' },
];

function getElementColor(name: string, allNames: string[]) {
  const idx = allNames.indexOf(name);
  return COLOR_PALETTE[(idx >= 0 ? idx : 0) % COLOR_PALETTE.length];
}

interface HoursLoggedCardProps {
  weeklyHoursList: any[];
  weeklyCapacity: number;
  dailyCapacity: number;
  isEmployeeRole: boolean;
  canViewWorkload: boolean;
  maxHours: number;
  uniqueLoggedProjects: string[];
  uniqueLoggedEmployees: string[];
}

export function HoursLoggedCard({
  weeklyHoursList,
  weeklyCapacity,
  dailyCapacity,
  isEmployeeRole,
  canViewWorkload,
  maxHours,
  uniqueLoggedProjects,
  uniqueLoggedEmployees,
}: HoursLoggedCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between", canViewWorkload ? "lg:col-span-2" : "lg:col-span-3")}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Hours Logged This Week</h2>
          <p className="text-xs text-slate-455 mt-0.5 font-medium">
            {isEmployeeRole ? (
              <>{weeklyHoursList.reduce((acc, d) => acc + d.hours, 0)}h / {weeklyCapacity}h weekly capacity ({Math.round((weeklyHoursList.reduce((acc, d) => acc + d.hours, 0) / (weeklyCapacity || 1)) * 100)}%)</>
            ) : (
              <>{weeklyHoursList.reduce((acc, d) => acc + d.hours, 0)}h total logged across team this week</>
            )}
          </p>
        </div>
        
        {/* Dropdown container */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-450 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {isMenuOpen && (
            <>
              {/* Overlay to close menu on click away */}
              <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-150 bg-white p-1 shadow-lg z-30 animate-scaleUp">
                <button
                  onClick={() => {
                    router.push('/reports/hours');
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-755 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-indigo-550" />
                  View Hours Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Weekly Bar Chart View */}
      <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-44 mt-2">
        {weeklyHoursList.map((d) => (
          <div key={d.day} className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
            
            {/* Tooltip on Hover */}
            <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-xl whitespace-nowrap z-20 min-w-[140px] border border-slate-700">
              <div className="font-black text-slate-200 border-b border-slate-700/80 pb-1 mb-1 flex items-center justify-between gap-3">
                <span>{d.fullDayLabel || d.day}</span>
                <span className="text-indigo-400 font-extrabold">
                  {isEmployeeRole ? `${d.hours}h / ${dailyCapacity}h` : `${d.hours}h`}
                </span>
              </div>
              {isEmployeeRole ? (
                d.projects.length > 0 ? (
                  d.projects.map((p: any) => {
                    const color = getElementColor(p.projectName, uniqueLoggedProjects);
                    return (
                      <div key={p.projectName} className="flex items-center justify-between gap-3 font-semibold text-[10px] mt-1">
                        <span className="flex items-center gap-1.5 text-slate-350">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", color.bg)} />
                          <span>{p.projectName}</span>
                        </span>
                        <span className="font-bold text-white ml-auto">{p.hours}h</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 italic text-[9px]">No hours logged</div>
                )
              ) : (
                d.employees.length > 0 ? (
                  d.employees.map((e: any) => {
                    const color = getElementColor(e.employeeName, uniqueLoggedEmployees);
                    return (
                      <div key={e.employeeName} className="flex items-center justify-between gap-3 font-semibold text-[10px] mt-1">
                        <span className="flex items-center gap-1.5 text-slate-355">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", color.bg)} />
                          <span>{e.employeeName}</span>
                        </span>
                        <span className="font-bold text-white ml-auto">{e.hours}h</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 italic text-[9px]">No hours logged</div>
                )
              )}
            </div>

            {/* Capacity Ratio label */}
            <span className="text-[9px] font-black text-slate-700 whitespace-nowrap text-center">
              {isEmployeeRole ? (
                <>
                  <span className="inline sm:hidden">{d.hours}h</span>
                  <span className="hidden sm:inline">{d.hours}h / {dailyCapacity}h</span>
                </>
              ) : (
                <>{d.hours}h</>
              )}
            </span>

            {/* stacked visual bar */}
            <div className="w-full h-32 flex flex-col-reverse justify-start rounded-xl bg-slate-50 border border-slate-150 overflow-hidden cursor-pointer hover:bg-slate-100/70 transition-colors p-0.5">
              {isEmployeeRole ? (
                d.projects.length > 0 ? (
                  d.projects.map((p: any) => {
                    const color = getElementColor(p.projectName, uniqueLoggedProjects);
                    const segmentPercent = maxHours > 0 ? (p.hours / maxHours) * 100 : 0;
                    return (
                      <div
                        key={p.projectName}
                        className={cn("w-full transition-all duration-500 rounded-xs border-t border-white/20 first:border-0", color.bg)}
                        style={{ height: `${segmentPercent}%` }}
                      />
                    );
                  })
                ) : (
                  <div className="w-full h-full bg-slate-200/40 rounded-lg" />
                )
              ) : (
                d.employees.length > 0 ? (
                  d.employees.map((e: any) => {
                    const color = getElementColor(e.employeeName, uniqueLoggedEmployees);
                    const segmentPercent = maxHours > 0 ? (e.hours / maxHours) * 100 : 0;
                    return (
                      <div
                        key={e.employeeName}
                        className={cn("w-full transition-all duration-500 rounded-xs border-t border-white/20 first:border-0", color.bg)}
                        style={{ height: `${segmentPercent}%` }}
                      />
                    );
                  })
                ) : (
                  <div className="w-full h-full bg-slate-200/40 rounded-lg" />
                )
              )}
            </div>

            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
              <span className="inline sm:hidden">{d.day.split(' ')[0]}</span>
              <span className="hidden sm:inline">{d.day}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Color legend footer */}
      {isEmployeeRole ? (
        uniqueLoggedProjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px]">
            <span className="font-bold text-slate-455 uppercase tracking-wider text-[9px]">Projects:</span>
            {uniqueLoggedProjects.map((pName) => {
              const color = getElementColor(pName, uniqueLoggedProjects);
              return (
                <div key={pName} className="flex items-center gap-1.5 font-bold text-slate-750">
                  <span className={cn("h-2.5 w-2.5 rounded-full", color.bg)} />
                  <span>{pName}</span>
                </div>
              );
            })}
          </div>
        )
      ) : (
        uniqueLoggedEmployees.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px]">
            <span className="font-bold text-slate-455 uppercase tracking-wider text-[9px]">Employees:</span>
            {uniqueLoggedEmployees.map((eName) => {
              const color = getElementColor(eName, uniqueLoggedEmployees);
              return (
                <div key={eName} className="flex items-center gap-1.5 font-bold text-slate-750">
                  <span className={cn("h-2.5 w-2.5 rounded-full", color.bg)} />
                  <span>{eName}</span>
                </div>
              );
            })}
          </div>
        )
      )}

    </div>
  );
}
