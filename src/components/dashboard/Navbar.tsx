'use client';

import { useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Bell, Plus, User, Settings, LogOut, Command } from 'lucide-react';
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

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Navbar({ userName, userEmail }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

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

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer"
            aria-label="New task"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
          </button>

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