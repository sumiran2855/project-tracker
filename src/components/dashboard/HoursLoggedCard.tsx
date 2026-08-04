'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRADIENT_PALETTE = [
  {
    bg: 'bg-gradient-to-t from-indigo-600 via-indigo-550 to-cyan-400',
    barBg: 'bg-gradient-to-r from-indigo-600 to-cyan-400',
    dotBg: 'bg-indigo-600',
    text: 'text-indigo-650',
    accent: '#4F46E5',
  },
  {
    bg: 'bg-gradient-to-t from-violet-600 via-violet-550 to-pink-400',
    barBg: 'bg-gradient-to-r from-violet-600 to-pink-500',
    dotBg: 'bg-violet-600',
    text: 'text-violet-650',
    accent: '#7C3AED',
  },
  {
    bg: 'bg-gradient-to-t from-emerald-600 via-emerald-550 to-teal-400',
    barBg: 'bg-gradient-to-r from-emerald-600 to-teal-400',
    dotBg: 'bg-emerald-600',
    text: 'text-emerald-650',
    accent: '#10B981',
  },
  {
    bg: 'bg-gradient-to-t from-orange-600 via-orange-550 to-amber-400',
    barBg: 'bg-gradient-to-r from-orange-600 to-amber-400',
    dotBg: 'bg-orange-600',
    text: 'text-orange-650',
    accent: '#F97316',
  },
  {
    bg: 'bg-gradient-to-t from-rose-600 via-rose-550 to-pink-400',
    barBg: 'bg-gradient-to-r from-rose-600 to-pink-400',
    dotBg: 'bg-rose-600',
    text: 'text-rose-650',
    accent: '#F43F5E',
  },
  {
    bg: 'bg-gradient-to-t from-cyan-600 via-cyan-550 to-sky-400',
    barBg: 'bg-gradient-to-r from-cyan-600 to-sky-400',
    dotBg: 'bg-cyan-600',
    text: 'text-cyan-650',
    accent: '#06B6D4',
  },
  {
    bg: 'bg-gradient-to-t from-amber-600 via-amber-550 to-yellow-400',
    barBg: 'bg-gradient-to-r from-amber-600 to-yellow-400',
    dotBg: 'bg-amber-600',
    text: 'text-amber-650',
    accent: '#D97706',
  },
];

