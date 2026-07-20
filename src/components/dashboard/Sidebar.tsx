'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn, isItemInSprint } from '@/lib/utils';
import { fetchAllSprintData } from '@/lib/sprintLoader';
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  BarChart3,
  ChevronsUpDown,
  Building,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Map,
  ListTodo,
  Code,
  Rocket,
  Search,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useUser } from '@/contexts/UserContext';
import { hasPermission } from '@/lib/auth/permissions';
import { getProjectsAction } from '@/actions/projects';
import { getAllTasksAction } from '@/actions/tasks';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onClose?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ onClose, className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [tasksCount, setTasksCount] = useState<number | null>(null);

  const navigationGroups = [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: pathname === '/dashboard' },
        { label: 'Projects', href: '/projects', icon: Folder, active: pathname === '/projects', badge: projectsCount !== null ? String(projectsCount) : undefined },
      ],
    },
    {
      title: 'Planning',
      items: [
        { label: 'Roadmap', href: '/roadmap', icon: Map, active: pathname === '/roadmap' },
        { label: 'Board', href: '/tasks', icon: CheckSquare, active: pathname === '/tasks', badge: tasksCount !== null ? String(tasksCount) : undefined },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Issues', href: '/issues', icon: AlertCircle, active: pathname === '/issues' },
        { label: 'Reports', href: '/reports', icon: BarChart3, active: pathname === '/reports', permission: 'report:view' },
        { label: 'Settings', href: '/settings', icon: Settings, active: pathname === '/settings' },
      ],
    },
  ].map(group => ({
    ...group,
    items: group.items.filter((item: any) => !item.permission || hasPermission(user?.role, item.permission))
  })).filter(group => group.items.length > 0);

  const [progress, setProgress] = useState(0);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    async function loadLiveCounts() {
      try {
        const [pRes, tRes] = await Promise.all([
          getProjectsAction(),
          getAllTasksAction()
        ]);
        if (pRes.success && pRes.data) {
          setProjectsCount(pRes.data.length);
        }
        if (tRes.success && tRes.data) {
          setTasksCount(tRes.data.length);
        }
      } catch (err) {
        console.error("Error loading sidebar counts", err);
      }
    }

    async function calculateSprintProgress() {
      try {
        const { tasks, issues } = await fetchAllSprintData();
        const sprintTasks = tasks.filter((t: any) => isItemInSprint(t.dueDate, t.status));
        const sprintIssues = issues.filter((i: any) => isItemInSprint(i.dueDate, i.status));
        
        const totalItems = sprintTasks.length + sprintIssues.length;
        if (totalItems === 0) {
          setProgress(100);
          return;
        }
        
        const completedTasks = sprintTasks.filter((t: any) => t.status === 'Done').length;
        const resolvedIssues = sprintIssues.filter((i: any) => i.status === 'Resolved' || i.status === 'Closed').length;
        
        const calculated = Math.round(((completedTasks + resolvedIssues) / totalItems) * 100);
        setProgress(calculated);
      } catch (err) {
        console.error("Error calculating sprint progress", err);
      }
    }
    
    loadLiveCounts();
    calculateSprintProgress();
    
    const handleStorageChange = () => {
      loadLiveCounts();
      calculateSprintProgress();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pwt_update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pwt_update', handleStorageChange);
    };
  }, [pathname]);

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-[#f8fafc]/90 backdrop-blur-md border-r border-slate-200/80 text-slate-700 select-none justify-between transition-all duration-300 ease-in-out',
        className
      )}
    >
      <div>
        {/* Workspace switcher — circular avatar + card */}
        <div className="p-4">
          <button
            onClick={() => router.push('/workshop')}
            className={cn(
              'flex items-center rounded-2xl bg-white text-left transition-all hover:shadow-md focus:outline-none cursor-pointer group border border-slate-200/80 w-full',
              isCollapsed ? 'p-2 justify-center mx-auto' : 'p-3 w-full gap-3'
            )}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-650 to-violet-650 shadow-md shadow-indigo-500/10 shrink-0">
              <Building className="h-4.5 w-4.5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 leading-tight">PWT Workspace</p>
                  <p className="truncate text-[10px] text-slate-450 font-semibold mt-0.5 leading-none">Pro Dashboard</p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-indigo-600 transition-colors" />
              </>
            )}
          </button>
        </div>

        {/* Navigation — card-grouped, pill items */}
        <div className="space-y-5 px-3">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <p className="px-2 mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {group.title}
                </p>
              )}
              <div className={cn(
                'rounded-2xl bg-white border border-slate-200 overflow-hidden',
                isCollapsed && 'bg-transparent border-none'
              )}>
                {group.items.map((item: any, idx) => {
                  const Icon = item.icon;
                  const linkContent = (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center transition-all duration-150',
                        isCollapsed
                          ? 'h-10 w-10 justify-center rounded-full mx-auto mb-1.5'
                          : 'gap-3 px-3 py-2.5 text-xs font-bold',
                        idx !== 0 && !isCollapsed && 'border-t border-slate-100',
                        item.active
                          ? isCollapsed ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50/50 text-indigo-650'
                          : isCollapsed ? 'text-slate-500 hover:bg-white' : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-900'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', !isCollapsed && (item.active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-650'))} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none',
                                item.active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </a>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12} className="bg-slate-900 text-white font-semibold shadow-md">
                          <div className="flex items-center gap-2">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="bg-white/10 text-white/70 text-[8px] font-bold px-1 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkContent;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: circular sprint stat + collapse */}
      <div className="p-3 mt-auto space-y-3">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => router.push('/sprint')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 mx-auto cursor-pointer text-indigo-600 hover:bg-slate-50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="bg-slate-900 text-white font-semibold shadow-md">
              Sprint Progress: {progress}%
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <span className="absolute text-[11px] font-black text-slate-800">{progress}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Weekly Sprint</p>
              <p className="text-xs font-bold text-slate-800">Almost there</p>
              <button 
                onClick={() => router.push('/sprint')}
                className="mt-1.5 text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View details
              </button>
            </div>
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'group flex items-center rounded-2xl transition-all duration-200 text-slate-500 hover:bg-white hover:text-slate-800 cursor-pointer',
              isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'px-3 py-2.5 text-xs font-bold gap-3 w-full border border-slate-200 bg-white'
            )}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4 w-4" />}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        )}
      </div>
    </aside>
  );
}