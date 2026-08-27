'use client';

import { Building, AlertCircle, Check } from 'lucide-react';
import { useManagerAssignmentsService } from '@/services/useManagerAssignmentsService';
import { ManagersListPanel } from '@/components/manager-assignments/ManagersListPanel';
import { ManagerAssignmentEditor } from '@/components/manager-assignments/ManagerAssignmentEditor';
import { CorporateHierarchyTree } from '@/components/manager-assignments/CorporateHierarchyTree';

export default function ManagerAssignmentsPage() {
  const {
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
  } = useManagerAssignmentsService();

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 lg:p-10">

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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Panel: Managers List */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <ManagersListPanel
              managers={managers}
              filteredManagers={filteredManagers}
              managerSearch={managerSearch}
              setManagerSearch={setManagerSearch}
              selectedManagerId={selectedManagerId}
              setSelectedManagerId={setSelectedManagerId}
              getInitials={getInitials}
              getGradient={getGradient}
            />
          </div>

          {/* Right Panel: Editor / General Tree */}
          <div className="lg:col-span-2 space-y-4">

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 px-4 py-3.5 text-xs font-bold text-red-700 dark:text-red-400 shadow-3xs">
                <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 px-4 py-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-3xs">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                {successMsg}
              </div>
            )}

            {selectedManagerId ? (
              /* Editor Mode */
              <ManagerAssignmentEditor
                selectedManager={selectedManager}
                saving={saving}
                assignedTeamLeadIds={assignedTeamLeadIds}
                setAssignedTeamLeadIds={setAssignedTeamLeadIds}
                assignedEmployeeIds={assignedEmployeeIds}
                setAssignedEmployeeIds={setAssignedEmployeeIds}
                teamLeadSearch={teamLeadSearch}
                setTeamLeadSearch={setTeamLeadSearch}
                employeeSearch={employeeSearch}
                setEmployeeSearch={setEmployeeSearch}
                showTeamLeadDropdown={showTeamLeadDropdown}
                setShowTeamLeadDropdown={setShowTeamLeadDropdown}
                showEmployeeDropdown={showEmployeeDropdown}
                setShowEmployeeDropdown={setShowEmployeeDropdown}
                availableTeamLeads={availableTeamLeads}
                availableEmployees={availableEmployees}
                allUsers={allUsers}
                managers={managers}
                selectedManagerId={selectedManagerId}
                handleSave={handleSave}
                setSelectedManagerId={setSelectedManagerId}
                getInitials={getInitials}
                getGradient={getGradient}
                getBgColor={getBgColor}
              />
            ) : (
              /* Overview Hierarchy Tree Mode */
              <CorporateHierarchyTree
                managers={managers}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                setSelectedManagerId={setSelectedManagerId}
                getInitials={getInitials}
                getGradient={getGradient}
                getBgColor={getBgColor}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
