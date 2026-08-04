import { TrendingUp, CalendarDays, FolderOpen } from 'lucide-react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { HoursLoggedCard } from '@/components/dashboard/HoursLoggedCard';
import { TeamHierarchyCard } from '@/components/dashboard/TeamHierarchyCard';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { cn } from '@/lib/utils';
import { dashboardMetadata } from '@/types/app.metadata';
import { getDashboardData } from '@/services/dashboardService';

export const metadata = dashboardMetadata;

export default async function DashboardPage() {
  const {
    user,
    userRole,
    canViewQuickActions,
    dynamicStats,
    weeklyHoursList,
    weeklyCapacity,
    dailyCapacity,
    isEmployeeRole,
    maxHours,
    uniqueLoggedProjects,
    uniqueLoggedEmployees,
    hierarchyTree,
    projectsToRender,
    deadlines,
    recentActivity,
    allEmployees,
    activeProjects,
  } = await getDashboardData();

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 md:p-8 lg:p-10">
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
        <HoursLoggedCard
          weeklyHoursList={weeklyHoursList}
          weeklyCapacity={weeklyCapacity}
          dailyCapacity={dailyCapacity}
          isEmployeeRole={isEmployeeRole}
          canViewWorkload={userRole !== 'client'}
          maxHours={maxHours}
          uniqueLoggedProjects={uniqueLoggedProjects}
          uniqueLoggedEmployees={uniqueLoggedEmployees}
        />

        {/* Team Hierarchy Card */}
        {userRole !== 'client' && (
          <TeamHierarchyCard hierarchyTree={hierarchyTree} />
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
          <div className="max-h-[580px] overflow-y-auto p-6 bg-slate-50/30 flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {projectsToRender.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsToRender.map((p) => (
                  <ProjectCard key={p.name} p={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <FolderOpen className="h-8 w-8 text-slate-350 mb-2" />
                <p className="text-xs text-slate-450 italic font-medium">No projects found. Create a project to get started!</p>
              </div>
            )}
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
            <QuickActionsPanel projects={activeProjects} employees={allEmployees} />
          )}
        </div>
      </div>
    </div>
  );
}