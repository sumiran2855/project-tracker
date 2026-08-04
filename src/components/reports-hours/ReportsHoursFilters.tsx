import React from 'react';
import { Calendar, ChevronDown, Search, X, PieChart, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportsHoursFiltersProps {
  presetFilter: string;
  setPresetFilter: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  searchText: string;
  setSearchText: (val: string) => void;
  activeTab: 'analytics' | 'ledger';
  setActiveTab: (val: 'analytics' | 'ledger') => void;
}

export function ReportsHoursFilters({
  presetFilter,
  setPresetFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  searchText,
  setSearchText,
  activeTab,
  setActiveTab,
}: ReportsHoursFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
          <Calendar className="h-4 w-4 text-indigo-500" />
          Reporting Span:
        </span>

        <div className="relative">
          <select
            value={presetFilter}
            onChange={(e) => setPresetFilter(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-9.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-3xs hover:bg-slate-100/50 transition-colors"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="prev_week">Previous Week</option>
            <option value="this_month">This Month</option>
            <option value="prev_month">Previous Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-slate-450 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {presetFilter === 'custom' && (
          <div className="flex items-center gap-2 animate-fadeIn mt-1 sm:mt-0">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-750 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-3xs"
            />
            <span className="text-slate-400 font-bold text-xs">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-755 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-3xs"
            />
          </div>
        )}
      </div>

      {/* Right side Search bar & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        
        {/* Search input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50 placeholder-slate-400 transition-all shadow-3xs text-slate-750"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-750"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tab switch buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === 'analytics'
                ? "bg-white text-slate-800 shadow-3xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <PieChart className="h-3.5 w-3.5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === 'ledger'
                ? "bg-white text-slate-800 shadow-3xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Log Ledger
          </button>
        </div>

      </div>
    </div>
  );
}
