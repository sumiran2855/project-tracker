'use client';

import { useProjectDetailService } from '@/services/useProjectDetailService';
import { ProjectDetailHeader } from '@/components/project-detail/ProjectDetailHeader';
import { ProjectStatsRibbon } from '@/components/project-detail/ProjectStatsRibbon';
import { ProjectTasksTabController } from '@/components/project-detail/ProjectTasksTabController';
import { TasksKanbanView } from '@/components/project-detail/TasksKanbanView';
import { TasksListView } from '@/components/project-detail/TasksListView';
import { TasksTimelineView } from '@/components/project-detail/TasksTimelineView';
import { HoursPromptModal } from '@/components/project-detail/HoursPromptModal';
import { AddTaskModal } from '@/components/project-detail/AddTaskModal';
import { TaskDetailDrawer } from '@/components/project-detail/TaskDetailDrawer';
import { AddProjectModal } from '@/components/dashboard/AddProjectModal';

export default function ProjectDetailPage() {
  const {
    user,
    router,
    project,
    tasks,
    displayTasks,
    isEmployee,
    isClient,
    canCreateTask,
    canDeleteTask,
    canEditHours,
    projectBudgetHours,
    totalLoggedProjectHours,
    remainingProjectHours,
    activeTab,
    setActiveTab,
    isTaskModalOpen,
    setIsTaskModalOpen,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDesc,
    setNewTaskDesc,
    newTaskStatus,
    setNewTaskStatus,
    newTaskPriority,
    setNewTaskPriority,
    newTaskStartDate,
    setNewTaskStartDate,
    newTaskDueDate,
    setNewTaskDueDate,
    newTaskAssignees,
    setNewTaskAssignees,
    hoursPromptOpen,
    setHoursPromptOpen,
    promptTask,
    setPromptTask,
    promptValue,
    setPromptValue,
    selectedTask,
    setSelectedTask,
    newSubtaskTitle,
    setNewSubtaskTitle,
    newCommentText,
    setNewCommentText,
    availableMembers,
    isEditProjectModalOpen,
    setIsEditProjectModalOpen,
    loadProject,
    saveTasks,
    handleUpdateProjectStatus,
    handleDragStart,
    handleDrop,
    handleMoveTask,
    submitMoveTask,
    handleCreateTask,
    handleDeleteTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
    handleAddComment,
    getPriorityColor,
    getProjectStatusBadge
  } = useProjectDetailService();

  if (!project) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-650 border-t-transparent mx-auto" />
          <p className="text-xs font-bold">Synchronizing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
        
        {/* Detail Page Header */}
        <ProjectDetailHeader
          project={project}
          isEmployee={isEmployee}
          onBackToHub={() => router.push('/projects')}
          onUpdateStatus={handleUpdateProjectStatus}
          onEditDetailsClick={() => setIsEditProjectModalOpen(true)}
          getProjectStatusBadge={getProjectStatusBadge}
        />

        {/* Metadata & Progress Ribbon */}
        <ProjectStatsRibbon
          project={project}
          projectBudgetHours={projectBudgetHours}
          totalLoggedProjectHours={totalLoggedProjectHours}
          remainingProjectHours={remainingProjectHours}
          getPriorityColor={getPriorityColor}
        />

        {/* Controller: Tabs & Action Button */}
        <ProjectTasksTabController
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          canCreateTask={canCreateTask}
          onAddTaskClick={() => setIsTaskModalOpen(true)}
        />

        {/* Main Views Container */}
        <div className="min-h-[50vh]">
          {activeTab === 'kanban' && (
            <TasksKanbanView
              displayTasks={displayTasks}
              isClient={isClient}
              canCreateTask={canCreateTask}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onSelectTask={setSelectedTask}
              onAddTaskClick={(status) => {
                setNewTaskStatus(status);
                setIsTaskModalOpen(true);
              }}
              getPriorityColor={getPriorityColor}
            />
          )}

          {activeTab === 'list' && (
            <TasksListView
              displayTasks={displayTasks}
              canDeleteTask={canDeleteTask}
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
              onSelectTask={setSelectedTask}
              getPriorityColor={getPriorityColor}
            />
          )}

          {activeTab === 'timeline' && (
            <TasksTimelineView
              displayTasks={displayTasks}
              onSelectTask={setSelectedTask}
              getPriorityColor={getPriorityColor}
            />
          )}
        </div>
      </div>

      {/* Hours Spent Modal */}
      {hoursPromptOpen && (
        <HoursPromptModal
          promptValue={promptValue}
          setPromptValue={setPromptValue}
          onClose={() => {
            setHoursPromptOpen(false);
            setPromptTask(null);
          }}
          onConfirm={async () => {
            if (promptTask) {
              const finalHours = parseFloat(promptValue) || 0;
              const taskToMove = tasks.find(t => t.id === promptTask.taskId);
              const existingHours = taskToMove?.actualHours || 0;
              const delta = Math.max(0, finalHours - existingHours);
              await submitMoveTask(promptTask.taskId, promptTask.targetStatus, delta);
            }
            setHoursPromptOpen(false);
            setPromptTask(null);
          }}
        />
      )}

      {/* dialog - Add Task Modal */}
      {isTaskModalOpen && (
        <AddTaskModal
          onClose={() => setIsTaskModalOpen(false)}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDesc={newTaskDesc}
          setNewTaskDesc={setNewTaskDesc}
          newTaskStatus={newTaskStatus}
          setNewTaskStatus={setNewTaskStatus}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          newTaskStartDate={newTaskStartDate}
          setNewTaskStartDate={setNewTaskStartDate}
          newTaskDueDate={newTaskDueDate}
          setNewTaskDueDate={setNewTaskDueDate}
          newTaskAssignees={newTaskAssignees}
          setNewTaskAssignees={setNewTaskAssignees}
          isEmployee={isEmployee}
          user={user}
          project={project}
          availableMembers={availableMembers}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Slide-over/Modal: Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          selectedTask={selectedTask}
          onClose={() => setSelectedTask(null)}
          isClient={isClient}
          canEditHours={canEditHours}
          canDeleteTask={canDeleteTask}
          tasks={tasks}
          saveTasks={saveTasks}
          onMoveTask={handleMoveTask}
          setSelectedTask={setSelectedTask}
          onDeleteTask={handleDeleteTask}
          newSubtaskTitle={newSubtaskTitle}
          setNewSubtaskTitle={setNewSubtaskTitle}
          newCommentText={newCommentText}
          setNewCommentText={setNewCommentText}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onAddComment={handleAddComment}
          user={user}
        />
      )}

      {/* Edit Project Modal */}
      <AddProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        availableMembers={availableMembers}
        projectToEdit={project}
        onSuccess={async () => {
          await loadProject();
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />
    </>
  );
}
