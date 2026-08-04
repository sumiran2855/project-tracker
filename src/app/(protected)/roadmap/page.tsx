'use client';

import React from 'react';
import { useRoadmapService } from '@/services/useRoadmapService';
import { RoadmapHeader } from '@/components/roadmap/RoadmapHeader';
import { RoadmapKpis } from '@/components/roadmap/RoadmapKpis';
import { RoadmapControls } from '@/components/roadmap/RoadmapControls';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { RoadmapQuarterlyBoard } from '@/components/roadmap/RoadmapQuarterlyBoard';
import { RoadmapMilestones } from '@/components/roadmap/RoadmapMilestones';
import { MilestoneModal } from '@/components/roadmap/MilestoneModal';
import { EditProjectModal } from '@/components/roadmap/EditProjectModal';

export default function RoadmapPage() {
  const service = useRoadmapService();

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-8 w-full min-w-0">

        {/* Page Header */}
        <RoadmapHeader
          canManageRoadmap={service.canManageRoadmap}
          projectsCount={service.projects.length}
          onOpenMilestoneModal={() => {
            if (service.projects.length > 0) {
              service.setNewMilestoneProject(service.projects[0].id);
            }
            service.setIsMilestoneModalOpen(true);
          }}
        />

        {/* KPI Stats Grid */}
        <RoadmapKpis
          totalInitiatives={service.totalInitiatives}
          activeQuarters={service.activeQuarters}
          completedMilestones={service.completedMilestones}
          totalMilestones={service.totalMilestones}
          onTrackInitiatives={service.onTrackInitiatives}
        />

        {/* Controls & Tab selector */}
        <RoadmapControls
          activeTab={service.activeTab}
          setActiveTab={service.setActiveTab}
          searchQuery={service.searchQuery}
          setSearchQuery={service.setSearchQuery}
          projectFilter={service.projectFilter}
          setProjectFilter={service.setProjectFilter}
          statusFilter={service.statusFilter}
          setStatusFilter={service.setStatusFilter}
          employeeFilter={service.employeeFilter}
          setEmployeeFilter={service.setEmployeeFilter}
          projects={service.projects}
          isEmployee={service.isEmployee}
        />

        {/* Main Tab Views */}
        <div className="min-h-[50vh]">

          {/* 1. TIMELINE GANTT CHART VIEW */}
          {service.activeTab === 'timeline' && (
            <RoadmapTimeline
              filteredProjects={service.filteredProjects}
              milestones={service.milestones}
              isEmployee={service.isEmployee}
              onOpenEditProjectModal={service.handleOpenEditProjectModal}
              getStatusStyles={service.getStatusStyles}
            />
          )}

          {/* 2. QUARTERLY BOARD VIEW */}
          {service.activeTab === 'board' && (
            <RoadmapQuarterlyBoard
              filteredProjects={service.filteredProjects}
              milestones={service.milestones}
              isEmployee={service.isEmployee}
              handleDragStart={service.handleDragStart}
              handleDrop={service.handleDrop}
              handleDragOver={service.handleDragOver}
              onOpenEditProjectModal={service.handleOpenEditProjectModal}
              getStatusStyles={service.getStatusStyles}
            />
          )}

          {/* 3. KEY MILESTONES CHECKLIST VIEW */}
          {service.activeTab === 'milestones' && (
            <RoadmapMilestones
              filteredMilestones={service.filteredMilestones}
              completedMilestones={service.completedMilestones}
              totalMilestones={service.totalMilestones}
              projects={service.projects}
              canManageRoadmap={service.canManageRoadmap}
              handleToggleMilestone={service.handleToggleMilestone}
              handleDeleteMilestone={service.handleDeleteMilestone}
            />
          )}
        </div>

      </div>

      {/* MODAL 1: ADD MILESTONE */}
      <MilestoneModal
        isOpen={service.isMilestoneModalOpen}
        onClose={() => service.setIsMilestoneModalOpen(false)}
        newMilestoneTitle={service.newMilestoneTitle}
        setNewMilestoneTitle={service.setNewMilestoneTitle}
        newMilestoneDesc={service.newMilestoneDesc}
        setNewMilestoneDesc={service.setNewMilestoneDesc}
        newMilestoneDueDate={service.newMilestoneDueDate}
        setNewMilestoneDueDate={service.setNewMilestoneDueDate}
        newMilestoneProject={service.newMilestoneProject}
        setNewMilestoneProject={service.setNewMilestoneProject}
        newMilestoneAssignee={service.newMilestoneAssignee}
        setNewMilestoneAssignee={service.setNewMilestoneAssignee}
        projects={service.projects}
        handleCreateMilestone={service.handleCreateMilestone}
      />

      {/* MODAL 2: EDIT PROJECT DATES */}
      <EditProjectModal
        isOpen={service.isEditProjectModalOpen}
        onClose={() => {
          service.setIsEditProjectModalOpen(false);
          service.setEditingProject(null);
        }}
        project={service.editingProject}
        editStartDate={service.editStartDate}
        setEditStartDate={service.setEditStartDate}
        editDueDate={service.editDueDate}
        setEditDueDate={service.setEditDueDate}
        editQuarter={service.editQuarter}
        setEditQuarter={service.setEditQuarter}
        handleSaveProjectDates={service.handleSaveProjectDates}
      />
    </>
  );
}
