'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  User,
  Plus,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Save,
  Check,
  Building,
  Briefcase,
  AlertCircle,
  Folder,
  ArrowLeft
} from 'lucide-react';
import { getManagersAction, updateManagerAssignmentsAction } from '@/actions/managers';
import { getEmployeesAction } from '@/actions/projects';
import { toast } from 'react-toastify';

interface ProjectInfo {
  id: string;
  name: string;
  status: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  projects: ProjectInfo[];
}

interface ManagerData {
  id: string;
  name: string;
  email: string;
  role: string;
  employees: TeamMember[];
  teamLeads: TeamMember[];
}

export default function ManagerAssignmentsPage() {
  const [managers, setManagers] = useState<ManagerData[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selection states
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [assignedTeamLeadIds, setAssignedTeamLeadIds] = useState<string[]>([]);

  // Search filter states
  const [managerSearch, setManagerSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [teamLeadSearch, setTeamLeadSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showTeamLeadDropdown, setShowTeamLeadDropdown] = useState(false);

  // Filtered managers for search
  const filteredManagers = useMemo(() => {
    return managers.filter(m =>
      m.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(managerSearch.toLowerCase())
    );
  }, [managers, managerSearch]);

  // Collapsed states for tree nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true
  });

  const selectedManager = useMemo(() => {
    return managers.find(m => m.id === selectedManagerId) || null;
  }, [managers, selectedManagerId]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedManager) {
      setAssignedEmployeeIds(selectedManager.employees.map(e => e.id));
      setAssignedTeamLeadIds(selectedManager.teamLeads.map(t => t.id));
    } else {
      setAssignedEmployeeIds([]);
      setAssignedTeamLeadIds([]);
    }
    setEmployeeSearch('');
    setTeamLeadSearch('');
    setShowEmployeeDropdown(false);
    setShowTeamLeadDropdown(false);
  }, [selectedManagerId, selectedManager]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [mRes, eRes] = await Promise.all([
        getManagersAction(),
        getEmployeesAction()
      ]);

      if (mRes.success && mRes.data) {
        setManagers(mRes.data);
      } else {
        const errMsg = mRes.error || 'Failed to load managers.';
        setError(errMsg);
        toast.error(errMsg);
      }

      if (eRes.success && eRes.data) {
        setAllUsers(eRes.data);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to fetch assignment details.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  // Filter available employees and team leads for dropdowns
  const availableEmployees = useMemo(() => {
    return allUsers.filter(u => {
      if (u.role?.toLowerCase() !== 'employee') return false;
      // Exclude already added in current editor session
      if (assignedEmployeeIds.includes(u.id)) return false;
      // Exclude if already assigned to another manager
      const isAssignedToOther = managers.some(m =>
        m.id !== selectedManagerId && m.employees.some(emp => emp.id === u.id)
      );
      if (isAssignedToOther) return false;
      // Search term check
      if (employeeSearch && !u.name.toLowerCase().includes(employeeSearch.toLowerCase())) return false;
      return true;
    });
  }, [allUsers, assignedEmployeeIds, employeeSearch, managers, selectedManagerId]);

  const availableTeamLeads = useMemo(() => {
    return allUsers.filter(u => {
      if (u.role?.toLowerCase() !== 'team lead') return false;
      // Exclude already added in current editor session
      if (assignedTeamLeadIds.includes(u.id)) return false;
      // Exclude if already assigned to another manager
      const isAssignedToOther = managers.some(m =>
        m.id !== selectedManagerId && m.teamLeads.some(tl => tl.id === u.id)
      );
      if (isAssignedToOther) return false;
      // Search term check
      if (teamLeadSearch && !u.name.toLowerCase().includes(teamLeadSearch.toLowerCase())) return false;
      return true;
    });
  }, [allUsers, assignedTeamLeadIds, teamLeadSearch, managers, selectedManagerId]);

  // Handle assignments save
  async function handleSave() {
    if (!selectedManagerId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await updateManagerAssignmentsAction(
        selectedManagerId,
        assignedEmployeeIds,
        assignedTeamLeadIds
      );

      if (res.success) {
        const msg = `Successfully updated assignments for ${selectedManager?.name}`;
        setSuccessMsg(msg);
        // Reload fresh data from backend
        await loadData();
      } else {
        const errMsg = res.error || 'Failed to save assignments.';
        setError(errMsg);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'An error occurred during save.';
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBgColor = (name: string) => {
    const bgColors = [
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-rose-500',
      'bg-amber-500',
      'bg-sky-500',
      'bg-blue-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  const getGradient = (name: string) => {
    const gradients = [
      'from-indigo-500 to-indigo-650',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-fuchsia-600',
      'from-rose-500 to-orange-500',
      'from-amber-500 to-yellow-600',
      'from-sky-500 to-blue-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="min-h-full bg-slate-50/50 p-4 sm:p-6 md:p-8 lg:p-10">

      {/* Top Banner */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-[#1F4D3E] px-7 py-7 md:px-9 md:py-8 shadow-md">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#F4A340]/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              <Building className="h-3 w-3" /> Administration Panel
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
              Manager Assignment Hub
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              Define the organizational reporting structure by assigning employees and team leads to managers.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Panel: Managers List */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-md shadow-slate-100/50 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-indigo-600" />
                  Managers ({managers.length})
                </h2>
              </div>

              {/* Manager Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search managers..."
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-slate-50/50 transition-all font-semibold"
                />
                {managerSearch && (
                  <button onClick={() => setManagerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-none">
                {filteredManagers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">No matching managers found.</p>
                ) : (
                  filteredManagers.map(manager => {
                    const initials = getInitials(manager.name);
                    const gradient = getGradient(manager.name);
                    const isSelected = selectedManagerId === manager.id;

                    return (
                      <div
                        key={manager.id}
                        onClick={() => setSelectedManagerId(manager.id)}
                        className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${isSelected
                            ? 'border-indigo-500 bg-indigo-50/30 shadow-xs'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/30 hover:scale-[1.01]'
                          }`}
                      >
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-2xs shrink-0 bg-gradient-to-br ${gradient}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-650 transition-colors">{manager.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{manager.email}</p>
                          <div className="flex gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-[8px] font-bold text-slate-500 shadow-3xs">
                              <Briefcase className="h-2.5 w-2.5 text-amber-500" /> Leads: {manager.teamLeads.length}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-[8px] font-bold text-slate-500 shadow-3xs">
                              <User className="h-2.5 w-2.5 text-emerald-500" /> Staff: {manager.employees.length}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-indigo-600 translate-x-0.5' : ''}`} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Editor / General Tree */}
          <div className="lg:col-span-2 space-y-4">

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200/50 px-4 py-3.5 text-xs font-bold text-red-700 shadow-3xs">
                <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/50 px-4 py-3.5 text-xs font-bold text-emerald-700 shadow-3xs">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                {successMsg}
              </div>
            )}

            {selectedManagerId ? (
              /* Editor Mode */
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md shadow-slate-100/50 space-y-6">

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedManagerId(null)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-3xs hover:border-slate-300"
                      title="Back to Overview"
                    >
                      <ArrowLeft className="h-4 w-4 text-slate-500" />
                    </button>
                    <div>
                      <h2 className="text-sm font-black text-slate-800">
                        Assignments for {selectedManager?.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Assign reporting personnel under this manager</p>
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
                      <span className="text-xs text-slate-450 italic">No team leads assigned yet.</span>
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
                              className="text-indigo-400 hover:text-indigo-600 rounded-full focus:outline-none transition-colors"
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
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-400"
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
                      <span className="text-xs text-slate-450 italic">No employees assigned yet.</span>
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
                              className="text-emerald-400 hover:text-emerald-600 rounded-full focus:outline-none transition-colors"
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
                          placeholder="Search Employees to add..."
                          value={employeeSearch}
                          onFocus={() => setShowEmployeeDropdown(true)}
                          onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-400"
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
                              className="flex items-center gap-2.5 p-3 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors border-b border-slate-50/50 last:border-b-0"
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
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black bg-gradient-to-br ${getGradient(selectedManager!.name)}`}>
                        {getInitials(selectedManager!.name)}
                      </div>
                      <div className="flex flex-col">
                        <span>{selectedManager!.name}</span>
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
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
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
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
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
                        <p className="text-xs text-slate-400 italic">No assigned personnel preview.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Overview Hierarchy Tree Mode */
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md shadow-slate-100/50 space-y-6">
                <div>
                  <h2 className="text-sm font-black text-slate-800 tracking-tight">
                    Organizational Team Hierarchy
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Visual visual reporting lines of all manager assignments and active projects</p>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-150">

                  {/* Root Node */}
                  <div>
                    <button
                      onClick={() => toggleNode('root')}
                      className="flex items-center gap-2.5 w-full text-left font-black text-slate-800 text-sm hover:text-indigo-650 transition-colors p-2 hover:bg-slate-50 rounded-xl"
                    >
                      <div className="p-0.5 bg-indigo-55 border border-indigo-150/40 rounded text-indigo-650">
                        {expandedNodes['root'] ? <ChevronDown className="h-4 w-4 transition-transform duration-200" /> : <ChevronRight className="h-4 w-4 transition-transform duration-200" />}
                      </div>
                      <Building className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                      <span>Corporate Hierarchy root</span>
                    </button>

                    {expandedNodes['root'] && (
                      <div className="pl-6 border-l-2 border-dashed border-indigo-100 mt-4 space-y-6 pt-1">

                        {managers.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No manager assignments configured yet.</p>
                        ) : (
                          managers.map(manager => {
                            const nodeKey = `m-${manager.id}`;
                            const isExpanded = expandedNodes[nodeKey];

                            return (
                              <div key={manager.id} className="space-y-3 relative group/mBranch">

                                {/* Connector Dot */}
                                <div className="absolute -left-[30px] top-4 w-2 h-2 rounded-full bg-indigo-200 border-2 border-white ring-1 ring-indigo-50" />

                                {/* Manager Node */}
                                <div className="flex items-center justify-between group/mNode w-full py-1">
                                  <button
                                    onClick={() => toggleNode(nodeKey)}
                                    className="flex items-center gap-2.5 text-left font-bold text-slate-800 text-xs hover:text-indigo-600 transition-colors"
                                  >
                                    <div className="p-0.5 hover:bg-slate-100 rounded text-slate-500">
                                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                    </div>
                                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-2xs shrink-0 bg-gradient-to-br ${getGradient(manager.name)}`}>
                                      {getInitials(manager.name)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-850">{manager.name}</span>
                                      <span className="text-[9px] text-slate-400 font-semibold">{manager.email}</span>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-150/40 px-2 py-0.5 text-[9px] font-bold text-indigo-600">
                                      {manager.teamLeads.length + manager.employees.length} scoped members
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedManagerId(manager.id)}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-750 bg-indigo-50 hover:bg-indigo-100/60 px-3 py-1 rounded-xl transition-all border border-indigo-100 opacity-0 group-hover/mNode:opacity-100 cursor-pointer shadow-3xs"
                                  >
                                    Edit Team
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="pl-6 border-l-2 border-slate-100 mt-2 space-y-4 pt-1 ml-4 relative">

                                    {/* Team Leads section under this manager */}
                                    {manager.teamLeads.length > 0 && (
                                      <div className="space-y-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Team Leads</p>
                                        <div className="space-y-2.5">
                                          {manager.teamLeads.map(tl => (
                                            <div key={tl.id} className="group/item relative flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-150 shadow-3xs hover:border-slate-350 hover:shadow-2xs transition-all">
                                              <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-3xs shrink-0 ${getBgColor(tl.name)}`}>
                                                  {getInitials(tl.name)}
                                                </div>
                                                <div>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-800">{tl.name}</span>
                                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                                      <Briefcase className="h-2.5 w-2.5" /> Team Lead
                                                    </span>
                                                  </div>
                                                  <p className="text-[10px] text-slate-400 font-semibold">{tl.email}</p>
                                                </div>
                                              </div>
                                              {/* Projects list */}
                                              {tl.projects.length > 0 ? (
                                                <div className="flex items-center gap-1.5">
                                                  {tl.projects.slice(0, 2).map(p => (
                                                    <span key={p.id} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-500 shadow-3xs">
                                                      <Folder className="h-2.5 w-2.5 text-indigo-500" />
                                                      {p.name}
                                                    </span>
                                                  ))}
                                                  {tl.projects.length > 2 && (
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">+{tl.projects.length - 2}</span>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="text-[9px] text-slate-450 italic pl-1.5">No assigned projects</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Employees section under this manager */}
                                    {manager.employees.length > 0 && (
                                      <div className="space-y-3 pt-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Employees</p>
                                        <div className="space-y-2.5">
                                          {manager.employees.map(emp => (
                                            <div key={emp.id} className="group/item relative flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-150 shadow-3xs hover:border-slate-350 hover:shadow-2xs transition-all">
                                              <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-3xs shrink-0 ${getBgColor(emp.name)}`}>
                                                  {getInitials(emp.name)}
                                                </div>
                                                <div>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-800">{emp.name}</span>
                                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                                      <User className="h-2.5 w-2.5" /> Employee
                                                    </span>
                                                  </div>
                                                  <p className="text-[10px] text-slate-400 font-semibold">{emp.email}</p>
                                                </div>
                                              </div>
                                              {/* Projects list */}
                                              {emp.projects.length > 0 ? (
                                                <div className="flex items-center gap-1.5">
                                                  {emp.projects.slice(0, 2).map(p => (
                                                    <span key={p.id} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-500 shadow-3xs">
                                                      <Folder className="h-2.5 w-2.5 text-indigo-500" />
                                                      {p.name}
                                                    </span>
                                                  ))}
                                                  {emp.projects.length > 2 && (
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">+{emp.projects.length - 2}</span>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="text-[9px] text-slate-455 italic pl-1.5">No assigned projects</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {manager.teamLeads.length === 0 && manager.employees.length === 0 && (
                                      <p className="text-xs text-slate-400 italic py-2 text-center bg-white rounded-2xl border border-slate-150 p-4">No team leads or employees assigned to this manager.</p>
                                    )}
                                  </div>
                                )}

                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
