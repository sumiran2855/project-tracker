import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationFilterRibbonProps {
  filterTab: 'all' | 'unread' | 'read';
  setFilterTab: (tab: 'all' | 'unread' | 'read') => void;
  unreadCount: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
}

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
    <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-3xs animate-fadeDown">
      
      {/* Left Side: Tabs */}
      <div className="bg-slate-105 p-1 rounded-2xl flex items-center border border-slate-200 w-full md:w-auto">
        <button
          onClick={() => setFilterTab('all')}
          className={cn(
            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 md:flex-none text-center px-4",
            filterTab === 'all' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab('unread')}
          className={cn(
            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 md:flex-none text-center px-4 flex items-center justify-center gap-1.5",
            filterTab === 'unread' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="bg-indigo-50 text-indigo-650 rounded-full px-1.5 py-0.5 text-[9px] font-black">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilterTab('read')}
          className={cn(
            "p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 md:flex-none text-center px-4",
            filterTab === 'read' ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Type Select */}
        <div className="relative w-full sm:w-36">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Task">Tasks</option>
            <option value="Issue">Issues</option>
            <option value="Project">Projects</option>
            <option value="System">System</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
