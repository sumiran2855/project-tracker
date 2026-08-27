import { X, Sliders, Check } from 'lucide-react';
import type { EditProfileModalProps } from '@/types/profile.types';

export function EditProfileModal({
  isOpen,
  onClose,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editRole,
  setEditRole,
  editLocation,
  setEditLocation,
  editDepartment,
  setEditDepartment,
  editSkills,
  newSkillText,
  setNewSkillText,
  onAddSkill,
  onRemoveSkill,
  onSave,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
              <Sliders className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Edit Profile & Directory</h3>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable container for forms */}
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6">

          {/* Primary Info Form */}
          <form onSubmit={onSave} className="space-y-4">
            <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1">
              Primary Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Role / Title</label>
                <input
                  type="text"
                  required
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department</label>
                <input
                  type="text"
                  required
                  value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Skills tags field */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Skills (Press Enter to add)</label>
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-300 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 p-2 min-h-12 items-center">
                {editSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 shadow-3xs">
                    {s}
                    <button type="button" onClick={() => onRemoveSkill(s)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type & Enter..."
                  value={newSkillText}
                  onChange={e => setNewSkillText(e.target.value)}
                  onKeyDown={onAddSkill}
                  className="bg-transparent border-none text-xs outline-none text-slate-800 dark:text-slate-200 ml-1 flex-1 min-w-[80px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>Save Profile & Skills</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer buttons to close modal */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all cursor-pointer"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
}
