'use client';

import { useSprintService } from '@/services/useSprintService';
import { SprintHeader } from '@/components/sprint/SprintHeader';
import { SprintKpis } from '@/components/sprint/SprintKpis';
import { SprintFilters } from '@/components/sprint/SprintFilters';
import { SprintBoard } from '@/components/sprint/SprintBoard';
import { SprintSpreadsheet } from '@/components/sprint/SprintSpreadsheet';
import { SprintWorkload } from '@/components/sprint/SprintWorkload';
import { SprintHoursModal } from '@/components/sprint/SprintHoursModal';
import { SprintDetailDrawer } from '@/components/sprint/SprintDetailDrawer';
import { EmployeeDetailModal } from '@/components/dashboard/EmployeeDetailModal';
import { CheckSquare } from 'lucide-react';

export default function SprintPage() {
  const service = useSprintService();
  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <SprintHeader
        weekRangeStr={service.weekRangeStr}
        viewMode={service.viewMode}
        setViewMode={service.setViewMode}
      />

      {/* KPI Ribbon */}
      <SprintKpis
        completionPercentage={service.completionPercentage}
        completedItems={service.completedItems}
        totalItems={service.totalItems}
        completedTasksCount={service.completedTasksCount}
        totalTasksCount={service.totalTasksCount}
        resolvedIssuesCount={service.resolvedIssuesCount}
        totalIssuesCount={service.totalIssuesCount}
        totalLoggedHours={service.totalLoggedHours}
      />

      {/* Filters Ribbon */}
      <SprintFilters
        searchQuery={service.searchQuery}
        setSearchQuery={service.setSearchQuery}
        filterProject={service.filterProject}
        setFilterProject={service.setFilterProject}
        filterType={service.filterType}
        setFilterType={service.setFilterType}
        projects={service.projects}
        filteredCount={service.filteredSprintItems.length}
      />

      {/* Main View Layout Content */}
      {service.loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold text-xs animate-pulse">
          Loading sprint information...
        </div>
      ) : service.filteredSprintItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 py-16 px-4 text-center shadow-3xs animate-fadeIn">
          <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-slate-805 tracking-tight">No active sprint items</h3>
          <p className="text-xs text-slate-455 font-semibold mt-1 max-w-sm mx-auto">
            Try resetting your search query or filters. Tasks or issues must have a due date in the current calendar week or be overdue to appear in the weekly sprint.
          </p>
        </div>
      ) : service.viewMode === 'board' ? (
        <SprintBoard
          filteredSprintItems={service.filteredSprintItems}
          columns={columns}
          draggedOverCol={service.draggedOverCol}
          isClient={service.isClient}
          monday={service.monday}
          handleDragOver={service.handleDragOver}
          handleDragLeave={service.handleDragLeave}
          handleDrop={service.handleDrop}
          handleDragStart={service.handleDragStart}
          handleItemClick={service.handleItemClick}
          setSelectedEmployee={service.setSelectedEmployee}
        />
      ) : (
        <SprintSpreadsheet
          filteredSprintItems={service.filteredSprintItems}
          monday={service.monday}
          handleItemClick={service.handleItemClick}
        />
      )}

      {/* Team Workload Analytics */}
      <SprintWorkload
        memberAnalytics={service.memberAnalytics}
        setSelectedEmployee={service.setSelectedEmployee}
      />

      {/* Prompt Transition Hours Modal */}
      <SprintHoursModal
        isOpen={service.showHoursModal}
        hoursModalTarget={service.hoursModalTarget}
        inputHours={service.inputHours}
        setInputHours={service.setInputHours}
        onClose={() => {
          service.setShowHoursModal(false);
          service.setHoursModalTarget(null);
        }}
        onSave={service.handleSaveTransitionHours}
      />

      {/* Side Slide-in Detailed Item Sheet Drawer */}
      <SprintDetailDrawer
        isOpen={!!service.activeDetailItem}
        activeDetailItem={service.activeDetailItem}
        onClose={() => service.setActiveDetailItem(null)}
        isClient={service.isClient}
        canEditHours={service.canEditHours}
        tasks={service.tasks}
        user={service.user}
        newCommentText={service.newCommentText}
        setNewCommentText={service.setNewCommentText}
        newSubtaskText={service.newSubtaskText}
        setNewSubtaskText={service.setNewSubtaskText}
        uploadingImage={service.uploadingImage}
        handleUpdateStatus={service.handleUpdateStatus}
        handleUpdatePriority={service.handleUpdatePriority}
        handleUpdateTargetDate={service.handleUpdateTargetDate}
        handleSaveHoursValue={service.handleSaveHoursValue}
        handleUpdateRelatedTask={service.handleUpdateRelatedTask}
        handleAddAttachment={service.handleAddAttachment}
        handleRemoveAttachment={service.handleRemoveAttachment}
        handleAddComment={service.handleAddComment}
        handleToggleSubtask={service.handleToggleSubtask}
        handleAddSubtask={service.handleAddSubtask}
        handleDeleteActiveItem={service.handleDeleteActiveItem}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        isOpen={!!service.selectedEmployee}
        onClose={() => service.setSelectedEmployee(null)}
        employee={service.selectedEmployee}
        assignedItems={service.selectedEmployeeItems}
        onSelectWorkItem={(item) => service.handleItemClick(item)}
      />

    </div>
  );
}
