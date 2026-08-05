import Link from 'next/link';
import { Calendar, MessageSquare, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, ProjectsListGridProps } from '@/types/projects.types';

export function ProjectsListGrid({
  filteredProjects,
  canDeleteProject,
  onDeleteProject,
  getStatusStyles,
  getPriorityStyles,
  formatDate,
}: ProjectsListGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="group flex flex-col justify-between bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-lg hover:border-slate-350 transition-all duration-350 p-6 relative overflow-hidden"
        >
          {/* Corner decoration gradient */}
          <span className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div>
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border", getStatusStyles(project.status))}>
                  {project.status}
                </span>
                {project.priority && (
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border", getPriorityStyles(project.priority))}>
                    {project.priority}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(project.dueDate)}</span>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-base font-black text-slate-800 tracking-tight group-hover:text-indigo-650 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-slate-450 font-medium leading-relaxed mt-2 mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-slate-50 text-slate-500 border border-slate-200/60 px-2 py-0.5 text-[9px] font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-indigo-50/50 text-indigo-700 border border-indigo-150/30 px-2 py-0.5 text-[9px] font-bold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress & Footer Section */}
          <div className="border-t border-slate-100 pt-4 mt-auto">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
              <span>Task Progress</span>
              <span>
                {project.completedTasks}/{project.tasksCount} ({project.progress}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4 relative">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  project.status === 'Completed'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : project.status === 'In Review'
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                    : 'bg-indigo-650 shadow-[0_0_8px_rgba(79,70,229,0.3)]'
                )}
                style={{ width: `${project.progress}%` }}
              />
            </div>

            {/* Footer stack */}
            <div className="flex items-center justify-between">
              {/* Avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {project.members.filter((m: any) => {
                  const r = m.role?.toLowerCase();
                  if (r === 'admin') return false;
                  const nameLower = (m.name || '').toLowerCase();
                  if (nameLower.includes('admin')) return false;
                  return true;
                }).map((member, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-xl text-[9px] font-extrabold text-white ring-2 ring-white shadow-xs shrink-0",
                      member.bg
                    )}
                    title={member.name}
                  >
                    {member.initials}
                  </div>
                ))}
              </div>

              {/* Actions & Stats */}
              <div className="flex items-center gap-3.5 text-slate-400">
                <div className="flex items-center gap-1.2 text-[10px] font-bold" title="Comments">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{project.commentsCount}</span>
                </div>
                <div className="flex items-center gap-1.2 text-[10px] font-bold" title="Attachments">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{project.attachmentsCount}</span>
                </div>
                
                {canDeleteProject && (
                  <button 
                    onClick={(e) => onDeleteProject(project.id, e)}
                    className="text-slate-404 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-1"
                    title="Delete Project"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
