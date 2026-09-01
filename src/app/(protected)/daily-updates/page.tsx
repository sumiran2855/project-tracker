'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Sparkles,
  Calendar,
  Clock,
  Folder,
  CheckSquare,
  AlertTriangle,
  Columns,
  ListTodo,
  ChevronRight,
  Eye,
  Trash2,
  UserCheck,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddDailyUpdateModal } from '@/components/daily-updates/AddDailyUpdateModal';
import { DailyUpdateDetailModal } from '@/components/daily-updates/DailyUpdateDetailModal';
import { DeleteDailyUpdateModal } from '@/components/daily-updates/DeleteDailyUpdateModal';
import { useDailyUpdatesService } from '@/services/useDailyUpdatesService';

export default function DailyUpdatesPage() {
  const {
    canAddUpdate,
    showMemberFilter,
    projects,
    loading,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    dateFilter,
    setDateFilter,
    userFilter,
    setUserFilter,
    activeTab,
    setActiveTab,
    isAddModalOpen,
    setIsAddModalOpen,
    activeDetailItem,
    setActiveDetailItem,
    itemToDelete,
    setItemToDelete,
    loadData,
    uniqueUsers,
    selectedMemberName,
    filteredUpdates,
    totalCount,
    todayCount,
    todayHours,
    activeMembersToday,
    handleDeleteConfirm,
    canDeleteUpdate,
  } = useDailyUpdatesService();

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Team Workspace Activity</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 mt-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-xs">
                <ClipboardList className="h-4.5 w-4.5" />
              </div>
              Daily Updates
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              Track daily work submissions, completed tasks, and blockers across your team, leads, and clients.
            </p>
          </div>

          {canAddUpdate && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer active:scale-98"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Daily Update</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Updates', value: totalCount, icon: ClipboardList, tint: '#6366f1' },
            { label: "Today's Submissions", value: todayCount, icon: Calendar, tint: '#10b981' },
            { label: "Today's Hours Logged", value: `${todayHours} hrs`, icon: Clock, tint: '#8b5cf6' },
            { label: 'Active Members Today', value: activeMembersToday, icon: UserCheck, tint: '#f59e0b' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
                style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 6px 16px -4px ${s.tint}18, 0 2px 6px -2px ${s.tint}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at top right, ${s.tint}09 0%, transparent 70%)` }}
                />

                <div className="relative">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${s.tint}20, ${s.tint}0d)`,
                      border: `1px solid ${s.tint}28`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.tint }} />
                  </div>
                </div>

                <div className="relative mt-5">
                  <p
                    className="text-[26px] font-black leading-none tracking-tight text-slate-800 dark:text-slate-100"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {s.label}
                  </p>
                  <div
                    className="mt-3 h-0.5 w-8 rounded-full opacity-40 group-hover:w-11 transition-all duration-500"
                    style={{ backgroundColor: s.tint }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
          <div className="relative w-full xl:flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search updates by employee, task, project, or description..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className={cn("grid grid-cols-1 gap-2 w-full xl:w-auto", showMemberFilter ? "sm:grid-cols-3" : "sm:grid-cols-2")}>

            {/* Date Filter */}
            <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
              <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
              >
                <option value="All" className="dark:bg-slate-900">All Time</option>
                <option value="Today" className="dark:bg-slate-900">Today</option>
                <option value="Yesterday" className="dark:bg-slate-900">Yesterday</option>
                <option value="This Week" className="dark:bg-slate-900">This Week</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
              <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project:</span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
              >
                <option value="All" className="dark:bg-slate-900">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
                ))}
              </select>
            </div>

            {/* Member Filter (Only visible to Manager, Team Lead, Client, Admin) */}
            {showMemberFilter && (
              <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
                <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member:</span>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="bg-transparent text-slate-700 dark:text-slate-200 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
                >
                  <option value="All" className="dark:bg-slate-900">All Members</option>
                  {uniqueUsers.map((u) => (
                    <option key={u.id} value={u.id} className="dark:bg-slate-900">{u.name}</option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </div>
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs">
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto border border-slate-100 dark:border-slate-800">
            {[
              { id: 'feed', label: 'Updates Feed', icon: Columns },
              { id: 'table', label: 'Detailed Table', icon: ListTodo },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    active
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 px-3">
            <span>Showing {filteredUpdates.length} updates</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-3" />
              <p className="text-xs font-bold">Loading daily updates...</p>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/40">
                <ClipboardList className="h-7 w-7" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                {userFilter !== 'All' ? `No Updates From ${selectedMemberName}` : 'No Daily Updates Found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                {userFilter !== 'All'
                  ? `No daily update is added by ${selectedMemberName}.`
                  : searchQuery || projectFilter !== 'All' || dateFilter !== 'All'
                  ? 'No updates match your selected filters. Try clearing your filters or search query.'
                  : canAddUpdate
                  ? 'Be the first to submit a daily update on your project progress today!'
                  : 'No daily updates have been submitted by team members yet.'}
              </p>
              {canAddUpdate && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Daily Update</span>
                </button>
              )}
            </div>
          ) : activeTab === 'feed' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUpdates.map((item) => {
                const canDelete = canDeleteUpdate(item);
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200 cursor-pointer"
                    onClick={() => setActiveDetailItem(item)}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-10 w-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm', item.userAvatarBg || 'bg-indigo-600')}>
                            {item.userInitials || item.userName?.slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                              {item.userName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {item.userRole}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                            </div>
                          </div>
                        </div>

                        {item.hoursSpent > 0 && (
                          <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-full shrink-0">
                            <Clock className="h-3 w-3" />
                            <span>{item.hoursSpent}h</span>
                          </div>
                        )}
                      </div>

                      {/* Project & Task Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Folder className="h-3 w-3 text-indigo-500" />
                          <span className="truncate max-w-[140px]">{item.projectName}</span>
                        </span>
                        {item.taskTitle && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <CheckSquare className="h-3 w-3 text-emerald-500" />
                            <span className="truncate max-w-[120px]">{item.taskTitle}</span>
                          </span>
                        )}
                      </div>

                      {/* Summary / Headline */}
                      <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.summary}
                      </h5>

                      {/* Description Preview */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                        {item.description}
                      </p>

                      {/* Blockers Badge */}
                      {item.blockers && (
                        <div className="mt-3 flex items-center gap-1.5 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Blocker: {item.blockers}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Card Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Read full update <ChevronRight className="h-3 w-3" />
                      </span>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item);
                          }}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete update"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-4">Date & Member</th>
                      <th className="py-3.5 px-4">Project & Task</th>
                      <th className="py-3.5 px-4">Work Summary</th>
                      <th className="py-3.5 px-4">Hours</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {filteredUpdates.map((item) => {
                      const canDelete = canDeleteUpdate(item);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setActiveDetailItem(item)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                        >
                          {/* Date & Member */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0', item.userAvatarBg || 'bg-indigo-600')}>
                                {item.userInitials || item.userName?.slice(0, 2).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-slate-100">{item.userName}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{item.userRole} • {item.date}</p>
                              </div>
                            </div>
                          </td>

                          {/* Project & Task */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.projectName}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {item.taskTitle ? `Task: ${item.taskTitle}` : 'General Project Work'}
                            </p>
                          </td>

                          {/* Work Summary */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{item.summary}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.description}</p>
                          </td>

                          {/* Hours */}
                          <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400">
                            {item.hoursSpent} hrs
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActiveDetailItem(item)}
                                className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => setItemToDelete(item)}
                                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete update"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Add Daily Update */}
      <AddDailyUpdateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projects={projects}
        onSuccess={loadData}
      />

      {/* MODAL: View Daily Update Detail */}
      <DailyUpdateDetailModal
        update={activeDetailItem}
        onClose={() => setActiveDetailItem(null)}
        onDeleteRequest={(item) => {
          setItemToDelete(item);
        }}
        canDelete={activeDetailItem ? canDeleteUpdate(activeDetailItem) : false}
      />

      {/* MODAL: Delete Daily Update Confirmation */}
      <DeleteDailyUpdateModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
