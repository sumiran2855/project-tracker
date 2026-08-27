import { Check, AlertCircle, Loader2, Save } from 'lucide-react';
import type { ProfileSectionProps } from '@/types/settings.types';

export function ProfileSection({
  user,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  isSavingProfile,
  profileSaveSuccess,
  profileSaveError,
  handleSaveProfile,
}: ProfileSectionProps) {
  const initials = (profileName || user?.name || '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <form onSubmit={handleSaveProfile} className="space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">User Profile Details</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Manage your identity credentials across pages.</p>
      </div>

      {/* Avatar + info banner */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/30">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-base font-black">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{profileName || user?.name}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Display Name</label>
          <input
            type="text"
            required
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Role / Designation</label>
          <input
            type="text"
            readOnly
            value={user?.role || ''}
            title="Change your role from the Testing Role Switcher tab"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 focus:outline-none cursor-not-allowed"
          />
          <p className="text-[9px] text-slate-400 dark:text-slate-500">Role is managed from the <span className="font-bold">Testing Role Switcher</span> tab.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</label>
        <input
          type="email"
          required
          value={profileEmail}
          onChange={e => setProfileEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Profile section footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          {profileSaveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-xl">
              <Check className="h-3.5 w-3.5 stroke-[3px]" />
              Profile saved!
            </span>
          )}
          {profileSaveError && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-xl">
              <AlertCircle className="h-3.5 w-3.5" />
              {profileSaveError}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSavingProfile}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-w-[130px]"
        >
          {isSavingProfile ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Saving...</span></>
          ) : (
            <><Save className="h-4.5 w-4.5" /><span>Save Changes</span></>
          )}
        </button>
      </div>
    </form>
  );
}
