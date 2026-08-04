import React from 'react';
import { FolderOpen, Layers, Milestone, TrendingUp } from 'lucide-react';

interface RoadmapKpisProps {
  totalInitiatives: number;
  activeQuarters: number;
  completedMilestones: number;
  totalMilestones: number;
  onTrackInitiatives: number;
}

export function RoadmapKpis({
  totalInitiatives,
  activeQuarters,
  completedMilestones,
  totalMilestones,
  onTrackInitiatives,
}: RoadmapKpisProps) {
  const cards = [
    { label: 'Total Initiatives', value: totalInitiatives, icon: FolderOpen, tint: '#64748b' },
    { label: 'Active Quarters', value: activeQuarters, icon: Layers, tint: '#6366f1' },
    { label: 'Milestones Completed', value: `${completedMilestones}/${totalMilestones}`, icon: Milestone, tint: '#10b981' },
    { label: 'On Track Projects', value: onTrackInitiatives, icon: TrendingUp, tint: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
            style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                `0 6px 16px -4px ${stat.tint}18, 0 2px 6px -2px ${stat.tint}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
            }}
          >
            {/* Radial tint wash on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(ellipse at top right, ${stat.tint}09 0%, transparent 70%)` }}
            />

            {/* Icon */}
            <div className="relative">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${stat.tint}20, ${stat.tint}0d)`,
                  border: `1px solid ${stat.tint}28`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: stat.tint }} />
              </div>
            </div>

            {/* Value + label + accent line */}
            <div className="relative mt-5">
              <p
                className="text-[28px] font-black leading-none tracking-tight text-slate-800"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {stat.value}
              </p>
              <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {stat.label}
              </p>
              <div
                className="mt-3 h-0.5 w-8 rounded-full opacity-40 group-hover:w-11 transition-all duration-500"
                style={{ backgroundColor: stat.tint }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
