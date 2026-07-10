'use client';

import { Folder, CheckCircle2, AlertTriangle, Clock, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Folder,
  CheckCircle2,
  AlertTriangle,
  Clock,
};

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  iconName: string;
  tint: string;
  positive?: boolean;
}

export function StatCard({ label, value, change, iconName, tint, positive }: StatCardProps) {
  const Icon = iconMap[iconName] ?? Folder;

  const isPositive = positive ?? change.startsWith('+');
  const isNeutral = positive === undefined && !change.startsWith('+') && !change.startsWith('-');

  const changeColor = isNeutral ? '#64748b' : isPositive ? '#10b981' : '#ef4444';
  const changeBg   = isNeutral ? '#f1f5f9' : isPositive ? '#d1fae5' : '#fee2e2';
  const changePrefix = isNeutral ? '' : isPositive ? '↑' : '↓';

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
      style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 6px 16px -4px ${tint}18, 0 2px 6px -2px ${tint}10`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at top right, ${tint}09 0%, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${tint}20, ${tint}0d)`,
            border: `1px solid ${tint}28`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: tint }} />
        </div>

        <span
          className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black"
          style={{ backgroundColor: changeBg, color: changeColor }}
        >
          {changePrefix} {change.replace(/^[+-]/, '')}
        </span>
      </div>

      <div className="relative mt-5">
        <p
          className="text-[28px] font-black leading-none tracking-tight text-slate-800"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </p>
        <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <div
          className="mt-3 h-0.5 w-8 rounded-full opacity-40 group-hover:w-11 transition-all duration-500"
          style={{ backgroundColor: tint }}
        />
      </div>
    </div>
  );
}
