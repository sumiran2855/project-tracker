'use client';

import { Folder, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { DashboardProject } from '@/types/dashboard.types';

const statusStyles: Record<string, string> = {
  'In Progress': 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-405 border border-indigo-100/60 dark:border-indigo-900/30',
  Review: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-100/60 dark:border-indigo-900/30',
  Planning: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700',
  Done: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30',
};

export function ProjectCard({ p }: { p: DashboardProject }) {
  const cardContent = (
    <div
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 h-full"
      style={{
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px -4px ${p.bar}30, 0 4px 12px -2px ${p.bar}20`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)';
      }}
    >
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Card Header: Icon + Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${p.bar}20, ${p.bar}10)`,
                border: `1px solid ${p.bar}25`,
              }}
            >
              <Folder className="h-5 w-5" style={{ color: p.bar }} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 truncate">
                {p.category}
              </p>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight truncate mt-0.5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {p.name}
              </h3>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold ${statusStyles[p.status] || statusStyles['Planning']}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {p.status}
          </span>
        </div>

        {/* Progress section */}
        <div className="flex items-center gap-4">
          {/* Circular progress badge */}
          <div
            className="relative shrink-0 flex items-center justify-center"
            style={{ width: 52, height: 52 }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
              <circle cx="26" cy="26" r="21" fill="none" stroke={`${p.bar}18`} strokeWidth="5" />
              <circle
                cx="26"
                cy="26"
                r="21"
                fill="none"
                stroke={p.bar}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 21}`}
                strokeDashoffset={`${2 * Math.PI * 21 * (1 - p.progress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span
              className="absolute text-[10px] font-black leading-none"
              style={{ color: p.bar }}
            >
              {p.progress}%
            </span>
          </div>

          {/* Task progress bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {p.tasks.completed} / {p.tasks.total} tasks
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{p.progress}% done</span>
            </div>
            {/* Smooth gradient progress bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${p.progress}%`,
                  background: `linear-gradient(90deg, ${p.bar}cc, ${p.bar})`,
                }}
              />
            </div>
            {/* Milestone ticks */}
            <div className="flex justify-between mt-1.5 px-px">
              {[0, 25, 50, 75, 100].map((tick) => (
                <span
                  key={tick}
                  className="text-[8px] font-bold"
                  style={{ color: p.progress >= tick ? p.bar : '#cbd5e1' }}
                >
                  {tick === 0 ? '' : tick === 100 ? '✓' : `${tick}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800 mt-auto">
          {/* Avatar Stack */}
          <div className="flex -space-x-2">
            {p.team.filter((member: any) => {
              const r = member.role?.toLowerCase();
              if (r === 'admin') return false;
              const nameLower = (member.name || '').toLowerCase();
              if (nameLower.includes('admin')) return false;
              return true;
            }).map((member) => (
              <div
                key={member.name}
                title={member.name}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-black border-2 border-white dark:border-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 transition-transform duration-200 hover:scale-110 hover:z-10 relative ${member.bg}`}
              >
                {member.initials}
              </div>
            ))}
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-800 text-[8px] font-black text-slate-400 dark:text-slate-500">
              +
            </div>
          </div>

          {/* Date & updated */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ background: `${p.bar}10`, color: p.bar }}
            >
              <Calendar className="h-3 w-3 shrink-0" />
              {p.due === 'Completed' ? '✓ Done' : p.due}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-slate-400 dark:text-slate-500">{p.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (p.id) {
    return (
      <Link href={`/projects/${p.id}`} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
