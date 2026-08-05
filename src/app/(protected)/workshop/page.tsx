'use client';

import { useWorkshopService } from '@/services/useWorkshopService';
import { WorkshopHeader } from '@/components/workshop/WorkshopHeader';
import { WorkshopKpis } from '@/components/workshop/WorkshopKpis';
import { WorkshopFilters } from '@/components/workshop/WorkshopFilters';
import { WorkshopSheet } from '@/components/workshop/WorkshopSheet';
import { WorkshopKanbanHeader } from '@/components/workshop/WorkshopKanbanHeader';
import { WorkshopKanbanBoard } from '@/components/workshop/WorkshopKanbanBoard';
import { WorkshopHoursModal } from '@/components/workshop/WorkshopHoursModal';
import { WorkshopDetailDrawer } from '@/components/workshop/WorkshopDetailDrawer';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';
import { AddIssueModal } from '@/components/dashboard/AddIssueModal';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';

export default function WorkshopDashboard() {
  const service = useWorkshopService();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      {/* ────────────────────────────────────────────────────────
          VIEW 1: SPREADSHEET VIEW
          ──────────────────────────────────────────────────────── */}
      {service.viewMode === 'sheet' && (
        <div className="animate-fadeUp space-y-6">
          <WorkshopHeader
            exportToCSV={service.exportToCSV}
            canCreateProject={service.canCreateProject}
            setActiveModal={service.setActiveModal}
          />

          <WorkshopKpis
            totalProjects={service.totalProjects}
            inProgressCount={service.inProgressCount}
            inReviewCount={service.inReviewCount}
            planningCount={service.planningCount}
            completedCount={service.completedCount}
          />

          <WorkshopFilters
            searchQuery={service.searchQuery}
            setSearchQuery={service.setSearchQuery}
            statusFilter={service.statusFilter}
            setStatusFilter={service.setStatusFilter}
            priorityFilter={service.priorityFilter}
            setPriorityFilter={service.setPriorityFilter}
            visibleColumns={service.visibleColumns}
            setVisibleColumns={service.setVisibleColumns}
            showColMenu={service.showColMenu}
            setShowColMenu={service.setShowColMenu}
          />

          <WorkshopSheet
            filteredProjects={service.filteredProjects}
            handleSort={service.handleSort}
            visibleColumns={service.visibleColumns}
            handleProjectClick={service.handleProjectClick}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW 2: PRO KANBAN BOARD VIEW (WITH DRAG & DROP)
          ──────────────────────────────────────────────────────── */}
      {service.viewMode === 'kanban' && service.selectedProject && (
        <div className="space-y-5 animate-fadeUp">
          <WorkshopKanbanHeader
            selectedProject={service.selectedProject}
            setViewMode={service.setViewMode}
            handleRefreshKanban={service.handleRefreshKanban}
            isEmployee={service.isEmployee}
            setActiveModal={service.setActiveModal}
          />

          {/* Project Details Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs text-xs">
            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Completion Progress</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${service.selectedProject.progress}%` }} />
                </div>
                <span className="font-extrabold text-slate-800">{service.selectedProject.progress}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Target Quarter / Timeline</span>
              <span className="block font-extrabold text-slate-700">
                {service.selectedProject.targetQuarter || 'Q3 2026'} ({service.selectedProject.dueDate ? new Date(service.selectedProject.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Due Date'})
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Workload Budget / Slack</span>
              <span className="block font-extrabold text-slate-700">
                {service.selectedProject.budget || '120 hours'} — <span className="text-indigo-650">{service.selectedProject.slackChannel || '#proj-dev'}</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Assigned Team Members</span>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {service.selectedProject.members.map((m, i) => (
                    <div
                      key={i}
                      title={m.name}
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[8px] text-white font-extrabold ring-2 ring-white shadow-2xs shrink-0 ${m.bg}`}
                    >
                      {m.initials}
                    </div>
                  ))}
                </div>
                <span className="font-bold text-slate-505 text-[10px]">{service.selectedProject.members.length} members</span>
              </div>
            </div>
          </div>

          {/* Kanban Search Filters */}
          <div className="flex items-center bg-white border border-slate-200 p-2.5 rounded-xl shadow-3xs max-w-md">
            <span className="text-slate-400 mr-2 shrink-0">🔍</span>
            <input
              type="text"
              value={service.kanbanSearch}
              onChange={(e) => service.setKanbanSearch(e.target.value)}
              placeholder="Search tasks and issues on the board..."
              className="w-full bg-transparent border-none text-xs text-slate-808 placeholder-slate-400 outline-none font-semibold"
            />
            {service.kanbanSearch && (
              <button onClick={() => service.setKanbanSearch('')} className="text-slate-400 hover:text-slate-655 ml-1 cursor-pointer">
                ✕
              </button>
            )}
          </div>

          <WorkshopKanbanBoard
            kanbanLoading={service.kanbanLoading}
            kanbanColumns={service.getKanbanColumns()}
            draggedOverCol={service.draggedOverCol}
            isClient={service.isClient}
            handleDragOver={service.handleDragOver}
            handleDragLeave={service.handleDragLeave}
            handleDrop={service.handleDrop}
            handleDragStart={service.handleDragStart}
            handleCardClick={service.handleCardClick}
          />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          PROMPT MODAL: LOG HOURS FOR RESOLVED ITEMS
          ──────────────────────────────────────────────────────── */}
      <WorkshopHoursModal
        showHoursModal={service.showHoursModal}
        hoursModalTarget={service.hoursModalTarget}
        inputHours={service.inputHours}
        setInputHours={service.setInputHours}
        handleSaveTransitionHours={service.handleSaveTransitionHours}
        setShowHoursModal={service.setShowHoursModal}
        setHoursModalTarget={service.setHoursModalTarget}
      />

      {/* ────────────────────────────────────────────────────────
          SLIDE-IN SIDE PANEL: CARD DETAILED DRAWER
          ──────────────────────────────────────────────────────── */}
      <WorkshopDetailDrawer
        activeDetailItem={service.activeDetailItem}
        setActiveDetailItem={service.setActiveDetailItem}
        isClient={service.isClient}
        canEditHours={service.canEditHours}
        user={service.user}
        selectedProjTasks={service.selectedProjTasks}
        handleUpdateStatus={service.handleUpdateStatus}
        handleUpdatePriority={service.handleUpdatePriority}
        handleUpdateStartDate={service.handleUpdateStartDate}
        handleSaveHoursValue={service.handleSaveHoursValue}
        handleUpdateTargetDate={service.handleUpdateTargetDate}
        handleUpdateRelatedTask={service.handleUpdateRelatedTask}
        handleAddAttachment={service.handleAddAttachment}
        handleRemoveAttachment={service.handleRemoveAttachment}
        handleToggleSubtask={service.handleToggleSubtask}
        handleAddSubtask={service.handleAddSubtask}
        handleAddComment={service.handleAddComment}
        handleDeleteActiveItem={service.handleDeleteActiveItem}
        newSubtaskText={service.newSubtaskText}
        setNewSubtaskText={service.setNewSubtaskText}
        newCommentText={service.newCommentText}
        setNewCommentText={service.setNewCommentText}
        uploadingImage={service.uploadingImage}
      />

      {/* Creation Modals */}
      <AddProjectModal
        isOpen={service.activeModal === 'project'}
        onClose={() => service.setActiveModal(null)}
        availableMembers={service.employees}
        onSuccess={service.loadWorkspaceData}
      />

      {service.selectedProject && (
        <AddTaskModal
          isOpen={service.activeModal === 'task'}
          onClose={() => service.setActiveModal(null)}
          projects={service.projects}
          availableMembers={service.employees}
          defaultProjectId={service.selectedProject.id}
          onSuccess={service.handleRefreshKanban}
        />
      )}

      {service.selectedProject && (
        <AddIssueModal
          isOpen={service.activeModal === 'issue'}
          onClose={() => service.setActiveModal(null)}
          projects={service.projects}
          availableMembers={service.employees}
          onSuccess={service.handleRefreshKanban}
        />
      )}
    </div>
  );
}
