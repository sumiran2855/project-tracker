import React from 'react';
import { ArrowUpDown, Folder, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/services/useWorkshopService';

interface WorkshopSheetProps {
  filteredProjects: Project[];
  handleSort: (field: 'name' | 'progress' | 'priority' | 'status' | 'dueDate') => void;
  visibleColumns: {
    quarter: boolean;
    priority: boolean;
    status: boolean;
    progress: boolean;
    techStack: boolean;
    budget: boolean;
    team: boolean;
  };
  handleProjectClick: (project: Project) => void;
}

export function WorkshopSheet({
  filteredProjects,
  handleSort,
  visibleColumns,
  handleProjectClick
}: WorkshopSheetProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'In Review':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Planning':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-655 border-indigo-500/20';
    }
  };

  const getPriorityColor = (priority?: Project['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-655 border-red-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-655 border-orange-500/20';
      case 'Medium':
        return 'bg-indigo-500/10 text-indigo-655 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-455 uppercase text-[9px] font-black tracking-wider">
              <th className="py-3 px-3 text-center text-slate-400 font-extrabold w-10 bg-slate-50/70 border-r border-slate-150">#</th>
              <th
                onClick={() => handleSort('name')}
                className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Project Workspace</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                </div>
              </th>

              {visibleColumns.quarter && (
                <th
                  onClick={() => handleSort('dueDate')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target Quarter</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                  </div>
                </th>
              )}

              {visibleColumns.priority && (
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                  </div>
                </th>
              )}

              {visibleColumns.status && (
                <th
                  onClick={() => handleSort('status')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                  </div>
                </th>
              )}

              {visibleColumns.progress && (
                <th
                  onClick={() => handleSort('progress')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:bg-slate-100/70 transition-colors border-r border-slate-150 select-none group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Completion Progress</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-55 group-hover:opacity-100" />
                  </div>
                </th>
              )}

              {visibleColumns.techStack && (
                <th className="py-3.5 px-4 font-black border-r border-slate-150">Tech Stack</th>
              )}

              {visibleColumns.budget && (
                <th className="py-3.5 px-4 font-black border-r border-slate-150">Total Budget</th>
              )}

              {visibleColumns.team && (
                <th className="py-3.5 px-4 font-black border-r border-slate-150">Assigned Team</th>
              )}

              <th className="py-3.5 px-4 font-black text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                  No active initiative worksheets found matching filters.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project, idx) => (
                <tr
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Row Index */}
                  <td className="py-4 px-3 text-center text-slate-400 font-black bg-slate-50/30 border-r border-slate-150 select-none">
                    {idx + 1}
                  </td>

                  {/* Workspace Details */}
                  <td className="py-4 px-4 font-bold text-slate-800 border-r border-slate-150">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-650 shrink-0">
                        <Folder className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black tracking-tight text-slate-850 group-hover:text-indigo-650 transition-colors">{project.name}</p>
                        <p className="truncate text-[10px] text-slate-455 font-medium mt-0.5 max-w-[240px]">{project.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Quarter */}
                  {visibleColumns.quarter && (
                    <td className="py-4 px-4 font-bold text-slate-500 whitespace-nowrap border-r border-slate-150">
                      {project.targetQuarter || 'Future'}
                    </td>
                  )}

                  {/* Priority */}
                  {visibleColumns.priority && (
                    <td className="py-4 px-4 whitespace-nowrap border-r border-slate-150">
                      <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full", getPriorityColor(project.priority))}>
                        {project.priority || 'Medium'}
                      </span>
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <td className="py-4 px-4 whitespace-nowrap border-r border-slate-150">
                      <span className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full", getStatusColor(project.status))}>
                        {project.status}
                      </span>
                    </td>
                  )}

                  {/* Completion Progress */}
                  {visibleColumns.progress && (
                    <td className="py-4 px-4 min-w-[150px] border-r border-slate-150">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-2 bg-slate-100 border border-slate-200/55 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full transition-all duration-350"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 w-8 text-right">{project.progress}%</span>
                      </div>
                    </td>
                  )}

                  {/* Tech Stack */}
                  {visibleColumns.techStack && (
                    <td className="py-4 px-4 border-r border-slate-150">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {project.techStack?.slice(0, 3).map((stack) => (
                          <span key={stack} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 border border-slate-200/50 rounded-md text-slate-500">
                            {stack}
                          </span>
                        )) || '-'}
                        {project.techStack && project.techStack.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black bg-indigo-50 border border-indigo-100 rounded-md text-indigo-600">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Budget */}
                  {visibleColumns.budget && (
                    <td className="py-4 px-4 font-bold text-slate-655 whitespace-nowrap border-r border-slate-150">
                      {project.budget || '40 hours'}
                    </td>
                  )}

                  {/* Team Members */}
                  {visibleColumns.team && (
                    <td className="py-4 px-4 border-r border-slate-150">
                      {(() => {
                        const nonAdminMembers = (project.members || []).filter((m: any) => m.role?.toLowerCase() !== 'admin');
                        return (
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {nonAdminMembers.slice(0, 4).map((m, index) => (
                              <div
                                key={index}
                                title={m.name}
                                className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-extrabold ring-2 ring-white shadow-2xs shrink-0", m.bg)}
                              >
                                {m.initials}
                              </div>
                            ))}
                            {nonAdminMembers.length > 4 && (
                              <div className="h-5.5 w-5.5 rounded-full flex items-center justify-center text-[7px] text-slate-400 font-extrabold bg-slate-50 ring-2 ring-white border border-slate-200">
                                +{nonAdminMembers.length - 4}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  )}

                  {/* Action Arrow */}
                  <td className="py-4 px-4 text-center">
                    <button
                      className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-650 shadow-3xs group-hover:border-indigo-200 group-hover:shadow-2xs transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