function getElementColor(name: string, allNames: string[]) {
  const idx = allNames.indexOf(name);
  return GRADIENT_PALETTE[(idx >= 0 ? idx : 0) % GRADIENT_PALETTE.length];
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
  weeklyHoursList = [],
  weeklyCapacity,
  dailyCapacity,
  isEmployeeRole,
  canViewWorkload,
  maxHours,
  uniqueLoggedProjects = [],
  uniqueLoggedEmployees = [],
}: HoursLoggedCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  const totalWeeklyHours = weeklyHoursList.reduce((acc, d) => acc + (d.hours || 0), 0);
  const overallPercent = Math.min(100, Math.round((totalWeeklyHours / (weeklyCapacity || 1)) * 100));

  // Compute breakdown stats for the right sidebar
  const itemsBreakdown = (() => {
    const summaryMap: Record<string, number> = {};
    weeklyHoursList.forEach(d => {
      if (isEmployeeRole) {
        (d.projects || []).forEach((p: any) => {
          summaryMap[p.projectName] = (summaryMap[p.projectName] || 0) + p.hours;
        });
      } else {
        (d.employees || []).forEach((e: any) => {
          summaryMap[e.employeeName] = (summaryMap[e.employeeName] || 0) + e.hours;
        });
      }
    });

    return Object.entries(summaryMap)
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
      .sort((a, b) => b.hours - a.hours);
  })();

  return (
    <div className={cn(
      "rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md",
      canViewWorkload ? "lg:col-span-2" : "lg:col-span-3"
    )}>
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Hours Logged This Week
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            {isEmployeeRole ? (
              <span className="flex items-center gap-1">
                <span className="font-extrabold text-slate-700">{totalWeeklyHours}h</span>
                <span>/ {weeklyCapacity}h capacity</span>
                <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-bold text-indigo-650 ml-1">
                  {overallPercent}%
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-505">
                <span className="font-extrabold text-slate-750">{totalWeeklyHours}h</span>
                <span>logged across team</span>
              </span>
            )}
          </p>
        </div>
        
        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer transition-all border border-transparent hover:border-slate-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl border border-slate-150 bg-white p-1 shadow-lg z-30 animate-scaleUp">
                <button
                  onClick={() => {
                    router.push('/reports/hours');
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-indigo-550 shrink-0" />
                  View Hours Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Split Layout: Chart on Left, Breakdown Sidebar on Right */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1 items-stretch">
        
        {/* Left Column: Vertical Bar Chart */}
        <div className="flex-1 flex flex-col justify-end min-w-0 relative">
          
          {/* Tooltip on Hover - Rendered outside overflow-x-auto container to avoid vertical clipping */}
          {hoveredIndex !== null && weeklyHoursList[hoveredIndex] && (
            <div 
              className="absolute bottom-[100%] bg-slate-950/95 backdrop-blur-xs text-white text-[10px] py-2.5 px-3.5 rounded-2xl shadow-2xl z-30 min-w-[155px] border border-slate-800 transition-all duration-200 -translate-y-2 pointer-events-none"
              style={{ 
                left: `calc(${((hoveredIndex + 0.5) / 7) * 100}% - 77.5px)`,
              }}
            >
              {(() => {
                const d = weeklyHoursList[hoveredIndex];
                return (
                  <>
                    <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between gap-3">
                      <span>{d.fullDayLabel || d.day}</span>
                      <span className="text-indigo-400 font-extrabold">
                        {isEmployeeRole ? `${d.hours}h / ${dailyCapacity}h` : `${d.hours}h`}
                      </span>
                    </div>
                    {isEmployeeRole ? (
                      (d.projects || []).length > 0 ? (
                        d.projects.map((p: any) => {
                          const color = getElementColor(p.projectName, uniqueLoggedProjects);
                          return (
                            <div key={p.projectName} className="flex items-center justify-between gap-3 font-semibold text-[10px] mt-1">
                              <span className="flex items-center gap-1.5 text-slate-400 max-w-[100px] truncate">
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", color.dotBg)} />
                                <span className="truncate">{p.projectName}</span>
                              </span>
                              <span className="font-bold text-white ml-auto">{p.hours}h</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-505 italic text-[9px]">No hours logged</div>
                      )
                    ) : (
                      (d.employees || []).length > 0 ? (
                        d.employees.map((e: any) => {
                          const color = getElementColor(e.employeeName, uniqueLoggedEmployees);
                          return (
                            <div key={e.employeeName} className="flex items-center justify-between gap-3 font-semibold text-[10px] mt-1">
                              <span className="flex items-center gap-1.5 text-slate-400 max-w-[100px] truncate">
                                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", color.dotBg)} />
                                <span className="truncate">{e.employeeName}</span>
                              </span>
                              <span className="font-bold text-white ml-auto">{e.hours}h</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-505 italic text-[9px]">No hours logged</div>
                      )
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <div className="overflow-x-auto scrollbar-none pb-2">
            <div className="flex items-end justify-between gap-3 sm:gap-4 h-48 min-w-[460px] md:min-w-0 pb-2 border-b border-slate-100">
              {weeklyHoursList.map((d, idx) => (
                <div 
                  key={d.day} 
                  className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating badge for logged hours */}
                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full shadow-3xs whitespace-nowrap transition-transform duration-200 group-hover:scale-105">
                    {d.hours}h
                  </span>

                  {/* Constrain percentage calculations with a definite height container */}
                  <div className="h-32 w-full flex flex-col justify-end items-center">
                    {/* Stacked Visual Bar Capsule with Dynamic Height */}
                    {d.hours > 0 ? (
                      <div 
                        className="w-full max-w-[32px] sm:max-w-[36px] flex flex-col-reverse justify-start rounded-t-xl rounded-b-sm overflow-hidden cursor-pointer hover:shadow-md hover:brightness-105 transition-all duration-300 relative border border-white/10"
                        style={{ height: `${maxHours > 0 ? (d.hours / maxHours) * 100 : 0}%` }}
                      >
                        {isEmployeeRole ? (
                          (d.projects || []).map((p: any) => {
                            const color = getElementColor(p.projectName, uniqueLoggedProjects);
                            const segmentPercent = d.hours > 0 ? (p.hours / d.hours) * 100 : 0;
                            return (
                              <div
                                key={p.projectName}
                                className={cn("w-full transition-all duration-500 rounded-xs border-t border-white/20 first:border-0 shadow-inner", color.bg)}
                                style={{ height: `${segmentPercent}%` }}
                              />
                            );
                          })
                        ) : (
                          (d.employees || []).map((e: any) => {
                            const color = getElementColor(e.employeeName, uniqueLoggedEmployees);
                            const segmentPercent = d.hours > 0 ? (e.hours / d.hours) * 100 : 0;
                            return (
                              <div
                                key={e.employeeName}
                                className={cn("w-full transition-all duration-500 rounded-xs border-t border-white/20 first:border-0 shadow-inner", color.bg)}
                                style={{ height: `${segmentPercent}%` }}
                              />
                            );
                          })
                        )}
                      </div>
                    ) : (
                      /* Subtle placeholder line for 0 hours */
                      <div className="w-full max-w-[32px] sm:max-w-[36px] h-1.5 rounded bg-slate-200/50 border border-slate-300/20 shadow-3xs" />
                    )}
                  </div>

                  {/* X-Axis day text label */}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center mt-1">
                    <span className="inline sm:hidden">{d.day.split(' ')[0]}</span>
                    <span className="hidden sm:inline">{d.day}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown Sidebar & Overall Progress */}
        <div className="w-full md:w-60 lg:w-68 shrink-0 flex flex-col justify-between gap-5 md:border-l md:border-slate-100 md:pl-6 pt-5 md:pt-0 border-t md:border-t-0 border-slate-100">
          
          {/* Progress summary block */}
          <div className="bg-slate-50/70 border border-slate-100/80 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Weekly Status
              </span>
              <span className={cn(
                "text-xs font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-3xs border",
                overallPercent >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" : 
                overallPercent >= 40 ? "bg-indigo-50 text-indigo-700 border-indigo-100/50" : 
                "bg-amber-50 text-amber-700 border-amber-100/50"
              )}>
                {overallPercent}%
              </span>
            </div>
            
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-800 tracking-tight">
                {totalWeeklyHours}h
              </span>
              <span className="text-[10px] font-bold text-slate-455">
                of {weeklyCapacity}h capacity
              </span>
            </div>

            {/* Custom styled overall progress bar */}
            <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  overallPercent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : 
                  overallPercent >= 45 ? "bg-gradient-to-r from-indigo-500 to-cyan-400" : 
                  "bg-gradient-to-r from-amber-500 to-orange-400"
                )}
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Breakdown / Legend Section */}
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
              {isEmployeeRole ? "Project Breakdown" : "Team Breakdown"}
            </h3>

            {itemsBreakdown.length > 0 ? (
              <div className="space-y-3 max-h-[145px] overflow-y-auto pr-1.5 scrollbar-thin">
                {itemsBreakdown.map((item) => {
                  const color = getElementColor(item.name, isEmployeeRole ? uniqueLoggedProjects : uniqueLoggedEmployees);
                  const contributionPercent = totalWeeklyHours > 0 ? Math.round((item.hours / totalWeeklyHours) * 100) : 0;
                  return (
                    <div key={item.name} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-2 truncate max-w-[130px] sm:max-w-none">
                          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 shadow-3xs", color.dotBg)} />
                          <span className="truncate hover:text-slate-900 transition-colors">{item.name}</span>
                        </span>
                        <span className="text-slate-500 font-extrabold shrink-0 pl-2">
                          {item.hours}h <span className="text-[9px] font-semibold text-slate-400">({contributionPercent}%)</span>
                        </span>
                      </div>
                      
                      {/* Contribution progress bar indicator */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", color.barBg)}
                          style={{ width: `${contributionPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-400 italic text-[11px] py-4 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                No logs recorded yet this week
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

