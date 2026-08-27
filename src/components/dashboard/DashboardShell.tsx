'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { DashboardShellProps } from '@/types/dashboard.types';
import { useTheme } from 'next-themes';

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.workspacePrefs?.theme) {
      setTheme(user.workspacePrefs.theme);
    }
  }, [user?.workspacePrefs?.theme, setTheme]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-300">
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
            'flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out',
            isCollapsed ? 'md:pl-20' : 'md:pl-64'
          )}
        >
          {/* Top Header Navbar */}
          <Navbar userName={user?.name} userEmail={user?.email} />

          {/* Page body */}
          <main className="flex-1 bg-background min-w-0 transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
