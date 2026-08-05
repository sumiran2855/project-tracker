import { Milestone, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadmapQuarterlyBoardProps } from '@/types/roadmap.types';
import type { Project } from '@/types/projects.types';

export function RoadmapQuarterlyBoard({
  filteredProjects,
  milestones,
  isEmployee,
  handleDragStart,
  handleDrop,
  handleDragOver,
  onOpenEditProjectModal,
  getStatusStyles,
}: RoadmapQuarterlyBoardProps) {
  const columns: { id: Project['targetQuarter']; label: string; desc: string }[] = [
    { id: 'Q2 2026', label: 'Q2 2026', desc: 'Apr - Jun Release Goals' },
    { id: 'Q3 2026', label: 'Q3 2026', desc: 'Jul - Sep Core Milestones' },
    { id: 'Q4 2026', label: 'Q4 2026', desc: 'Oct - Dec Final Deliveries' },
    { id: 'Future', label: 'Future / Backlog', desc: 'Upcoming Roadmaps' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {columns.map(col => {
        const columnProjects = filteredProjects.filter(p => p.targetQuarter === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-5 flex flex-col min-h-[400px] shadow-2xs transition-colors hover:border-slate-350"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{col.label}</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-none">{col.desc}</p>
              </div>
              <span className="rounded-full bg-white border border-slate-250 text-slate-500 text-[10px] font-black px-2.5 py-0.5 shadow-3xs">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="space-y-4 flex-1 pr-1.5 mt-2">
              {columnProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-extrabold text-center h-32 select-none">
                  Drag Projects Here
                </div>
              ) : (
                columnProjects.map(project => {
                  const projectMilestones = milestones.filter(m => m.projectId === project.id);
                  const completedMilestonesCount = projectMilestones.filter(m => m.completed).length;

                  return (
                    <div
                      key={project.id}
                      draggable={!isEmployee}
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      className={cn(
                        "group bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 relative overflow-hidden",
                        !isEmployee ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                      )}
                    >
                      <span className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-indigo-505/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      <div className="space-y-3">
                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <span className={cn("rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getStatusStyles(project.status))}>
                            {project.status}
                          </span>
                          {!isEmployee && (
                            <button
                              onClick={() => onOpenEditProjectModal(project)}
                              className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Dates"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {/* Project Title */}
                        <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </h4>

                        <p className="text-[10px] text-slate-455 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-550">
                            <span>Sprint Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-350",
                                project.status === 'Completed' ? 'bg-emerald-500' :
                                  project.status === 'In Review' ? 'bg-amber-500' : 'bg-indigo-600'
                              )}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer stats */}
                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold">
                          <Milestone className="h-3 w-3" />
                          <span>{completedMilestonesCount}/{projectMilestones.length} Milestones</span>
                        </div>

                        <div className="flex -space-x-1.5 overflow-hidden">
                          {project.members.filter((m: any) => {
                            const r = m.role?.toLowerCase();
                            if (r === 'admin') return false;
                            const nameLower = (m.name || '').toLowerCase();
                            if (nameLower.includes('admin')) return false;
                            return true;
                          }).map((member, i) => (
                            <div key={i} className={cn("h-5 w-5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", member.bg)} title={member.name}>
                              {member.initials}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
