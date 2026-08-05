import { SquareChartGantt, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TIMELINE_START, 
  TIMELINE_END, 
  TOTAL_TIMELINE_DAYS 
} from '@/services/useRoadmapService';
import type { RoadmapTimelineProps } from '@/types/roadmap.types';

export function RoadmapTimeline({
  filteredProjects,
  milestones,
  isEmployee,
  onOpenEditProjectModal,
  getStatusStyles,
}: RoadmapTimelineProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs overflow-hidden">
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center space-y-2">
          <SquareChartGantt className="h-8 w-8 text-slate-300" />
          <span>No projects matched the search criteria.</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-4">
          <div className="space-y-6 min-w-[760px]">
            {/* Timeline Header (Months) */}
            <div className="flex border-b border-slate-100 pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest relative">
              <div className="w-1/3 shrink-0">Initiative details</div>

              {/* Monthly column headers */}
              <div className="flex-1 flex justify-between relative pl-6 pr-6">
                <span className="w-1/6 text-center">Jun 26</span>
                <span className="w-1/6 text-center">Jul 26</span>
                <span className="w-1/6 text-center">Aug 26</span>
                <span className="w-1/6 text-center">Sep 26</span>
                <span className="w-1/6 text-center">Oct 26</span>
                <span className="w-1/6 text-center">Nov 26</span>
              </div>
            </div>

            {/* Timeline grid rows */}
            <div className="space-y-4">
              {filteredProjects.map(project => {
                let startDay = new Date(project.startDate || '2026-07-01');
                let endDay = new Date(project.dueDate || '2026-07-31');

                // Clamp to timeline range
                let adjustedStart = new Date(Math.max(TIMELINE_START.getTime(), startDay.getTime()));
                let adjustedEnd = new Date(Math.min(TIMELINE_END.getTime(), endDay.getTime()));

                // If dates are invalid, fallback
                if (isNaN(adjustedStart.getTime())) adjustedStart = new Date('2026-07-01');
                if (isNaN(adjustedEnd.getTime())) adjustedEnd = new Date('2026-07-31');
                if (adjustedEnd < adjustedStart) adjustedEnd = adjustedStart;

                // Compute offsets
                const startDiffMs = adjustedStart.getTime() - TIMELINE_START.getTime();
                const startDiffDays = startDiffMs / (1000 * 60 * 60 * 24);

                const spanDiffMs = adjustedEnd.getTime() - adjustedStart.getTime();
                const spanDiffDays = spanDiffMs / (1000 * 60 * 60 * 24) + 1;

                // Percentages
                const leftOffsetPercent = (startDiffDays / TOTAL_TIMELINE_DAYS) * 100;
                const widthPercent = (spanDiffDays / TOTAL_TIMELINE_DAYS) * 100;

                // Color styles
                const barColor =
                  project.status === 'Completed' ? 'from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                    project.status === 'In Review' ? 'from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.15)]' :
                      project.status === 'In Progress' ? 'from-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.15)]' :
                        'from-blue-400 to-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.15)]';

                // Project linked milestones
                const projectMilestones = milestones.filter(m => m.projectId === project.id);

                return (
                  <div
                    key={project.id}
                    className="flex items-center hover:bg-slate-50/50 p-2.5 rounded-2xl transition-all group"
                  >
                    {/* Project title and summary info */}
                    <div className="w-1/3 shrink-0 pr-4 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-650 transition-colors">
                          {project.name}
                        </h4>
                        {!isEmployee && (
                          <button
                            onClick={() => onOpenEditProjectModal(project)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                            title="Edit Initiative Dates"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[8px] font-black uppercase tracking-wider border rounded-md px-1.5 py-0.2", getStatusStyles(project.status))}>
                          {project.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {project.progress}% completed ({projectMilestones.length} milestones)
                        </span>
                      </div>
                    </div>

                    {/* Gantt track */}
                    <div className="flex-1 h-12 bg-slate-50/60 rounded-2xl border border-slate-100 relative overflow-hidden pl-6 pr-6 flex items-center">
                      {/* Monthly vertical dividers */}
                      <div className="absolute inset-y-0 left-1/6 border-l border-dashed border-slate-200/40" />
                      <div className="absolute inset-y-0 left-2/6 border-l border-dashed border-slate-200/40" />
                      <div className="absolute inset-y-0 left-3/6 border-l border-dashed border-slate-200/40" />
                      <div className="absolute inset-y-0 left-4/6 border-l border-dashed border-slate-200/40" />
                      <div className="absolute inset-y-0 left-5/6 border-l border-dashed border-slate-200/40" />

                      {/* Gantt Project Duration Bar */}
                      <div
                        onClick={() => !isEmployee && onOpenEditProjectModal(project)}
                        className={cn(
                          "absolute h-6.5 rounded-xl bg-gradient-to-r flex items-center justify-between px-3 text-[9px] font-extrabold text-white transition-all shadow-xs",
                          barColor,
                          !isEmployee ? "cursor-pointer hover:scale-[1.01] hover:brightness-105 active:scale-99" : "cursor-default"
                        )}
                        style={{
                          left: `${leftOffsetPercent}%`,
                          width: `${widthPercent}%`,
                          minWidth: '36px'
                        }}
                      >
                        <span className="truncate">{project.name}</span>
                        <span className="text-[7px] bg-white/20 px-1 rounded-md shrink-0 ml-1.5">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} - {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>

                      {/* Visual milestones points on the track */}
                      {projectMilestones.map(m => {
                        try {
                          const milestoneDate = new Date(m.dueDate);
                          if (milestoneDate >= TIMELINE_START && milestoneDate <= TIMELINE_END) {
                            const diff = milestoneDate.getTime() - TIMELINE_START.getTime();
                            const days = diff / (1000 * 60 * 60 * 24);
                            const pct = (days / TOTAL_TIMELINE_DAYS) * 100;

                            return (
                              <div
                                key={m.id}
                                className={cn(
                                  "absolute h-2.5 w-2.5 rotate-45 border-2 ring-3 transition-all z-20 group/ms hover:scale-125",
                                  m.completed
                                    ? "bg-emerald-500 border-white ring-emerald-500/20"
                                    : "bg-white border-amber-500 ring-amber-500/20"
                                )}
                                style={{ left: `${pct}%`, top: 'calc(50% - 5px)' }}
                                title={`Milestone: ${m.title} (${m.dueDate})`}
                              />
                            );
                          }
                        } catch { }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
