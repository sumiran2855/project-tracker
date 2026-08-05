import { Plus, Clock, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, IssuesBoardViewProps } from '@/types/issues.types';


export function getPriorityColor(prio: Issue['priority']) {
  switch (prio) {
    case 'Critical': return 'bg-red-50 text-red-700 border-red-200/50';
    case 'High': return 'bg-orange-50 text-orange-700 border-orange-200/50';
    case 'Medium': return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    default: return 'bg-slate-50 text-slate-600 border-slate-200/50';
  }
}

export function getTypeStyle(type: Issue['type']) {
  switch (type) {
    case 'Bug': return 'bg-red-100 text-red-800 border-red-200';
    case 'Security': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Improvement': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function IssuesBoardView({
  filteredIssues,
  isClient,
  handleDragStart,
  handleDrop,
  handleCardClick,
  setModalStatus,
  setIsModalOpen,
}: IssuesBoardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {(['Open', 'In Progress', 'Resolved', 'Closed'] as Issue['status'][]).map(status => {
        const colIssues = filteredIssues.filter(i => i.status === status);
        return (
          <div 
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-4.5 flex flex-col min-h-[350px] shadow-2xs"
          >
            {/* Col Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  status === 'Open' ? 'bg-slate-450' :
                  status === 'In Progress' ? 'bg-indigo-500' :
                  status === 'Resolved' ? 'bg-emerald-500' : 'bg-blue-500'
                )} />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{status}</span>
                <span className="rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 shadow-2xs">
                  {colIssues.length}
                </span>
              </div>

              <button 
                onClick={() => {
                  setModalStatus(status);
                  setIsModalOpen(true);
                }}
                className="text-slate-405 hover:text-indigo-650 p-1 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Issues List */}
            <div className="space-y-3.5 flex-1 pr-1.5">
              {colIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 rounded-2xl text-slate-350 text-[10px] font-bold text-center h-28 select-none">
                  Drop Issues Here
                </div>
              ) : (
                colIssues.map(issue => {
                  const priorityAccent: Record<string, string> = {
                    Critical: '#ef4444', High: '#f97316', Medium: '#6366f1', Low: '#94a3b8'
                  };
                  const accent = priorityAccent[issue.priority] ?? '#94a3b8';
                  return (
                    <div
                      key={issue.id}
                      draggable={!isClient}
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      onClick={() => handleCardClick(issue)}
                      className={cn(
                        "group flex flex-col justify-between bg-white border border-slate-200/85 hover:border-slate-350 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all duration-200 relative overflow-hidden",
                        isClient ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      {/* Left accent stripe */}
                      <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />
                      
                      <div className="space-y-3.5 pl-1.5">
                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <span className={cn("rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border", getPriorityColor(issue.priority))}>
                            {issue.priority}
                          </span>
                          <span className="text-[8px] text-indigo-500 font-extrabold uppercase tracking-widest max-w-[120px] truncate" title={issue.projectName}>
                            {issue.projectName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                          {issue.title}
                        </h4>

                        {/* Description snippet */}
                        {issue.description && (
                          <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed mt-1.5 font-medium">
                            {issue.description}
                          </p>
                        )}
                        
                        {/* Type & Related Task */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className={cn('inline-flex rounded px-1.5 py-0.2 text-[8px] font-black uppercase border', getTypeStyle(issue.type))}>
                            {issue.type}
                          </span>
                          {issue.relatedTaskTitle && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.2 shrink-0" title={`Related Task: ${issue.relatedTaskTitle}`}>
                              <Bookmark className="h-2 w-2 shrink-0 text-slate-500" />
                              <span className="truncate max-w-[100px]">{issue.relatedTaskTitle}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between pl-1.5">
                        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {issue.dueDate}
                          </span>
                        </div>

                        <div className="flex -space-x-1 overflow-hidden">
                          {issue.assignees && issue.assignees.map((assignee, idx) => (
                            <div key={idx} className={cn("h-5.5 w-5.5 rounded-md text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white shadow-3xs shrink-0", assignee.bg || 'bg-indigo-500')} title={assignee.name}>
                              {assignee.initials || assignee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
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
