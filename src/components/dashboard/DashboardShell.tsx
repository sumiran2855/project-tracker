'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  user: {
    name?: string | null;
    email?: string | null;
  } | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex min-h-screen w-full bg-slate-50">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          user={user}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden md:flex md:flex-col transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-20' : 'w-64'
          )}
        />

        {/* Content Wrapper */}
        <div
          className={cn(
            'flex flex-1 flex-col transition-all duration-300 ease-in-out',
            isCollapsed ? 'md:pl-20' : 'md:pl-64'
          )}
        >
          {/* Top Header Navbar */}
          <Navbar userName={user?.name} userEmail={user?.email} />

          {/* Page body */}
          <main className="flex-1 bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
