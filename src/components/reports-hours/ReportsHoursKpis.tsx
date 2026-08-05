import { Clock, Layers, TrendingUp, Briefcase } from 'lucide-react';
import type { ReportsHoursKpisProps } from '@/types/reports.types';

export function ReportsHoursKpis({
  totalHours,
  entriesCount,
  avgDailyHours,
  mostActiveProject,
}: ReportsHoursKpisProps) {
  const cards = [
    {
      label: 'Total Hours Logged',
      value: totalHours,
      icon: Clock,
      iconColor: 'text-slate-550',
      bgColor: 'bg-slate-50 border-slate-100',
      lineColor: 'bg-slate-300',
    },
    {
      label: 'Log Entries Recorded',
      value: entriesCount,
      icon: Layers,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 border-indigo-100',
      lineColor: 'bg-indigo-300',
    },
    {
      label: 'Daily Average',
      value: `${avgDailyHours}h`,
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 border-emerald-100',
      lineColor: 'bg-emerald-300',
    },
    {
      label: 'Most Active Project',
      value: mostActiveProject,
      icon: Briefcase,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 border-amber-100',
      lineColor: 'bg-amber-300',
      truncate: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5.5 shadow-3xs flex flex-col justify-between hover:scale-[1.01] hover:shadow-xs transition-all duration-300">
            <div className={`h-9 w-9 ${card.bgColor} rounded-lg flex items-center justify-center ${card.iconColor} shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-4 min-w-0">
              <span className={`font-extrabold text-slate-805 block tracking-tight ${card.truncate ? 'text-lg truncate max-w-full' : 'text-3xl'}`} title={String(card.value)}>
                {card.value}
              </span>
              <span className="text-[9.5px] font-black text-slate-400 tracking-wider uppercase block mt-1">
                {card.label}
              </span>
              <div className={`w-8 h-0.5 ${card.lineColor} mt-3 rounded-full`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
