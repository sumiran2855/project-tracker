import { Folder, PieChart, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportsHoursAnalyticsProps } from '@/types/reports.types';
import { getWidgetTheme } from '@/helpers/report.helpers';

export function ReportsHoursAnalytics({
  projectBreakdown,
  totalHours,
  uniqueLoggedProjectsReport,
  employeeBreakdown,
  dayBreakdown,
}: ReportsHoursAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Project Allocation Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Folder className="h-4 w-4 text-indigo-500" />
            Project Allocations
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Distribution of time across projects</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4.5 pt-4.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {projectBreakdown.length > 0 ? (
            projectBreakdown.map((proj) => {
              const theme = getWidgetTheme(proj.name, uniqueLoggedProjectsReport);
              const percent = totalHours > 0 ? Math.round((proj.hours / totalHours) * 100) : 0;
              return (
                <div key={proj.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", theme.bar)} />
                      <span className="text-slate-800 dark:text-slate-100 truncate" title={proj.name}>{proj.name}</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 shrink-0 font-extrabold">{proj.hours}h ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", theme.bar, theme.glow)} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 italic text-xs gap-1.5">
              <PieChart className="h-6 w-6 text-slate-300" />
              <span>No project logs recorded</span>
            </div>
          )}
        </div>
      </div>

      {/* Employee Contribution Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-4 w-4 text-emerald-500" />
            Employee Share
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Logged hours by team members</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3.5 pt-4.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {employeeBreakdown.length > 0 ? (
            employeeBreakdown.map((emp) => {
              const theme = getWidgetTheme(emp.name, employeeBreakdown.map(e => e.name));
              const initials = emp.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
              const percent = totalHours > 0 ? Math.round((emp.hours / totalHours) * 100) : 0;
              return (
                <div key={emp.name} className="flex items-center justify-between border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-4 py-2.5 rounded-2xl transition-all shadow-3xs text-xs font-bold">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8.5 w-8.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase shadow-3xs shrink-0">
                      {initials}
                    </div>
                    <span className="text-slate-800 dark:text-slate-100 truncate">{emp.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("font-black block", theme.text)}>{emp.hours}h</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold">{percent}% share</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 italic text-xs gap-1.5">
              <User className="h-6 w-6 text-slate-300" />
              <span>No employee log shares</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Distribution Timeline Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[350px]">
        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-rose-500" />
            Logged Timeline
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Day-by-day logs metrics</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pt-4.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {dayBreakdown.length > 0 ? (
            dayBreakdown.map((day) => (
              <div key={day.dateStr} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-850 px-4 py-3 rounded-2xl transition-all shadow-3xs text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">{day.dateStr}</span>
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 px-3 py-1 rounded-lg text-[10px] font-black">{day.hours} hrs</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 italic text-xs gap-1.5">
              <Calendar className="h-6 w-6 text-slate-300" />
              <span>No timeline entries recorded</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
