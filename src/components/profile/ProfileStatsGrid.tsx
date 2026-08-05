import { Layers, CheckCircle2, AlertCircle, Folder, Users } from 'lucide-react';
import type { ProfileStatsGridProps } from '@/types/profile.types';

export function ProfileStatsGrid({
  stats,
  isEmployeeOrLead,
  isAdminOrManager,
  isClient,
}: ProfileStatsGridProps) {
  let items: { label: string; value: number; icon: any; tint: string }[] = [];

  if (isEmployeeOrLead) {
    items = [
      { label: 'Assigned Tasks', value: stats.assignedTasks, icon: Layers, tint: '#64748b' },
      { label: 'Completed Tracks', value: stats.completedTasks, icon: CheckCircle2, tint: '#10b981' },
      { label: 'Issues Managed', value: stats.loggedIssues, icon: AlertCircle, tint: '#ef4444' },
      { label: 'Active Projects', value: stats.projectsCount, icon: Folder, tint: '#6366f1' },
    ];
  } else if (isAdminOrManager) {
    items = [
      { label: 'Total Projects', value: stats.totalProjects, icon: Folder, tint: '#6366f1' },
      { label: 'Total Employees', value: stats.totalEmployees, icon: Users, tint: '#10b981' },
      { label: 'Tasks Pending', value: stats.totalPendingTasks, icon: Layers, tint: '#f59e0b' },
      { label: 'Active Issues', value: stats.totalActiveIssues, icon: AlertCircle, tint: '#ef4444' },
    ];
  } else if (isClient) {
    items = [
      { label: 'Your Projects', value: stats.clientProjectsCount, icon: Folder, tint: '#6366f1' },
      { label: 'Project Tasks', value: stats.clientTasksCount, icon: Layers, tint: '#f59e0b' },
      { label: 'Active Employees', value: stats.clientEmployeesCount, icon: Users, tint: '#10b981' },
      { label: 'Project Issues', value: stats.clientIssuesCount, icon: AlertCircle, tint: '#ef4444' },
    ];
  }

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
            style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                `0 6px 16px -4px ${s.tint}18, 0 2px 6px -2px ${s.tint}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
            }}
          >
            {/* Radial wash */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(ellipse at top right, ${s.tint}09 0%, transparent 70%)` }}
            />

            {/* Icon */}
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

            {/* Text */}
            <div className="relative mt-5">
              <p
                className="text-[28px] font-black leading-none tracking-tight text-slate-800"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {s.value}
              </p>
              <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
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
  );
}
