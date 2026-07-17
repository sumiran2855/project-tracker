'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  Trash2, 
  Inbox, 
  Sparkles, 
  Clock, 
  ArrowLeft,
  Search,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchLiveNotifications, NotificationItem } from '@/lib/sprintLoader';
import { useUser } from '@/contexts/UserContext';
import { updateNotificationStateAction } from '@/actions/auth';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, setUser } = useUser();

  // Initial Load
  const loadLiveNotifications = async () => {
    try {
      const data = await fetchLiveNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load live notifications", e);
    }
  };

  useEffect(() => {
    loadLiveNotifications();

    const handleUpdate = () => {
      loadLiveNotifications();
    };
    window.addEventListener('pwt_notifications_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('pwt_notifications_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Sync user's notifications state from database to localStorage on user load/update
  useEffect(() => {
    if (user) {
      let changed = false;
      if (user.readNotifications) {
        localStorage.setItem('pwt_read_notifications', JSON.stringify(user.readNotifications));
        changed = true;
      }
      if (user.deletedNotifications) {
        localStorage.setItem('pwt_deleted_notifications', JSON.stringify(user.deletedNotifications));
        changed = true;
      }
      if (changed) {
        loadLiveNotifications();
      }
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const stored = localStorage.getItem('pwt_read_notifications');
      let readIds: string[] = stored ? JSON.parse(stored) : [];
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem('pwt_read_notifications', JSON.stringify(readIds));
      }

      // Update database
      const deletedStored = localStorage.getItem('pwt_deleted_notifications');
      const deletedIds: string[] = deletedStored ? JSON.parse(deletedStored) : [];
      const res = await updateNotificationStateAction(readIds, deletedIds);
      if (res.success && res.data) {
        setUser(res.data);
      }

      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pwt_deleted_notifications');
      let deletedIds: string[] = stored ? JSON.parse(stored) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('pwt_deleted_notifications', JSON.stringify(deletedIds));
      }

      // Update database
      const readStored = localStorage.getItem('pwt_read_notifications');
      const readIds: string[] = readStored ? JSON.parse(readStored) : [];
      const res = await updateNotificationStateAction(readIds, deletedIds);
      if (res.success && res.data) {
        setUser(res.data);
      }

      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const stored = localStorage.getItem('pwt_read_notifications');
      let readIds: string[] = stored ? JSON.parse(stored) : [];
      notifications.forEach(n => {
        if (!readIds.includes(n.id)) {
          readIds.push(n.id);
        }
      });
      localStorage.setItem('pwt_read_notifications', JSON.stringify(readIds));

      // Update database
      const deletedStored = localStorage.getItem('pwt_deleted_notifications');
      const deletedIds: string[] = deletedStored ? JSON.parse(deletedStored) : [];
      const res = await updateNotificationStateAction(readIds, deletedIds);
      if (res.success && res.data) {
        setUser(res.data);
      }

      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      try {
        const stored = localStorage.getItem('pwt_deleted_notifications');
        let deletedIds: string[] = stored ? JSON.parse(stored) : [];
        notifications.forEach(n => {
          if (!deletedIds.includes(n.id)) {
            deletedIds.push(n.id);
          }
        });
        localStorage.setItem('pwt_deleted_notifications', JSON.stringify(deletedIds));

        // Update database
        const readStored = localStorage.getItem('pwt_read_notifications');
        const readIds: string[] = readStored ? JSON.parse(readStored) : [];
        const res = await updateNotificationStateAction(readIds, deletedIds);
        if (res.success && res.data) {
          setUser(res.data);
        }

        window.dispatchEvent(new Event('pwt_notifications_update'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(item => {
    const matchesTab = 
      filterTab === 'all' ? true :
      filterTab === 'unread' ? !item.read :
      item.read;

    const matchesType = typeFilter === 'All' || item.type === typeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Back to workspace / breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to workspace</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
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
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-650 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
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
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-3xs">
        
        {/* Left Side: Tabs */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 w-full md:w-auto">
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

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 py-16 px-4 text-center shadow-3xs">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Inbox className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">No notifications found</h3>
            <p className="text-xs text-slate-450 font-semibold mt-1 max-w-sm mx-auto">
              There are no alerts matching your current filter settings. Any workspace developments will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={cn(
                "bg-white border rounded-2xl p-4 shadow-3xs cursor-pointer transition-all hover:shadow-xs group flex items-start gap-4 border-slate-200 relative overflow-hidden",
                !item.read ? "border-l-4 border-l-indigo-500 bg-indigo-50/10" : ""
              )}
            >
              {/* Type Icon indicator */}
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                item.type === 'issue' ? "bg-rose-50 text-rose-600" :
                item.type === 'task' ? "bg-indigo-50 text-indigo-650" :
                item.type === 'project' ? "bg-amber-50 text-amber-600" :
                "bg-emerald-50 text-emerald-600"
              )}>
                {item.type === 'issue' ? '!' : item.type === 'task' ? '✓' : item.type === 'project' ? 'P' : 'S'}
              </div>

              {/* Main Content details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug truncate">
                    {item.title}
                  </h4>
                  {!item.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-400 mt-2">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{item.time}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 mx-0.5" />
                  <span className="uppercase text-slate-450">{item.type} alert</span>
                </div>
              </div>

              {/* Trash option */}
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="h-8 w-8 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer transition-all opacity-0 group-hover:opacity-100 shadow-3xs"
                title="Delete notification"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
