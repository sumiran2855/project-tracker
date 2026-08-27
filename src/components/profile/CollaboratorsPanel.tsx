import { Users, Plus, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CollaboratorsPanelProps } from '@/types/profile.types';

export function CollaboratorsPanel({
  collabs,
  isAdmin,
  lastLogin,
  onManageClick,
  onDeleteCollab,
  onCopyInviteLink,
}: CollaboratorsPanelProps) {
  const activeCollabs = collabs.filter(c => c.status === 'Accepted');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-700 dark:text-indigo-400" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Frequent Collaborators</h2>
          </div>
          <button
            onClick={onManageClick}
            className="h-6.5 w-6.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/35 flex items-center justify-center text-indigo-700 dark:text-indigo-400 cursor-pointer transition-colors border border-indigo-100/40 dark:border-indigo-900/30"
            title="Manage Collaborators"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          {activeCollabs.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No collaborators listed.</p>
          ) : (
            activeCollabs.map((c) => (
              <div key={c.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("h-8 w-8 rounded-xl text-xs font-black text-white flex items-center justify-center shrink-0 shadow-2xs", c.bg)}>
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{c.name}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">{c.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteCollab(c.name)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-all p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {isAdmin && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
            <button
              onClick={onCopyInviteLink}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/35 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 py-2.5 text-xs font-bold transition-all cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Copy Client Invite Link</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs text-center space-y-2">
        <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto" />
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Recent Login Details</p>
        {lastLogin ? (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
            Last Login: {new Date(lastLogin).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 dark:text-slate-500">First Session (Active)</p>
        )}
      </div>
    </div>
  );
}
