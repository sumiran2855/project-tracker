import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/dal';
import {
  ArrowUpRight,
  TrendingUp,
  Plus,
  Play,
  Bug,
  MoreHorizontal,
  CalendarDays,
  Calendar,
} from 'lucide-react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/auth/permissions';
import { getProjectsAction } from '@/actions/projects';

export const metadata: Metadata = {
  title: 'Dashboard — Project Tracker',
  description: 'Your Project Tracker dashboard.',
};

const stats = [
  { label: 'Active Projects', value: '12',   change: '+2',   iconName: 'Folder',       tint: '#6366f1', positive: true  },
  { label: 'Open Tasks',      value: '48',   change: '-5',   iconName: 'CheckCircle2', tint: '#3b82f6', positive: true  },
  { label: 'Open Bugs',       value: '7',    change: '+3',   iconName: 'AlertTriangle',tint: '#ef4444', positive: false },
  { label: 'Hours Logged',    value: '134h', change: '+18h', iconName: 'Clock',        tint: '#ec4899', positive: true  },
];


const weeklyHours = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 8 },
  { day: 'Wed', hours: 5 },
  { day: 'Thu', hours: 7.5 },
  { day: 'Fri', hours: 9 },
  { day: 'Sat', hours: 2 },
  { day: 'Sun', hours: 0.5 },
];
const maxHours = Math.max(...weeklyHours.map((d) => d.hours));

const recentProjects = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    category: 'Web Application',
    status: 'In Progress',
    progress: 68,
    due: 'Jul 20',
    bar: '#6366f1',
    tasks: { completed: 24, total: 35 },
    team: [
      { initials: 'AC', name: 'Ava Chen', bg: 'bg-indigo-100 text-indigo-700' },
      { initials: 'MD', name: 'Marco Diaz', bg: 'bg-emerald-100 text-emerald-700' },
      { initials: 'SO', name: 'Sam Okafor', bg: 'bg-orange-100 text-orange-700' },
    ],
    updatedAt: '2h ago',
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    category: 'UI/UX Design',
    status: 'Review',
    progress: 90,
    due: 'Jul 12',
    bar: '#8b5cf6',
    tasks: { completed: 45, total: 50 },
    team: [
      { initials: 'SO', name: 'Sam Okafor', bg: 'bg-orange-100 text-orange-700' },
      { initials: 'AC', name: 'Ava Chen', bg: 'bg-indigo-100 text-indigo-700' },
    ],
    updatedAt: '10m ago',
  },
  {
    id: '3',
    name: 'API Gateway v2',
    category: 'Backend Services',
    status: 'Planning',
    progress: 25,
    due: 'Aug 1',
    bar: '#06b6d4',
    tasks: { completed: 5, total: 20 },
    team: [
      { initials: 'MD', name: 'Marco Diaz', bg: 'bg-emerald-100 text-emerald-700' },
      { initials: 'PR', name: 'Priya Rao', bg: 'bg-rose-100 text-rose-700' },
    ],
    updatedAt: '1d ago',
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    category: 'Data Analytics',
    status: 'Done',
    progress: 100,
    due: 'Completed',
    bar: '#10b981',
    tasks: { completed: 30, total: 30 },
    team: [
      { initials: 'PR', name: 'Priya Rao', bg: 'bg-rose-100 text-rose-700' },
      { initials: 'AC', name: 'Ava Chen', bg: 'bg-indigo-100 text-indigo-700' },
      { initials: 'SO', name: 'Sam Okafor', bg: 'bg-orange-100 text-orange-700' },
    ],
    updatedAt: '3h ago',
  },
];



const recentActivity = [
  { text: 'Bug #142 resolved in E-Commerce Platform', time: '2m ago', dot: 'bg-emerald-500' },
  { text: 'Task "Design tokens" moved to Review', time: '18m ago', dot: 'bg-indigo-500' },
  { text: 'New bug #143 filed by QA team', time: '1h ago', dot: 'bg-red-500' },
  { text: 'Sprint 6 kicked off for Mobile Redesign', time: '3h ago', dot: 'bg-purple-500' },
];

const team = [
  { name: 'Ava Chen', role: 'Frontend', load: 82, initials: 'AC' },
  { name: 'Marco Diaz', role: 'Backend', load: 64, initials: 'MD' },
  { name: 'Priya Rao', role: 'QA', load: 91, initials: 'PR' },
  { name: 'Sam Okafor', role: 'Design', load: 47, initials: 'SO' },
];

