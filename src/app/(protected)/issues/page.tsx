'use client';

import {
  AlertCircle,
  Bug,
  Search,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Columns,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIssueService } from '@/services/useIssueService';
import { AddIssueModal } from '@/components/dashboard/AddIssueModal';
import { DeleteConfirmModal } from '@/components/issues/DeleteConfirmModal';
import { IssuesBoardView } from '@/components/issues/IssuesBoardView';
import { IssuesListView } from '@/components/issues/IssuesListView';
import { IssueDetailDrawer } from '@/components/issues/IssueDetailDrawer';

export default function IssuesPage() {
  const {
    user,
    isClient,
    canDeleteIssue,
    canEditHours,
    projects,
    availableMembers,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    activeTab,
    setActiveTab,
    modalStatus,
    setModalStatus,
    isModalOpen,
    setIsModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    activeDetailItem,
    setActiveDetailItem,
    newCommentText,
    setNewCommentText,
    activeProjectTasks,
    uploadingImage,
    handleIssueSuccess,
    handleDeleteIssue,
    confirmDeleteIssue,
    handleToggleStatus,
    handleDragStart,
    handleDrop,
    handleCardClick,
    handleUpdateRelatedTask,
    handleAddAttachment,
    handleRemoveAttachment,
    handleLogHours,
    handleUpdateStatus,
    handleUpdatePriority,
    handleUpdateType,
    handleUpdateTargetDate,
    handleAddComment,
    handleDeleteActiveItem,
    filteredIssues,
    totalCount,
    criticalCount,
    inProgressCount,
    resolvedCount,
  } = useIssueService();

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-655 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace Tracking</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30 shadow-xs">
                <Bug className="h-4.5 w-4.5" />
              </div>
              Issues Tracker
            </h1>
            <p className="text-xs text-slate-450 font-medium mt-1">
              Log, assign, and track technical bugs, security findings, and roadmap improvements.
            </p>
          </div>

          <button
            onClick={() => {
              setModalStatus('Open');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Issue</span>
          </button>
        </div>

        {/* Stats Counter Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Issues', value: totalCount, icon: AlertCircle, tint: '#64748b' },
            { label: 'Critical Bugs', value: criticalCount, icon: Bug, tint: '#ef4444' },
            { label: 'In Progress', value: inProgressCount, icon: Clock, tint: '#6366f1' },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, tint: '#10b981' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 cursor-default transition-all duration-300 hover:-translate-y-px"
                style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 6px 16px -4px ${s.tint}18, 0 2px 6px -2px ${s.tint}10`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.05)';
                }}
              >
                {/* Radial wash */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at top right, ${s.tint}09 0%, transparent 70%)` }}
                />

                {/* Icon */}
                <div className="relative">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${s.tint}20, ${s.tint}0d)`,
                      border: `1px solid ${s.tint}28`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.tint }} />
                  </div>
                </div>

                {/* Text details */}
                <div className="relative mt-5">
                  <p
                    className="text-[28px] font-black leading-none tracking-tight text-slate-800"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {s.label}
                  </p>
                  <div
                    className="mt-3 h-0.5 w-8 rounded-full opacity-40 group-hover:w-11 transition-all duration-500"
                    style={{ backgroundColor: s.tint }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 bg-white border border-slate-205 p-3 rounded-2xl shadow-xs">

          {/* Search */}
          <div className="relative w-full xl:flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issue title or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full xl:w-auto">
            {/* Projects */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-550 shadow-2xs">
              <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project:</span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
              >
                <option value="All">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-550 shadow-2xs">
              <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Status */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-550 shadow-2xs">
              <span className="shrink-0 mr-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 outline-none pr-4 py-1.5 cursor-pointer font-bold w-full"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

        </div>

        {/* Tab Select & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
          
          {/* Switching Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto border border-slate-100">
            {[
              { id: 'board', label: 'Kanban Board', icon: Columns },
              { id: 'list', label: 'Detailed List', icon: ListTodo },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    active 
                      ? "bg-white text-indigo-650 shadow-sm ring-1 ring-slate-200/50" 
                      : "text-slate-400 hover:text-slate-650"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Views Content Container */}
        <div className="min-h-[50vh]">
          {/* 1. KANBAN BOARD VIEW */}
          {activeTab === 'board' && (
            <IssuesBoardView
              filteredIssues={filteredIssues}
              isClient={isClient}
              handleDragStart={handleDragStart}
              handleDrop={handleDrop}
              handleCardClick={handleCardClick}
              setModalStatus={setModalStatus}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {/* 2. DETAILED LIST VIEW */}
          {activeTab === 'list' && (
            <IssuesListView
              filteredIssues={filteredIssues}
              canDeleteIssue={canDeleteIssue}
              handleToggleStatus={handleToggleStatus}
              handleCardClick={handleCardClick}
              handleDeleteIssue={handleDeleteIssue}
            />
          )}
        </div>

      </div>

      {/* modal - Add Issue Modal */}
      <AddIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projects={projects}
        availableMembers={availableMembers}
        onSuccess={handleIssueSuccess}
        defaultStatus={modalStatus}
      />

      {/* modal - Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteIssue}
      />

      {/* SLIDE-IN SIDE PANEL: CARD DETAILED DRAWER */}
      <IssueDetailDrawer
        activeDetailItem={activeDetailItem}
        onClose={() => setActiveDetailItem(null)}
        isClient={isClient}
        canEditHours={canEditHours}
        activeProjectTasks={activeProjectTasks}
        uploadingImage={uploadingImage}
        user={user}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        handleUpdateStatus={handleUpdateStatus}
        handleUpdatePriority={handleUpdatePriority}
        handleUpdateType={handleUpdateType}
        handleUpdateTargetDate={handleUpdateTargetDate}
        handleUpdateRelatedTask={handleUpdateRelatedTask}
        handleAddAttachment={handleAddAttachment}
        handleRemoveAttachment={handleRemoveAttachment}
        handleLogHours={handleLogHours}
        handleAddComment={handleAddComment}
        handleDeleteActiveItem={handleDeleteActiveItem}
      />
    </>
  );
}
