import { MoreHorizontal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LoggedHoursBarChartProps } from '@/types/reports.types';
import { getProjColor } from '@/helpers/report.helpers';

export function LoggedHoursBarChart({
  user,
  router,
  weeklyTimeLogs,
  dailyCapacity,
  weeklyCapacity,
  isHoursMenuOpen,
  setIsHoursMenuOpen,
  hoveredHoursIndex,
  setHoveredHoursIndex,
}: LoggedHoursBarChartProps) {
  const isEmployeeRole = (user?.role || '').toLowerCase() === 'employee';
  const totalWeeklyHours = weeklyTimeLogs.reduce((acc, d) => acc + d.hours, 0);

  return (
    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">Logged Hours</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            {isEmployeeRole ? (
              <>Workspace activity log ({totalWeeklyHours}h / {weeklyCapacity}h weekly capacity - {Math.round((totalWeeklyHours / (weeklyCapacity || 1)) * 100)}%)</>
            ) : (
              <>Workspace activity log ({totalWeeklyHours}h total logged across team this week)</>
            )}
          </p>
        </div>

        {/* Three-dot dropdown menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsHoursMenuOpen(!isHoursMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-455 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {isHoursMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsHoursMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-150 bg-white p-1 shadow-lg z-30 animate-scaleUp">
                <button
                  onClick={() => {
                    router.push('/reports/hours');
                    setIsHoursMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-755 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-indigo-555" />
                  View Hours Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tooltip on Hover */}
      {hoveredHoursIndex !== null && weeklyTimeLogs[hoveredHoursIndex] && (
        <div 
          className="absolute bottom-[100%] bg-slate-950/95 backdrop-blur-xs text-white text-[10px] py-2.5 px-3.5 rounded-2xl shadow-2xl z-30 min-w-[155px] border border-slate-800 transition-all duration-200 -translate-y-2 pointer-events-none"
          style={{ 
            left: `calc(${((hoveredHoursIndex + 0.5) / 7) * 100}% - 77.5px)`,
          }}
        >
          {(() => {
            const d = weeklyTimeLogs[hoveredHoursIndex];
            const uniqueLoggedProjects = Array.from(new Set(weeklyTimeLogs.flatMap(item => item.projects.map(p => p.projectName))));
            const uniqueLoggedEmployees = Array.from(new Set(weeklyTimeLogs.flatMap(item => (item.employees || []).map(e => e.employeeName))));
            return (
              <>
                <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between gap-3">
                  <span>{d.fullDayLabel || d.day}</span>
                  <span className="text-indigo-400 font-extrabold">
                    {isEmployeeRole ? `${d.hours}h / ${dailyCapacity}h` : `${d.hours}h`}
                  </span>
                </div>
                {isEmployeeRole ? (
                  d.projects.length > 0 ? (
                    d.projects.map((p) => {
                      const color = getProjColor(p.projectName, uniqueLoggedProjects);
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
                    <div className="text-slate-500 italic text-[9px]">No hours logged</div>
                  )
                ) : (
                  (d.employees || []).length > 0 ? (
                    (d.employees || []).map((e) => {
                      const color = getProjColor(e.employeeName, uniqueLoggedEmployees);
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
                    <div className="text-slate-500 italic text-[9px]">No hours logged</div>
                  )
                )}
              </>
            );
          })()}
        </div>
      )}

      <div className="overflow-x-auto scrollbar-none pb-2">
        <div className="flex items-end justify-between gap-3 sm:gap-4 h-48 min-w-[460px] md:min-w-0 pb-2 border-b border-slate-100">
          {weeklyTimeLogs.map((d, idx) => {
            const maxHours = Math.max(isEmployeeRole ? dailyCapacity : 1, ...weeklyTimeLogs.map(t => t.hours));
            const uniqueLoggedProjects = Array.from(new Set(weeklyTimeLogs.flatMap(item => item.projects.map(p => p.projectName))));
            const uniqueLoggedEmployees = Array.from(new Set(weeklyTimeLogs.flatMap(item => (item.employees || []).map(e => e.employeeName))));

            return (
              <div 
                key={d.day} 
                className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end"
                onMouseEnter={() => setHoveredHoursIndex(idx)}
                onMouseLeave={() => setHoveredHoursIndex(null)}
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
                        d.projects.map((p) => {
                          const color = getProjColor(p.projectName, uniqueLoggedProjects);
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
                        (d.employees || []).map((e) => {
                          const color = getProjColor(e.employeeName, uniqueLoggedEmployees);
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
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Legend */}
      {(() => {
        if (isEmployeeRole) {
          const uniqueLoggedProjects = Array.from(new Set(weeklyTimeLogs.flatMap(item => item.projects.map(p => p.projectName))));
          if (uniqueLoggedProjects.length === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Projects:</span>
              {uniqueLoggedProjects.map((pName) => {
                const color = getProjColor(pName, uniqueLoggedProjects);
                return (
                  <div key={pName} className="flex items-center gap-1.5 font-bold text-slate-705">
                    <span className={cn("h-2.5 w-2.5 rounded-full", color.dotBg)} />
                    <span>{pName}</span>
                  </div>
                );
              })}
            </div>
          );
        } else {
          const uniqueLoggedEmployees = Array.from(new Set(weeklyTimeLogs.flatMap(item => (item.employees || []).map(e => e.employeeName))));
          if (uniqueLoggedEmployees.length === 0) return null;
          return (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Employees:</span>
              {uniqueLoggedEmployees.map((eName) => {
                const color = getProjColor(eName, uniqueLoggedEmployees);
                return (
                  <div key={eName} className="flex items-center gap-1.5 font-bold text-slate-705">
                    <span className={cn("h-2.5 w-2.5 rounded-full", color.dotBg)} />
                    <span>{eName}</span>
                  </div>
                );
              })}
            </div>
          );
        }
      })()}
    </div>
  );
}
