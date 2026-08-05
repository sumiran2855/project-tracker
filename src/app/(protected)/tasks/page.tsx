'use client';

import { useTasksService } from '@/services/useTasksService';
import { TasksHeader } from '@/components/tasks/TasksHeader';
import { TasksKpis } from '@/components/tasks/TasksKpis';
import { TasksFilters } from '@/components/tasks/TasksFilters';
import { TasksTabs } from '@/components/tasks/TasksTabs';
import { TasksBoard } from '@/components/tasks/TasksBoard';
import { TasksList } from '@/components/tasks/TasksList';
import { TasksCalendar } from '@/components/tasks/TasksCalendar';
import { TasksHoursModal } from '@/components/tasks/TasksHoursModal';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';

export default function GlobalTasksPage() {
  const service = useTasksService();

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Page Header Banner */}
      <TasksHeader
        canCreateTask={service.canCreateTask}
        projects={service.projects}
        setNewTaskProject={service.setNewTaskProject}
        setIsTaskModalOpen={service.setIsTaskModalOpen}
      />

      {/* KPI Stats Ribbon */}
      <TasksKpis
        totalCount={service.totalCount}
        pendingCount={service.pendingCount}
        inProgressCount={service.inProgressCount}
        inReviewCount={service.inReviewCount}
        doneCount={service.doneCount}
      />

      {/* Filters Ribbon */}
      <TasksFilters
        searchQuery={service.searchQuery}
        setSearchQuery={service.setSearchQuery}
        projectFilter={service.projectFilter}
        setProjectFilter={service.setProjectFilter}
        priorityFilter={service.priorityFilter}
        setPriorityFilter={service.setPriorityFilter}
        statusFilter={service.statusFilter}
        setStatusFilter={service.setStatusFilter}
        projects={service.projects}
      />

      {/* Tabs Layout Selector */}
      <TasksTabs
        activeTab={service.activeTab}
        setActiveTab={service.setActiveTab}
      />

      {/* Main View Layout Area */}
      <div className="min-h-[50vh]">
        {service.activeTab === 'board' && (
          <TasksBoard
            filteredTasks={service.filteredTasks}
            isClient={service.isClient}
            canCreateTask={service.canCreateTask}
            setIsTaskModalOpen={service.setIsTaskModalOpen}
            setNewTaskStatus={service.setNewTaskStatus}
            handleDragStart={service.handleDragStart}
            handleDrop={service.handleDrop}
            setSelectedTask={service.setSelectedTask}
          />
        )}

        {service.activeTab === 'list' && (
          <TasksList
            filteredTasks={service.filteredTasks}
            canDeleteTask={service.canDeleteTask}
            handleUpdateTask={service.handleUpdateTask}
            handleDeleteTask={service.handleDeleteTask}
            setSelectedTask={service.setSelectedTask}
          />
        )}

        {service.activeTab === 'calendar' && (
          <TasksCalendar
            filteredTasks={service.filteredTasks}
            currentCalendarDate={service.currentCalendarDate}
            setCurrentCalendarDate={service.setCurrentCalendarDate}
            setSelectedTask={service.setSelectedTask}
          />
        )}
      </div>

      {/* Logging Transition Hours Modal */}
      <TasksHoursModal
        isOpen={service.hoursPromptOpen}
        promptTask={service.promptTask}
        promptValue={service.promptValue}
        setPromptValue={service.setPromptValue}
        onClose={() => {
          service.setHoursPromptOpen(false);
          service.setPromptTask(null);
        }}
        onSave={async () => {
          if (service.promptTask) {
            const finalHours = parseFloat(service.promptValue) || 0;
            const existingHours = service.promptTask.actualHours || 0;
            const delta = Math.max(0, finalHours - existingHours);
            await service.submitUpdateTask(service.promptTask, delta, delta > 0);
          }
          service.setHoursPromptOpen(false);
          service.setPromptTask(null);
        }}
      />

      {/* Create Task Modal */}
      <TaskCreateModal
        isOpen={service.isTaskModalOpen}
        onClose={() => service.setIsTaskModalOpen(false)}
        newTaskProject={service.newTaskProject}
        setNewTaskProject={service.setNewTaskProject}
        newTaskTitle={service.newTaskTitle}
        setNewTaskTitle={service.setNewTaskTitle}
        newTaskDesc={service.newTaskDesc}
        setNewTaskDesc={service.setNewTaskDesc}
        newTaskStatus={service.newTaskStatus}
        setNewTaskStatus={service.setNewTaskStatus}
        newTaskPriority={service.newTaskPriority}
        setNewTaskPriority={service.setNewTaskPriority}
        newTaskStartDate={service.newTaskStartDate}
        setNewTaskStartDate={service.setNewTaskStartDate}
        newTaskDueDate={service.newTaskDueDate}
        setNewTaskDueDate={service.setNewTaskDueDate}
        newTaskAssignees={service.newTaskAssignees}
        setNewTaskAssignees={service.setNewTaskAssignees}
        projects={service.projects}
        availableMembers={service.availableMembers}
        user={service.user}
        isEmployee={service.isEmployee}
        onSubmit={service.handleCreateTask}
      />

      {/* Side Slide-in Detailed Item Sheet Drawer */}
      <TaskDetailDrawer
        selectedTask={service.selectedTask}
        setSelectedTask={service.setSelectedTask}
        isClient={service.isClient}
        canEditHours={service.canEditHours}
        canDeleteTask={service.canDeleteTask}
        newSubtaskTitle={service.newSubtaskTitle}
        setNewSubtaskTitle={service.setNewSubtaskTitle}
        newCommentText={service.newCommentText}
        setNewCommentText={service.setNewCommentText}
        user={service.user}
        handleUpdateTask={service.handleUpdateTask}
        handleDeleteTask={service.handleDeleteTask}
        submitUpdateTask={service.submitUpdateTask}
      />

    </div>
  );
}
