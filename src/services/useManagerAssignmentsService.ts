import { useState, useEffect, useMemo } from 'react';
import { getManagersAction, updateManagerAssignmentsAction } from '@/actions/managers';
import { getEmployeesAction } from '@/actions/projects';
import { toast } from 'react-toastify';
import type { ManagerData } from '@/types/manager-assignments.types';

export function useManagerAssignmentsService() {
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

  // Filtered managers for search
  const filteredManagers = useMemo(() => {
    return managers.filter(m =>
      m.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(managerSearch.toLowerCase())
    );
  }, [managers, managerSearch]);

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

  return {
    managers,
    allUsers,
    loading,
    saving,
    error,
    successMsg,
    selectedManagerId,
    setSelectedManagerId,
    assignedEmployeeIds,
    setAssignedEmployeeIds,
    assignedTeamLeadIds,
    setAssignedTeamLeadIds,
    managerSearch,
    setManagerSearch,
    employeeSearch,
    setEmployeeSearch,
    teamLeadSearch,
    setTeamLeadSearch,
    showEmployeeDropdown,
    setShowEmployeeDropdown,
    showTeamLeadDropdown,
    setShowTeamLeadDropdown,
    expandedNodes,
    toggleNode,
    selectedManager,
    filteredManagers,
    availableEmployees,
    availableTeamLeads,
    handleSave,
    getInitials,
    getBgColor,
    getGradient
  };
}
