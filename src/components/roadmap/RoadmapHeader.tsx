import React from 'react';
import { Map, Plus, Sparkles } from 'lucide-react';
import { Project } from '@/services/useRoadmapService';

interface RoadmapHeaderProps {
  canManageRoadmap: boolean;
  projectsCount: number;
  onOpenMilestoneModal: () => void;
}

export function RoadmapHeader({
  canManageRoadmap,
  projectsCount,
  onOpenMilestoneModal,
}: RoadmapHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Workspace Planning</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 shadow-xs border border-indigo-100/30">
            <Map className="h-5 w-5" />
          </div>
          Product Roadmap
        </h1>
        <p className="text-xs text-slate-455 font-medium mt-1">
          Map initiative timelines, release targets, and track milestones across the lifecycle.
        </p>
      </div>

      {/* Action button */}
      {canManageRoadmap && (
        <button
          onClick={onOpenMilestoneModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Milestone</span>
        </button>
      )}
    </div>
  );
}
