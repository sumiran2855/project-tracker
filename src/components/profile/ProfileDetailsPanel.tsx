import { User, Mail, Shield, Code, Sparkles } from 'lucide-react';
import type { ProfileDetailsPanelProps } from '@/types/profile.types';

export function ProfileDetailsPanel({ profile }: ProfileDetailsPanelProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Profile Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="h-4.5 w-4.5 text-indigo-700 dark:text-indigo-400" />
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Primary Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
            <span className="text-slate-800 dark:text-slate-200 break-all flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-550 shrink-0" />
              {profile.email}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">System Access Role</span>
            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-400 dark:text-slate-550 shrink-0" />
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Skill Tag list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Code className="h-4.5 w-4.5 text-indigo-700 dark:text-indigo-400" />
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Skills & Competencies</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.skills.length === 0 ? (
            <span className="text-xs text-slate-400 dark:text-slate-505 font-bold">No skills added yet.</span>
          ) : (
            profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 shadow-3xs"
              >
                <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                {skill}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
