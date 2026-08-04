import { useState, useEffect } from 'react';
import { usePermission } from '@/contexts/UserContext';
import { getProjectsAction, deleteProjectAction, getEmployeesAction } from '@/actions/projects';
import type { Employee } from '@/types/projects.types';

export interface Member {
  name: string;
  initials: string;
  bg: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'In Review';
  progress: number;
  tags: string[];
  tasksCount: number;
  completedTasks: number;
  commentsCount: number;
  attachmentsCount: number;
  dueDate: string;
  members: Member[];
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
  startDate?: string;
  targetQuarter?: 'Q2 2026' | 'Q3 2026' | 'Q4 2026' | 'Future';
}

const staticAvailableMembers: Member[] = [
  { name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' },
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' },
  { name: 'Oliver Twist', initials: 'OT', bg: 'bg-amber-500' },
];

export function useProjectsService() {
  const canCreateProject = usePermission('project:create');
  const canDeleteProject = usePermission('project:delete');

  const [projects, setProjects] = useState<Project[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from backend API
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const projRes = await getProjectsAction();
      if (projRes.success && projRes.data) {
        setProjects(projRes.data as any[]);
        localStorage.setItem('pwt_projects', JSON.stringify(projRes.data));
      } else {
        const stored = localStorage.getItem('pwt_projects');
        if (stored) {
          try {
            setProjects(JSON.parse(stored));
          } catch (e) {
            console.error('Failed to parse projects from localStorage', e);
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      }

      const empRes = await getEmployeesAction();
      if (empRes.success && empRes.data) {
        setAvailableMembers(empRes.data.filter(e => e.role?.toLowerCase() !== 'admin'));
      } else {
        setAvailableMembers(
          staticAvailableMembers.map((m, i) => ({
            id: String(i + 1),
            name: m.name,
            initials: m.initials,
            bg: m.bg,
            email: '',
            role: 'Employee'
          }))
        );
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('pwt_projects', JSON.stringify(updatedProjects));
  };

  // Calculate stats
  const totalProjects = projects.length;
  const inProgressCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const inReviewCount = projects.filter(p => p.status === 'In Review').length;
  const planningCount = projects.filter(p => p.status === 'Planning').length;

  const handleProjectSuccess = async () => {
    const projRes = await getProjectsAction();
    if (projRes.success && projRes.data) {
      setProjects(projRes.data as any[]);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking delete
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      const res = await deleteProjectAction(id);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        console.error('Failed to delete project on backend, reverting to local:', res.error);
        const updated = projects.filter(p => p.id !== id);
        saveProjects(updated);
      }
    }
  };

  // Filter & Sort Projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    } else if (sortBy === 'dueDate') {
      if (a.dueDate === 'No Due Date') return 1;
      if (b.dueDate === 'No Due Date') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const getStatusStyles = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'In Review':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'Planning':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
    }
  };

  const getPriorityStyles = (priority?: Project['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200/50';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      case 'Low':
        return 'bg-slate-50 text-slate-500 border-slate-200/50';
      default:
        return 'hidden';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'No Due Date') return 'No Due Date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return {
    canCreateProject,
    canDeleteProject,
    projects,
    availableMembers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    loading,
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
  };
}
