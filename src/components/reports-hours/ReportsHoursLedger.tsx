import { BarChart3, Filter, ChevronDown, RefreshCw, Folder, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportsHoursLedgerProps } from '@/types/reports.types';

export function ReportsHoursLedger({
  loading,
  sortBy,
  setSortBy,
  paginatedLogs,
  filteredLogs,
  currentPage,
  setCurrentPage,
  totalPages,
}: ReportsHoursLedgerProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-550" />
            Time-Tracking Log Ledger
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Filter, search, and sort entries</p>
        </div>

        {/* Table sorting */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            Sort Order:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-3xs hover:bg-slate-100/50 transition-all"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="hours_desc">Highest Hours</option>
              <option value="hours_asc">Lowest Hours</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-white shadow-3xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black uppercase tracking-wider text-slate-450">
              <th className="px-5 py-3.5">Logged Date</th>
              <th className="px-5 py-3.5">Employee Name</th>
              <th className="px-5 py-3.5">Project Path</th>
              <th className="px-5 py-3.5">Sprints Task/Issue</th>
              <th className="px-5 py-3.5 text-right">Time Logged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center text-slate-450 italic">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                    <span className="font-bold">Retrieving complete time logs...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => {
                const dateObj = new Date(log.date);
                const dateString = isNaN(dateObj.getTime())
                  ? 'Unknown'
                  : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeString = isNaN(dateObj.getTime())
                  ? ''
                  : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                const isIssue = log.itemType === 'issue';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Date string */}
                    <td className="px-5 py-4 font-semibold text-slate-750">
                      <div>{dateString}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{timeString}</div>
                    </td>

                    {/* Employee User */}
                    <td className="px-5 py-4 font-bold text-slate-805">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6.5 w-6.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-550 shrink-0 uppercase shadow-3xs">
                          {log.userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="truncate max-w-[150px]">{log.userName}</span>
                      </div>
                    </td>

                    {/* Project Name */}
                    <td className="px-5 py-4 font-semibold text-slate-650">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Folder className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]" title={log.projectName}>{log.projectName}</span>
                      </div>
                    </td>

                    {/* Task / Issue title */}
                    <td className="px-5 py-4 text-slate-755">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider shrink-0 border",
                          isIssue
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-indigo-50 text-indigo-650 border-indigo-100'
                        )}>
                          {log.itemType}
                        </span>
                        <span className="font-bold truncate max-w-[240px]" title={log.itemName}>
                          {log.itemName}
                        </span>
                      </div>
                    </td>

                    {/* Hours count */}
                    <td className="px-5 py-4 text-right font-black text-slate-850 text-sm">
                      {log.hours}h
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center text-slate-405 italic">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-7 w-7 text-slate-300" />
                    <span className="font-semibold">No work logs matching current search filters</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Displaying {paginatedLogs.length} of {filteredLogs.length} logs (Page {currentPage} of {totalPages})
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-3xs"
          >
            <ChevronLeft className="h-4 w-4 text-slate-650" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-3xs"
          >
            <ChevronRight className="h-4 w-4 text-slate-655" />
          </button>
        </div>
      </div>
    </div>
  );
}
