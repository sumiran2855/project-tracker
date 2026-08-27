import React, { useState, useEffect } from 'react';
import { useUser, usePermission } from '@/contexts/UserContext';
import { getProjectsAction, updateProjectAction } from '@/actions/projects';
import type { Project } from '@/types/projects.types';
import type { MilestoneItem } from '@/types/roadmap.types';

export function useRoadmapService() {
  const { user } = useUser();
  const canManageRoadmap = usePermission('roadmap:manage');
  const isEmployee = user?.role?.toLowerCase() === 'employee';

  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'board' | 'milestones'>('timeline');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  // Add Milestone Form States
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneProject, setNewMilestoneProject] = useState('');

  // Modal States
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Edit Project Dates Form States
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editQuarter, setEditQuarter] = useState<Project['targetQuarter']>('Future');

  const loadData = async () => {
    const res = await getProjectsAction();
    let loadedProjects: Project[] = [];

    if (res.success && res.data) {
      loadedProjects = res.data as any[];
    } else {
      const storedProjects = localStorage.getItem('pwt_projects');
      if (storedProjects) {
        try {
          loadedProjects = JSON.parse(storedProjects);
        } catch (e) {
          console.error(e);
        }
      }
    }

    const migratedProjects = loadedProjects.map((proj) => {
      const copy = { ...proj };

      if (!copy.startDate) {
        if (copy.dueDate && copy.dueDate !== 'No Due Date') {
          try {
            const due = new Date(copy.dueDate);
            due.setDate(due.getDate() - 30);
            copy.startDate = due.toISOString().split('T')[0];
          } catch {
            copy.startDate = new Date().toISOString().split('T')[0];
          }
        } else {
          copy.startDate = new Date().toISOString().split('T')[0];
        }
      }

      if (!copy.targetQuarter) {
        if (copy.dueDate && copy.dueDate !== 'No Due Date') {
          try {
            const date = new Date(copy.dueDate);
            const month = date.getMonth();
            const year = date.getFullYear();
            if (month >= 3 && month <= 5) copy.targetQuarter = `Q2 ${year}` as any;
            else if (month >= 6 && month <= 8) copy.targetQuarter = `Q3 ${year}` as any;
            else if (month >= 9 && month <= 11) copy.targetQuarter = `Q4 ${year}` as any;
            else copy.targetQuarter = 'Future';
          } catch {
            copy.targetQuarter = 'Future';
          }
        } else {
          copy.targetQuarter = 'Future';
        }
      }

      return copy;
    });

    setProjects(migratedProjects);
    localStorage.setItem('pwt_projects', JSON.stringify(migratedProjects));

    const storedMilestones = localStorage.getItem('pwt_milestones');
    let loadedMilestones: MilestoneItem[] = [];
    if (storedMilestones) {
      try {
        loadedMilestones = JSON.parse(storedMilestones);
      } catch (e) {
        console.error(e);
      }
    }
    setMilestones(loadedMilestones);
  };

  // Initialize data from backend API
  useEffect(() => {
    loadData();
  }, []);

  // Save states back
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('pwt_projects', JSON.stringify(updatedProjects));
  };

  const saveMilestones = (updatedMilestones: MilestoneItem[]) => {
    setMilestones(updatedMilestones);
    localStorage.setItem('pwt_milestones', JSON.stringify(updatedMilestones));
  };

  // Drag and Drop (Quarterly Columns)
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDrop = async (e: React.DragEvent, targetQuarter: Project['targetQuarter']) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    if (!projectId) return;

    const updated = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, targetQuarter };
      }
      return p;
    });
    saveProjects(updated);

    try {
      await updateProjectAction(projectId, { targetQuarter });
    } catch (err) {
      console.error("Failed to update project quarter", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Add Milestone
  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !newMilestoneProject) return;

    const newMilestone: MilestoneItem = {
      id: `milestone_${Date.now()}`,
      title: newMilestoneTitle,
      description: newMilestoneDesc,
      dueDate: newMilestoneDueDate || new Date().toISOString().split('T')[0],
      projectId: newMilestoneProject,
      completed: false,
      assignedTo: newMilestoneAssignee || undefined,
    };

    saveMilestones([newMilestone, ...milestones]);

    // Reset Form
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneDueDate('');
    setNewMilestoneProject('');
    setNewMilestoneAssignee('');
    setIsMilestoneModalOpen(false);
  };

  // Toggle Milestone status
  const handleToggleMilestone = (id: string) => {
    const updated = milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
    saveMilestones(updated);
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      const updated = milestones.filter(m => m.id !== id);
      saveMilestones(updated);
    }
  };

  // Edit Project Dates
  const handleOpenEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setEditStartDate(project.startDate || '2026-07-01');
    setEditDueDate(project.dueDate || '2026-07-31');
    setEditQuarter(project.targetQuarter || 'Future');
    setIsEditProjectModalOpen(true);
  };

  const handleSaveProjectDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated = projects.map(p => {
      if (p.id === editingProject.id) {
        return {
          ...p,
          startDate: editStartDate,
          dueDate: editDueDate,
          targetQuarter: editQuarter,
        };
      }
      return p;
    });

    saveProjects(updated);
    setIsEditProjectModalOpen(false);
    const projId = editingProject.id;
    setEditingProject(null);

    try {
      await updateProjectAction(projId, {
        startDate: editStartDate,
        dueDate: editDueDate,
        targetQuarter: editQuarter
      });
    } catch (err) {
      console.error("Failed to update project dates", err);
    }
  };

  const handleUpdateProjectDates = async (projectId: string, startDate: string, dueDate: string) => {
    let targetQuarter: Project['targetQuarter'] = 'Future';
    if (dueDate && dueDate !== 'No Due Date') {
      try {
        const date = new Date(dueDate);
        const month = date.getMonth();
        const year = date.getFullYear();
        if (month >= 3 && month <= 5) targetQuarter = `Q2 ${year}` as any;
        else if (month >= 6 && month <= 8) targetQuarter = `Q3 ${year}` as any;
        else if (month >= 9 && month <= 11) targetQuarter = `Q4 ${year}` as any;
      } catch (e) {
        console.error(e);
      }
    }

    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          startDate,
          dueDate,
          targetQuarter,
        };
      }
      return p;
    });

    saveProjects(updated);

    try {
      await updateProjectAction(projectId, {
        startDate,
        dueDate,
        targetQuarter,
      });
    } catch (err) {
      console.error("Failed to update project dates in database", err);
    }
  };

  // Scoped projects based on user role and filters
  const scopedProjects = isEmployee
    ? projects.filter(proj => proj.members.some(m => m.name === user?.name))
    : projects.filter(proj => employeeFilter === 'All' || proj.members.some(m => m.name === employeeFilter));

  // Filter calculations
  const filteredProjects = scopedProjects.filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMilestones = milestones.filter(m => {
    const matchesProject = projectFilter === 'All' || m.projectId === projectFilter;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isProjectVisible = scopedProjects.some(p => p.id === m.projectId);
    const matchesAssignee = !isEmployee || m.assignedTo === user?.name;

    return matchesProject && matchesSearch && isProjectVisible && matchesAssignee;
  });

  // KPI Statistics
  const totalInitiatives = filteredProjects.length;
  const activeQuarters = Array.from(new Set(filteredProjects.map(p => p.targetQuarter).filter(Boolean))).length;
  const completedMilestones = filteredMilestones.filter(m => m.completed).length;
  const totalMilestones = filteredMilestones.length;
  const onTrackInitiatives = filteredProjects.filter(p => p.progress >= 50 && p.status !== 'Completed').length;

  const getStatusStyles = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Planning':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return {
    user,
    canManageRoadmap,
    isEmployee,
    projects,
    milestones,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    statusFilter,
    setStatusFilter,
    employeeFilter,
    setEmployeeFilter,
    newMilestoneAssignee,
    setNewMilestoneAssignee,
    newMilestoneTitle,
    setNewMilestoneTitle,
    newMilestoneDesc,
    setNewMilestoneDesc,
    newMilestoneDueDate,
    setNewMilestoneDueDate,
    newMilestoneProject,
    setNewMilestoneProject,
    isMilestoneModalOpen,
    setIsMilestoneModalOpen,
    isEditProjectModalOpen,
    setIsEditProjectModalOpen,
    editingProject,
    setEditingProject,
    editStartDate,
    setEditStartDate,
    editDueDate,
    setEditDueDate,
    editQuarter,
    setEditQuarter,
    scopedProjects,
    filteredProjects,
    filteredMilestones,
    totalInitiatives,
    activeQuarters,
    completedMilestones,
    totalMilestones,
    onTrackInitiatives,
    getStatusStyles,
    formatMonthName,
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleCreateMilestone,
    handleToggleMilestone,
    handleDeleteMilestone,
    handleOpenEditProjectModal,
    handleSaveProjectDates,
    handleUpdateProjectDates,
  };
}
