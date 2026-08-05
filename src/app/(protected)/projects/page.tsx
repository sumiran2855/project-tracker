'use client';

import { useProjectsService } from '@/services/useProjectsService';
import { ProjectsHeader } from '@/components/projects/ProjectsHeader';
import { ProjectsStatsGrid } from '@/components/projects/ProjectsStatsGrid';
import { ProjectsFilterRow } from '@/components/projects/ProjectsFilterRow';
import { ProjectsListGrid } from '@/components/projects/ProjectsListGrid';
import { NoProjectsState } from '@/components/projects/NoProjectsState';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';

export default function ProjectsPage() {
  const {
    canCreateProject,
    canDeleteProject,
    availableMembers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    isModalOpen,
    setIsModalOpen,
    totalProjects,
    inProgressCount,
    completedCount,
    inReviewCount,
    planningCount,
    handleProjectSuccess,
    handleDeleteProject,
    filteredProjects,
    getStatusStyles,
    getPriorityStyles,
    formatDate
  } = useProjectsService();

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-8">
      
        {/* Page Header */}
        <ProjectsHeader
          canCreateProject={canCreateProject}
          onNewProjectClick={() => setIsModalOpen(true)}
        />

        {/* Statistics Section */}
        <ProjectsStatsGrid
          totalProjects={totalProjects}
          inProgressCount={inProgressCount}
          inReviewCount={inReviewCount}
          planningCount={planningCount}
          completedCount={completedCount}
        />

        {/* Filter and Sorting Row */}
        <ProjectsFilterRow
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <NoProjectsState />
        ) : (
          <ProjectsListGrid
            filteredProjects={filteredProjects}
            canDeleteProject={canDeleteProject}
            onDeleteProject={handleDeleteProject}
            getStatusStyles={getStatusStyles}
            getPriorityStyles={getPriorityStyles}
            formatDate={formatDate}
          />
        )}
      </div>

      {/* Modal - New Project Form */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableMembers={availableMembers}
        onSuccess={handleProjectSuccess}
      />
    </>
  );
}
