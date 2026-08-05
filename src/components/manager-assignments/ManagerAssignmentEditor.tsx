import { ArrowLeft, Save, X, Search, Plus, Briefcase, User, Folder } from 'lucide-react';
import type { ManagerAssignmentEditorProps } from '@/types/manager-assignments.types';

export function ManagerAssignmentEditor({
  selectedManager,
  saving,
  assignedTeamLeadIds,
  setAssignedTeamLeadIds,
  assignedEmployeeIds,
  setAssignedEmployeeIds,
  teamLeadSearch,
  setTeamLeadSearch,
  employeeSearch,
  setEmployeeSearch,
  showTeamLeadDropdown,
  setShowTeamLeadDropdown,
  showEmployeeDropdown,
  setShowEmployeeDropdown,
  availableTeamLeads,
  availableEmployees,
  allUsers,
  managers,
  selectedManagerId,
  handleSave,
  setSelectedManagerId,
  getInitials,
  getGradient,
  getBgColor,
}: ManagerAssignmentEditorProps) {
  if (!selectedManager) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md shadow-slate-100/50 space-y-6 animate-scaleIn">

      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedManagerId(null)}
            className="p-2 rounded-xl border border-slate-205 hover:bg-slate-50 transition-colors shadow-3xs hover:border-slate-300 cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-808">
              Assignments for {selectedManager.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Assign reporting personnel under this manager</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>

      {/* Team Leads Assignment */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Assigned Team Leads ({assignedTeamLeadIds.length})
        </label>

        {/* Selected Team Leads tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {assignedTeamLeadIds.length === 0 ? (
            <span className="text-xs text-slate-450 italic font-medium">No team leads assigned yet.</span>
          ) : (
            assignedTeamLeadIds.map(id => {
              const user = allUsers.find(u => u.id === id);
              if (!user) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50/50 border border-indigo-150/40 text-indigo-700 text-xs font-bold shadow-3xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {user.name}
                  <button
                    type="button"
                    onClick={() => setAssignedTeamLeadIds(prev => prev.filter(tid => tid !== id))}
                    className="text-indigo-400 hover:text-indigo-600 rounded-full focus:outline-none transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Dropdown search select */}
        <div className="relative pt-2">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Team Leads to add..."
                value={teamLeadSearch}
                onFocus={() => setShowTeamLeadDropdown(true)}
                onBlur={() => setTimeout(() => setShowTeamLeadDropdown(false), 200)}
                onChange={(e) => setTeamLeadSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-400 font-semibold"
              />
            </div>
          </div>
          {showTeamLeadDropdown && (
            <div className="absolute z-20 left-0 mt-1.5 max-w-md w-full max-h-48 overflow-y-auto bg-white border border-slate-200/80 rounded-2xl shadow-lg no-scrollbar">
              {availableTeamLeads.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 text-center">No matching team leads available</p>
              ) : (
                availableTeamLeads.map(tl => (
                  <div
                    key={tl.id}
                    onMouseDown={() => {
                      setAssignedTeamLeadIds(prev => [...prev, tl.id]);
                      setTeamLeadSearch('');
                    }}
                    className="flex items-center gap-2.5 p-3 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors border-b border-slate-50/50 last:border-b-0"
                  >
                    <Plus className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>{tl.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold ml-auto">{tl.email}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Employees Assignment */}
      <div className="space-y-3 pt-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Assigned Employees ({assignedEmployeeIds.length})
        </label>

        {/* Selected Employees tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {assignedEmployeeIds.length === 0 ? (
            <span className="text-xs text-slate-455 italic font-medium">No employees assigned yet.</span>
          ) : (
            assignedEmployeeIds.map(id => {
              const user = allUsers.find(u => u.id === id);
              if (!user) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/40 border border-emerald-150/40 text-emerald-700 text-xs font-bold shadow-3xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {user.name}
                  <button
                    type="button"
                    onClick={() => setAssignedEmployeeIds(prev => prev.filter(eid => eid !== id))}
                    className="text-emerald-400 hover:text-emerald-600 rounded-full focus:outline-none transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Dropdown search select */}
        <div className="relative pt-2">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-405" />
              <input
                type="text"
                placeholder="Search Employees to add..."
                value={employeeSearch}
                onFocus={() => setShowEmployeeDropdown(true)}
                onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-400 font-semibold"
              />
            </div>
          </div>
          {showEmployeeDropdown && (
            <div className="absolute z-20 left-0 mt-1.5 max-w-md w-full max-h-48 overflow-y-auto bg-white border border-slate-200/80 rounded-2xl shadow-lg no-scrollbar">
              {availableEmployees.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 text-center">No matching employees available</p>
              ) : (
                availableEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onMouseDown={() => {
                      setAssignedEmployeeIds(prev => [...prev, emp.id]);
                      setEmployeeSearch('');
                    }}
                    className="flex items-center gap-2.5 p-3 hover:bg-slate-55 cursor-pointer text-xs font-bold text-slate-700 transition-colors border-b border-slate-50/50 last:border-b-0"
                  >
                    <Plus className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>{emp.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold ml-auto">{emp.email}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Local Preview of this manager's hierarchy tree */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h3 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
          Hierarchy Tree Preview
        </h3>

        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60 shadow-3xs">
          <div className="flex items-center gap-3 font-bold text-slate-800 text-xs">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black bg-gradient-to-br ${getGradient(selectedManager.name)}`}>
              {getInitials(selectedManager.name)}
            </div>
            <div className="flex flex-col">
              <span>{selectedManager.name}</span>
              <span className="text-[9px] text-slate-400 font-medium">Manager</span>
            </div>
          </div>

          <div className="pl-6 border-l-2 border-dashed border-slate-200 mt-4 space-y-4 pt-1">

            {/* Team Leads */}
            {assignedTeamLeadIds.map(id => {
              const user = allUsers.find(u => u.id === id);
              if (!user) return null;
              const managerItem = managers.find(m => m.id === selectedManagerId);
              const projects = managerItem?.teamLeads.find(t => t.id === id)?.projects || [];
              return (
                <div key={id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                    <Briefcase className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{user.name}</span>
                    <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 text-[8px] font-bold">Team Lead</span>
                  </div>
                  {projects.length > 0 && (
                    <div className="pl-6 flex flex-wrap gap-1">
                      {projects.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-500 shadow-3xs">
                          <Folder className="h-2.5 w-2.5 text-indigo-500" />
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Employees */}
            {assignedEmployeeIds.map(id => {
              const user = allUsers.find(u => u.id === id);
              if (!user) return null;
              const managerItem = managers.find(m => m.id === selectedManagerId);
              const projects = managerItem?.employees.find(e => e.id === id)?.projects || [];
              return (
                <div key={id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-705">
                    <User className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{user.name}</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 text-[8px] font-bold">Employee</span>
                  </div>
                  {projects.length > 0 && (
                    <div className="pl-6 flex flex-wrap gap-1">
                      {projects.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-500 shadow-3xs">
                          <Folder className="h-2.5 w-2.5 text-indigo-500" />
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {assignedTeamLeadIds.length === 0 && assignedEmployeeIds.length === 0 && (
              <p className="text-xs text-slate-400 italic font-semibold">No assigned personnel preview.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
