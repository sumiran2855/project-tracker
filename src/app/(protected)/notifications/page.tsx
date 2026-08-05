'use client';

import { 
   Bell, 
   Check, 
   Trash2, 
  Inbox, 
  Sparkles, 
  ArrowLeft
} from 'lucide-react';
import { useNotificationsService } from '@/services/useNotificationsService';
import { NotificationFilterRibbon } from '@/components/notifications/NotificationFilterRibbon';
import { NotificationItemCard } from '@/components/notifications/NotificationItemCard';

export default function NotificationsPage() {
  const {
    router,
    notifications,
    filterTab,
    setFilterTab,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    filteredNotifications,
    unreadCount,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllRead,
    handleClearAll
  } = useNotificationsService();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Back to workspace / breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-505 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to workspace</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-655 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Alert Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-650 text-white shadow-md shadow-indigo-500/20">
              <Bell className="h-4.5 w-4.5" />
            </div>
            Notifications Inbox
          </h1>
          <p className="text-slate-450 text-xs font-bold mt-1">
            Stay up to date with tasks, issues, and system changes in your projects.
          </p>
        </div>

        {/* Global actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-655 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
              >
                <Check className="h-3.5 w-3.5 text-indigo-600" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl border border-rose-100 hover:border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Ribbon */}
      <NotificationFilterRibbon
        filterTab={filterTab}
        setFilterTab={setFilterTab}
        unreadCount={unreadCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 py-16 px-4 text-center shadow-3xs">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-404 mb-4">
              <Inbox className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-slate-808 tracking-tight">No notifications found</h3>
            <p className="text-xs text-slate-455 font-semibold mt-1 max-w-sm mx-auto">
              There are no alerts matching your current filter settings. Any workspace developments will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationItemCard
              key={item.id}
              item={item}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
