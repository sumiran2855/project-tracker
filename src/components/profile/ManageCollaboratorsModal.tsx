import { X, Users, Plus, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManageCollaboratorsModalProps, bgOptions } from '@/types/profile.types';

export function ManageCollaboratorsModal({
  isOpen,
  onClose,
  userEmail,
  systemEmployees,
  selectedColleagueId,
  setSelectedColleagueId,
  newCollabRole,
  setNewCollabName,
  setNewCollabRole,
  newCollabBg,
  setNewCollabBg,
  isAddingColleague,
  collabs,
  onAddCollaborator,
  onDeleteCollab,
}: ManageCollaboratorsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650">
              <Users className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800">Manage Collaborators</h3>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List & Add Forms */}
        <div className="space-y-6">

          {/* Add form */}
          <form onSubmit={onAddCollaborator} className="space-y-4">
            <div className="text-xs font-black text-indigo-650 uppercase tracking-widest border-b border-slate-100 pb-1">
              Add Collaborator
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Colleague Name</label>
                <select
                  required
                  value={selectedColleagueId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedColleagueId(id);
                    const emp = systemEmployees.find(emp => emp.id === id);
                    if (emp) {
                      setNewCollabName(emp.name);
                      setNewCollabRole(emp.role);
                      setNewCollabBg(emp.bg || 'bg-indigo-500');
                    } else {
                      setNewCollabName('');
                      setNewCollabRole('');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select Colleague --</option>
                  {systemEmployees
                    .filter(emp => emp.email.toLowerCase() !== userEmail?.toLowerCase() && ['employee', 'team lead', 'manager', 'client'].includes(emp.role.toLowerCase()))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Role / Title</label>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Role will be auto-filled"
                  value={newCollabRole}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Avatar Accent color</label>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {bgOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCollabBg(color)}
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110",
                        color
                      )}
                    >
                      {newCollabBg === color && (
                        <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAddingColleague}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4 py-2 text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
              >
                {isAddingColleague ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Colleague</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Current List inside modal to easily view and delete */}
          <div className="space-y-3.5 pt-4 border-t border-slate-100">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Current Directory ({collabs.length})
            </div>

            <div className="max-h-[160px] overflow-y-auto space-y-2.5 pr-1">
              {collabs.map((c) => (
                <div key={c.email || c.name} className="flex items-center justify-between border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn("h-7 w-7 rounded-lg text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-3xs", c.bg)}>
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 leading-tight truncate">{c.name}</p>
                        {c.status === 'Pending' ? (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                            Pending
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{c.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteCollab(c.name)}
                    className="text-slate-404 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
