import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationFilterRibbonProps } from '@/types/notifications.types';

export function NotificationFilterRibbon({
  filterTab,
  setFilterTab,
  unreadCount,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
}: NotificationFilterRibbonProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-3xs animate-fadeDown">
      
      {/* Left Side: Tabs */}
      <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-800 w-full md:w-auto">
        <button
          onClick={() => setFilterTab('all')}
          className={cn(
            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 md:flex-none text-center px-4",
            filterTab === 'all' ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab('unread')}
          className={cn(
            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 md:flex-none text-center px-4 flex items-center justify-center gap-1.5",
            filterTab === 'unread' ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full px-1.5 py-0.5 text-[9px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilterTab('read')}
          className={cn(
            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 md:flex-none text-center px-4",
            filterTab === 'read' ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          Read
        </button>
      </div>

      {/* Right Side: Type Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        {/* Search box */}
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 pl-9 pr-4 text-xs font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-550 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Type Select */}
        <div className="relative w-full sm:w-36">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900">All Types</option>
            <option value="Task" className="dark:bg-slate-900">Tasks</option>
            <option value="Issue" className="dark:bg-slate-900">Issues</option>
            <option value="Project" className="dark:bg-slate-900">Projects</option>
            <option value="System" className="dark:bg-slate-900">System</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