const deadlines = [
  { title: 'Mobile App Redesign — Review', date: 'Jul 12', urgent: true },
  { title: 'E-Commerce Platform — Launch', date: 'Jul 20', urgent: false },
  { title: 'Client sync: API Gateway v2', date: 'Jul 15', urgent: false },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const canViewWorkload = hasPermission(user?.role, 'dashboard:view-team-workload');
  const canViewQuickActions = hasPermission(user?.role, 'dashboard:view-quick-actions');

  let activeProjects: any[] = [];
  const dynamicStats = [
    { label: 'Active Projects', value: '0',   change: '+2',   iconName: 'Folder',       tint: '#6366f1', positive: true  },
    { label: 'Open Tasks',      value: '48',   change: '-5',   iconName: 'CheckCircle2', tint: '#3b82f6', positive: true  },
    { label: 'Open Bugs',       value: '7',    change: '+3',   iconName: 'AlertTriangle',tint: '#ef4444', positive: false },
    { label: 'Hours Logged',    value: '134h', change: '+18h', iconName: 'Clock',        tint: '#ec4899', positive: true  },
  ];

  try {
    const res = await getProjectsAction();
    if (res.success && res.data) {
      activeProjects = res.data;
      dynamicStats[0].value = String(activeProjects.length);
    }
  } catch (error) {
    console.error('Failed to load projects in dashboard:', error);
  }

  const projectsToRender = activeProjects.length > 0 ? activeProjects.slice(0, 4).map(p => {
    const barColors: Record<string, string> = {
      'Planning': '#06b6d4',
      'In Progress': '#6366f1',
      'In Review': '#8b5cf6',
      'Completed': '#10b981',
    };
    return {
      id: p.id,
      name: p.name,
      category: p.techStack && p.techStack.length > 0 ? p.techStack.slice(0, 2).join(', ') : 'General Workspace',
      status: p.status,
      progress: p.progress,
      due: p.dueDate || 'No Due Date',
      bar: barColors[p.status] || '#6366f1',
      tasks: { completed: p.completedTasks || 0, total: p.tasksCount || 0 },
      team: p.members.map((m: any) => ({
        initials: m.initials,
        name: m.name,
        bg: m.bg
      })),
      updatedAt: 'Just now',
    };
  }) : recentProjects;

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8 lg:p-10">
      {/* Hero banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-[#1F4D3E] px-7 py-7 md:px-9 md:py-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#F4A340]/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              <TrendingUp className="h-3 w-3" /> Performance up 12%
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
              Good to see you, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              Here&apos;s what&apos;s happening across your projects today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dynamicStats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            change={s.change}
            iconName={s.iconName}
            tint={s.tint}
            positive={s.positive}
          />
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Weekly hours chart — spans 2 or 3 depending on workload visibility */}
        <div className={cn("rounded-2xl border border-slate-200 bg-white p-6 shadow-xs", canViewWorkload ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Hours Logged This Week</h2>
              <p className="text-xs text-slate-450 mt-0.5">38.5h total · avg 5.5h/day</p>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-end justify-between gap-3 h-40">
            {weeklyHours.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full h-32 flex items-end rounded-lg bg-slate-50 overflow-hidden">
                  <div
                    className="w-full rounded-lg bg-gradient-to-t from-indigo-500 to-indigo-600 transition-all"
                    style={{ height: `${(d.hours / maxHours) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team workload */}
        {canViewWorkload && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-1">Team Workload</h2>
            <p className="text-xs text-slate-400 mb-5">Capacity this sprint</p>
            <div className="space-y-4">
              {team.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100/50">
                    {t.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">{t.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{t.load}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${t.load}%`,
                          backgroundColor: t.load > 85 ? '#ef4444' : t.load > 60 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent projects — spans 2 or 3 */}
        <div className={cn("rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col", canViewQuickActions ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recent Projects</h2>
              <p className="text-xs text-slate-450 mt-0.5">Your most active development tracks</p>
            </div>
            <a href="/projects" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-650 hover:bg-slate-50 transition-all shadow-xs whitespace-nowrap shrink-0">
              View all
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50/30 flex-1">
            {projectsToRender.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>
        </div>

        {/* Right rail: Deadlines + Activity + Quick actions */}
        <div className={cn("space-y-5", !canViewQuickActions && "lg:col-span-3 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0")}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h2>
            </div>
            <div className="space-y-3">
              {deadlines.map((d) => (
                <div key={d.title} className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-650 leading-snug">{d.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      d.urgent ? 'bg-red-50 text-red-650 border border-red-150/30' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {d.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Recent Activity</h2>
            <div className="relative border-l-2 border-slate-100 pl-5 space-y-5">
              {recentActivity.map((a, i) => (
                <div key={i} className="relative">
                  <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white ${a.dot}`} />
                  <p className="text-xs font-semibold text-slate-650 leading-snug">{a.text}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 font-medium">{a.time}</p>
                </div>
              ))}
            </div>
          </div>

          {canViewQuickActions && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h2>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'New Project', icon: Plus, fg: '#4f46e5', bg: '#e0e7ff60' },
                  { label: 'Log Time', icon: Play, fg: '#10b981', bg: '#d1fae560' },
                  { label: 'File a Bug', icon: Bug, fg: '#ef4444', bg: '#fee2e260' },
                ].map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={qa.label}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all hover:brightness-95 cursor-pointer shadow-xs"
                      style={{ color: qa.fg, backgroundColor: qa.bg }}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{qa.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}