import React from 'react';
import { Milestone, CheckCircle2, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, MilestoneItem } from '@/services/useRoadmapService';

interface RoadmapMilestonesProps {
  filteredMilestones: MilestoneItem[];
  completedMilestones: number;
  totalMilestones: number;
  projects: Project[];
  canManageRoadmap: boolean;
  handleToggleMilestone: (id: string) => void;
  handleDeleteMilestone: (id: string) => void;
}

export function RoadmapMilestones({
  filteredMilestones,
  completedMilestones,
  totalMilestones,
  projects,
  canManageRoadmap,
  handleToggleMilestone,
  handleDeleteMilestone,
}: RoadmapMilestonesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Milestone className="h-4.5 w-4.5 text-indigo-650" />
          <h3 className="text-sm font-black text-slate-800">Workspace Milestones Checklist</h3>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Milestones Met: {completedMilestones} / {totalMilestones} ({totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%)
        </p>
      </div>

      {filteredMilestones.length === 0 ? (
        <div className="py-16 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-slate-350" />
          <span>No milestones found matching the filters.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMilestones.map(milestone => {
            const linkedProj = projects.find(p => p.id === milestone.projectId);

            return (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-start justify-between p-4 rounded-2xl border transition-all duration-200",
                  milestone.completed
                    ? "bg-slate-50/50 border-slate-150/70 opacity-75"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                )}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer mt-0.5",
                      milestone.completed
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                        : "bg-white border-slate-250 text-transparent hover:border-indigo-500"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-1 min-w-0">
                    {/* Title */}
                    <h4 className={cn(
                      "text-xs font-black text-slate-800 leading-snug",
                      milestone.completed && "line-through text-slate-450"
                    )}>
                      {milestone.title}
                    </h4>

                    {/* Description */}
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      {milestone.description}
                    </p>

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[9px] font-bold">
                      {linkedProj && (
                        <span className="text-indigo-600 bg-indigo-50/50 border border-indigo-150/50 rounded-md px-1.5 py-0.5 uppercase tracking-wider">
                          {linkedProj.name}
                        </span>
                      )}

                      {milestone.assignedTo && (
                        <span className="text-emerald-700 bg-emerald-50/50 border border-emerald-150/50 rounded-md px-1.5 py-0.5 tracking-wider">
                          Assignee: {milestone.assignedTo}
                        </span>
                      )}

                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                {canManageRoadmap && (
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-55 rounded-lg transition-colors cursor-pointer ml-3 shrink-0"
                    title="Delete Milestone"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
