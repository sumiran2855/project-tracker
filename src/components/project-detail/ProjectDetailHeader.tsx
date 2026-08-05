import { ArrowLeft, ChevronDown, Pencil, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectDetailHeaderProps } from '@/types/projects.types';

export function ProjectDetailHeader({
  project,
  isEmployee,
  onBackToHub,
  onUpdateStatus,
  onEditDetailsClick,
  getProjectStatusBadge,
}: ProjectDetailHeaderProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
      
      {/* Decorative corner */}
      <span className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/3 pointer-events-none" />

      <div className="flex flex-col gap-6 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="space-y-3 flex-1">
            {/* Back Button */}
            <button 
              onClick={onBackToHub}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-505 hover:text-indigo-650 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Hub</span>
            </button>

            {/* Title & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{project.name}</h1>
              
              <div className="relative group shrink-0">
                <select 
                  value={project.status}
                  disabled={isEmployee}
                  onChange={(e) => onUpdateStatus(e.target.value)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/25 appearance-none pr-7 border shadow-xs transition-all", 
                    getProjectStatusBadge(project.status),
                    isEmployee ? "cursor-default opacity-85 pointer-events-none" : "cursor-pointer"
                  )}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
                {!isEmployee && <ChevronDown className="h-3 w-3 absolute right-2 top-1.5 text-slate-400 pointer-events-none" />}
              </div>

              {!isEmployee && (
                <button
                  onClick={onEditDetailsClick}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-55 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 transition-all cursor-pointer shadow-3xs hover:border-slate-300"
                >
                  <Pencil className="h-3 w-3 text-indigo-505" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">{project.description}</p>
            
            {/* Tags & Due date */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-slate-650">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <Calendar className="h-4 w-4 text-indigo-505" />
                <span>Due Date:</span>
                <span className="text-slate-700">{project.dueDate}</span>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map(tag => (
                      <span key={tag} className="rounded-lg bg-slate-50 border border-slate-200/50 text-slate-505 px-2 py-0.5 text-[9px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map(tech => (
                      <span key={tech} className="rounded-lg bg-indigo-50/50 border border-indigo-150/30 text-indigo-750 px-2 py-0.5 text-[9px] font-bold">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
