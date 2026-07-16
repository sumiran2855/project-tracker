'use client';

import { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Bell, User, Settings, LogOut, Command, Inbox, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logoutAction } from '@/actions/auth';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { fetchLiveNotifications } from '@/lib/sprintLoader';

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Navbar({ userName, userEmail }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadLiveNotifications = async () => {
    try {
      const data = await fetchLiveNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load live notifications in navbar", e);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pwt_read_notifications');
      let readIds: string[] = stored ? JSON.parse(stored) : [];
      notifications.forEach(n => {
        if (!readIds.includes(n.id)) {
          readIds.push(n.id);
        }
      });
      localStorage.setItem('pwt_read_notifications', JSON.stringify(readIds));
      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (id: string) => {
    try {
      const stored = localStorage.getItem('pwt_read_notifications');
      let readIds: string[] = stored ? JSON.parse(stored) : [];
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem('pwt_read_notifications', JSON.stringify(readIds));
      }
      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  const initials = userName
    ? userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'U';

  const pathSegments = pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const pageTitle = lastSegment
    ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    : 'Dashboard';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-50/80 backdrop-blur-md px-3 py-3 sm:px-5">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3">

        {/* Segment 1: menu trigger (Mobile only) */}
        <div className="flex md:hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-xs">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 bg-slate-50 border-r border-slate-200"
              showCloseButton={false}
            >
              <Sidebar
                user={{ name: userName, email: userEmail }}
                onClose={() => setOpen(false)}
                className="border-none"
              />
            </SheetContent>
          </Sheet>

          {/* Small P Logo on Mobile */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-650 shadow-md">
            <span className="text-[9px] font-black text-white">P</span>
          </div>
        </div>

        {/* Segment 2: search pill, grows to fill center */}
        <div className="hidden md:flex flex-1 max-w-md relative items-center group">
          <Search className="absolute left-4 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
          />
          <kbd className="absolute right-3 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-full bg-slate-100 border border-slate-200 px-2 font-mono text-[9px] font-semibold text-slate-400">
            <Command className="h-2.5 w-2.5" /><span>K</span>
          </kbd>
        </div>

        {/* Segment 3: status + actions pill, pushed right */}
        <div className="ml-auto flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-xs">

          <span className="hidden lg:flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50/50 border border-emerald-100/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Live
          </span>

          <div className="hidden lg:block h-5 w-px bg-slate-100 mx-0.5" />



          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 mt-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg z-50"
            >
              <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100 mb-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-indigo-650 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Inbox className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold">All caught up!</p>
                  </div>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer focus:bg-slate-50",
                        !notif.read ? "bg-indigo-50/20" : ""
                      )}
                    >
                      <div className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                        notif.type === 'issue' ? "bg-rose-50 text-rose-600" :
                        notif.type === 'task' ? "bg-indigo-50 text-indigo-650" :
                        notif.type === 'project' ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                      )}>
                        {notif.type === 'issue' ? '!' : notif.type === 'task' ? '✓' : notif.type === 'project' ? 'P' : 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[11px] font-black text-slate-800 truncate">{notif.title}</p>
                          <span className="text-[9px] text-slate-450 font-semibold shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 leading-relaxed mt-0.5">{notif.description}</p>
                      </div>
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 self-center" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </div>

              <DropdownMenuSeparator className="-mx-1.5 my-1 h-px bg-slate-100" />
              <DropdownMenuItem
                onClick={() => router.push('/notifications')}
                className="w-full text-center justify-center py-2 text-[10px] font-extrabold text-indigo-650 hover:bg-slate-50 cursor-pointer rounded-xl"
              >
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-px bg-slate-100 mx-0.5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-650 text-[10px] font-bold text-white hover:brightness-110 transition-all cursor-pointer focus:outline-none ring-1 ring-slate-100">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mt-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-lg"
            >
              <div className="px-3 py-2.5">
                <p className="text-xs font-bold text-slate-800 leading-tight">{userName ?? 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">{userEmail ?? ''}</p>
              </div>
              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-slate-100" />

              <DropdownMenuItem
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-950 cursor-pointer"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-950 cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-slate-100" />

              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-red-650" />
                ) : (
                  <LogOut className="h-4 w-4 text-red-500" />
                )}
                <span>{isPending ? 'Signing out…' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}