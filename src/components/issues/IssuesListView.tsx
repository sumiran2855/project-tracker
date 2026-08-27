import { AlertCircle, Trash2, Folder, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue, IssuesListViewProps } from '@/types/issues.types';
import { getPriorityColor, getTypeStyle } from './IssuesBoardView';


export function IssuesListView({
  filteredIssues,
  canDeleteIssue,
  handleToggleStatus,
  handleCardClick,
  handleDeleteIssue,
}: IssuesListViewProps) {
  return (
    <div className="space-y-3">
      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-slate-300" />
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No issues found. Try widening filters or create a new issue.</p>
        </div>
      ) : (
        filteredIssues.map(issue => {
          const priorityAccent: Record<string, string> = {
            Critical: '#ef4444', High: '#f97316', Medium: '#6366f1', Low: '#94a3b8'
          };
          const accent = priorityAccent[issue.priority] ?? '#94a3b8';

          return (
            <div
              key={issue.id}
              onClick={() => handleCardClick(issue)}
              className="group relative flex flex-col md:grid md:grid-cols-[1.5fr_180px_100px_100px_100px_96px_40px] md:items-center gap-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 cursor-pointer transition-all duration-200 hover:-translate-y-px overflow-hidden animate-fadeIn"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 14px -4px ${accent}22`}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.04)'}
            >
              {/* Left accent stripe */}
              <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />

              {/* Mobile Card Layout */}
              <div className="flex flex-col gap-2.5 md:hidden w-full pl-2">
                {/* Header row: Checkbox, Title, Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={e => handleToggleStatus(issue, e)}
                      className={cn(
                        'mt-0.5 h-4.5 w-4.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer',
                        issue.status === 'Resolved' || issue.status === 'Closed'
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
                      )}
                    >
                      {(issue.status === 'Resolved' || issue.status === 'Closed') && <span className="text-[8px] font-black">✓</span>}
                    </button>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-xs font-bold text-slate-800 transition-colors break-words',
                        (issue.status === 'Resolved' || issue.status === 'Closed') && 'line-through text-slate-400 dark:text-slate-500'
                      )}>
                        {issue.title}
                      </p>
                    </div>
                  </div>
                  {canDeleteIssue && (
                    <button
                      onClick={e => handleDeleteIssue(issue.id, e)}
                      className="text-slate-400 dark:text-slate-500 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Delete Issue"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Description */}
                {issue.description && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pl-7 leading-normal line-clamp-2">
                    {issue.description}
                  </p>
                )}

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-1.5 pl-7 pt-1">
                  {/* Project tag */}
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 rounded-lg px-2 py-0.5 max-w-[120px]">
                    <Folder className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{issue.projectName}</span>
                  </span>

                  {/* Related Task Tag */}
                  {issue.relatedTaskTitle && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 max-w-[120px]" title={`Related Task: ${issue.relatedTaskTitle}`}>
                      <Bookmark className="h-2.5 w-2.5 shrink-0 text-slate-500" />
                      <span className="truncate">{issue.relatedTaskTitle}</span>
                    </span>
                  )}

                  {/* Status */}
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border',
                    issue.status === 'Resolved' || issue.status === 'Closed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30' :
                      issue.status === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30' :
                        'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800'
                  )}>
                    <span className="h-1.2 w-1.2 rounded-full bg-current" />
                    {issue.status}
                  </span>

                  {/* Priority */}
                  <span className={cn('inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border', getPriorityColor(issue.priority))}>
                    {issue.priority}
                  </span>

                  {/* Type Tag */}
                  <span className={cn('inline-flex rounded-lg px-2 py-0.5 text-[9px] font-bold border', getTypeStyle(issue.type))}>
                    {issue.type}
                  </span>

                  {/* Assignees */}
                  {issue.assignees && issue.assignees.length > 0 && (
                    <div className="flex -space-x-1 ml-auto shrink-0">
                      {issue.assignees.map((a, idx) => (
                        <div key={idx} title={a.name}
                          className={cn('h-5.5 w-5.5 rounded-lg text-[6px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-950 shrink-0 shadow-3xs', a.bg)}
                        >
                          {a.initials}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop View Row */}
              <div className="hidden md:contents">
                {/* Title & description */}
                <div className="flex items-start gap-3 min-w-0 pl-2">
                  <button
                    onClick={e => handleToggleStatus(issue, e)}
                    className={cn(
                      'mt-0.5 h-4.5 w-4.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer',
                      issue.status === 'Resolved' || issue.status === 'Closed'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
                    )}
                  >
                    {(issue.status === 'Resolved' || issue.status === 'Closed') && <span className="text-[8px] font-black">✓</span>}
                  </button>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate',
                      (issue.status === 'Resolved' || issue.status === 'Closed') && 'line-through text-slate-400 dark:text-slate-500'
                    )}>
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 min-w-0">
                      {issue.description ? (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-normal max-w-lg">
                          {issue.description}
                        </p>
                      ) : (
                        <span className="h-1" />
                      )}
                      {issue.relatedTaskTitle && (
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.2 shrink-0" title={`Related Task: ${issue.relatedTaskTitle}`}>
                          <Bookmark className="h-2 w-2 shrink-0 text-slate-500" />
                          <span className="truncate max-w-[100px]">{issue.relatedTaskTitle}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project */}
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {issue.projectName}
                </span>

                {/* Status */}
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold border w-fit',
                  issue.status === 'Resolved' || issue.status === 'Closed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30' :
                    issue.status === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30' :
                      'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800'
                )}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {issue.status}
                </span>

                {/* Priority */}
                <span className={cn('inline-flex rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider border w-fit', getPriorityColor(issue.priority))}>
                  {issue.priority}
                </span>

                {/* Type Tag */}
                <span className={cn('inline-flex rounded-lg px-2 py-1 text-[9px] font-bold border w-fit', getTypeStyle(issue.type))}>
                  {issue.type}
                </span>

                {/* Assignees */}
                <div className="flex -space-x-1.5">
                  {issue.assignees.map((a, idx) => (
                    <div key={idx} title={a.name}
                      className={cn('h-6 w-6 rounded-lg text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-950 shrink-0', a.bg)}
                    >
                      {a.initials}
                    </div>
                  ))}
                </div>

                {/* Delete */}
                {canDeleteIssue && (
                  <button
                    onClick={e => handleDeleteIssue(issue.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                    title="Delete Issue"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
