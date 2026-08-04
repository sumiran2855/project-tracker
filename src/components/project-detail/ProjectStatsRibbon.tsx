import { Calendar, Sparkles, Coins, Hash, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member } from '@/services/useProjectsService';

interface ProjectStatsRibbonProps {
  project: {
    progress: number;
    completedTasks: number;
    tasksCount: number;
    members: Member[];
    startDate?: string;
    targetQuarter?: string;
    priority?: string;
    budget?: string;
    slackChannel?: string;
    repositoryUrl?: string;
  };
  projectBudgetHours: number;
  totalLoggedProjectHours: number;
  remainingProjectHours: number;
  getPriorityColor: (prio: any) => string;
}

export function ProjectStatsRibbon({
  project,
  projectBudgetHours,
  totalLoggedProjectHours,
  remainingProjectHours,
  getPriorityColor,
}: ProjectStatsRibbonProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Progress Circular Gauge */}
        <div className="flex items-center gap-5 shrink-0 w-full md:w-auto">
          <div className="relative flex h-16 w-16 items-center justify-center bg-indigo-50/20 rounded-2xl border border-slate-100">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 - (project.progress / 100) * 2 * Math.PI * 18}
              />
            </svg>
            <span className="absolute text-xs font-black text-indigo-750">{project.progress}%</span>
          </div>
          
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sprint Health</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{project.completedTasks} / {project.tasksCount} Tasks Done</p>
            
            <div className="flex -space-x-1.5 mt-2">
              {project.members.filter((m: any) => {
                const r = m.role?.toLowerCase();
                if (r === 'admin') return false;
                const nameLower = (m.name || '').toLowerCase();
                if (nameLower.includes('admin')) return false;
                return true;
              }).map((member, i) => (
                <div key={i} className={cn("h-6 w-6 rounded-lg text-[8px] font-extrabold text-white flex items-center justify-center ring-2 ring-white", member.bg)} title={member.name}>
                  {member.initials}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100">
        {/* Start Date */}
        {project.startDate && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Start Date</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750">
              <Calendar className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
              <span>{project.startDate}</span>
            </div>
          </div>
        )}

        {/* Target Quarter */}
        {project.targetQuarter && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Release Quarter</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750">
              <Sparkles className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
              <span>{project.targetQuarter}</span>
            </div>
          </div>
        )}

        {/* Priority */}
        {project.priority && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Priority</span>
            <div className="flex items-center gap-1.5 text-xs font-black">
              <span className={cn("rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border", getPriorityColor(project.priority))}>
                {project.priority}
              </span>
            </div>
          </div>
        )}

        {/* Budget */}
        {project.budget && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Budget / Est. Hours</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750">
              <Coins className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
              <div className="flex flex-col">
                <span>{project.budget}</span>
                {projectBudgetHours > 0 && (
                  <span className="text-[9px] text-slate-455 font-bold mt-0.5">
                    Spent: {totalLoggedProjectHours}h | Left: {remainingProjectHours}h
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slack Channel */}
        {project.slackChannel && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Slack Channel</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-755">
              <Hash className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
              <span className="truncate" title={project.slackChannel}>{project.slackChannel}</span>
            </div>
          </div>
        )}

        {/* Repository */}
        {project.repositoryUrl && (
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Repository</span>
            <a 
              href={project.repositoryUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-650 hover:text-indigo-850 hover:underline transition-all"
            >
              <Link2 className="h-3.5 w-3.5 text-indigo-505 shrink-0" />
              <span className="truncate">View Code</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
