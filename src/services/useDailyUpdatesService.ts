import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getProjectsAction } from '@/actions/projects';
import { getDailyUpdatesAction, deleteDailyUpdateAction } from '@/actions/daily-updates';
import type { Project } from '@/types/projects.types';
import type { DailyUpdate } from '@/types/daily-updates.types';

export function useDailyUpdatesService() {
  const { user } = useUser();
  const userRole = user?.role || 'Employee';
  const normalizedRole = userRole.toLowerCase();
  const canAddUpdate = normalizedRole !== 'manager' && normalizedRole !== 'client';
  const showMemberFilter = normalizedRole !== 'employee';

  const [projects, setProjects] = useState<Project[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views state
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'feed' | 'table'>('feed');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState<DailyUpdate | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DailyUpdate | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projRes, updatesRes] = await Promise.all([
        getProjectsAction(),
        getDailyUpdatesAction(),
      ]);

      if (projRes.success && projRes.data) {
        setProjects(projRes.data);
      }
      if (updatesRes.success && updatesRes.data) {
        setDailyUpdates(updatesRes.data);
      }
    } catch (err) {
      console.error('Error loading daily updates page data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uniqueUsers = useMemo(() => {
    const userMap = new Map<string, { id: string; name: string }>();

    // 1. Add from daily updates where role is Employee or Team Lead
    dailyUpdates.forEach((u) => {
      if (u.userId && u.userName) {
        const role = (u.userRole || '').toLowerCase().trim();
        if (role === 'employee' || role === 'team lead') {
          userMap.set(String(u.userId), { id: String(u.userId), name: u.userName });
        }
      }
    });

    // 2. Add from project members if role is Employee or Team Lead
    projects.forEach((p) => {
      if (Array.isArray(p.members)) {
        p.members.forEach((m: any) => {
          const id = String(m.userId || m.id || '');
          if (!id || !m.name) return;

          // Skip if project manager or client or logged-in manager/client
          if (p.managerId && String(p.managerId) === id) return;
          if (p.clientId && String(p.clientId) === id) return;
          if (user?.id && String(user.id) === id && (normalizedRole === 'manager' || normalizedRole === 'client')) return;

          const role = (m.role || '').toLowerCase().trim();
          if (role) {
            if (role === 'employee' || role === 'team lead') {
              if (!userMap.has(id)) {
                userMap.set(id, { id, name: m.name });
              }
            }
          } else {
            if (!userMap.has(id)) {
              userMap.set(id, { id, name: m.name });
            }
          }
        });
      }
    });

    return Array.from(userMap.values());
  }, [projects, dailyUpdates, user?.id, normalizedRole]);

  const selectedMemberName = useMemo(() => {
    if (userFilter === 'All') return null;
    const found = uniqueUsers.find((u) => u.id === userFilter);
    return found ? found.name : 'this member';
  }, [userFilter, uniqueUsers]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  const filteredUpdates = useMemo(() => {
    return dailyUpdates.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.summary?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchUser = item.userName?.toLowerCase().includes(q);
        const matchProj = item.projectName?.toLowerCase().includes(q);
        const matchTask = item.taskTitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchUser && !matchProj && !matchTask) {
          return false;
        }
      }

      if (projectFilter !== 'All' && item.projectId !== projectFilter) {
        return false;
      }

      if (userFilter !== 'All' && item.userId !== userFilter) {
        return false;
      }

      if (dateFilter === 'Today' && item.date !== todayStr) {
        return false;
      }

      if (dateFilter === 'Yesterday' && item.date !== yesterdayStr) {
        return false;
      }

      if (dateFilter === 'This Week') {
        const itemDate = new Date(item.date);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (itemDate < oneWeekAgo) {
          return false;
        }
      }

      return true;
    });
  }, [dailyUpdates, searchQuery, projectFilter, userFilter, dateFilter, todayStr, yesterdayStr]);

  const totalCount = filteredUpdates.length;
  const todayCount = dailyUpdates.filter((u) => u.date === todayStr).length;
  const todayHours = dailyUpdates
    .filter((u) => u.date === todayStr)
    .reduce((sum, u) => sum + (u.hoursSpent || 0), 0);
  const activeMembersToday = new Set(
    dailyUpdates.filter((u) => u.date === todayStr).map((u) => u.userId)
  ).size;

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const res = await deleteDailyUpdateAction(itemToDelete.id);
    if (res.success) {
      setDailyUpdates((prev) => prev.filter((u) => u.id !== itemToDelete.id));
      if (activeDetailItem?.id === itemToDelete.id) {
        setActiveDetailItem(null);
      }
      setItemToDelete(null);
    }
  };

  const canDeleteUpdate = (item: DailyUpdate) => {
    if (!user) return false;
    const r = userRole.toLowerCase();
    if (r === 'manager' || r === 'client') return false;
    const isOwner = String(item.userId) === String(user.id);
    const isAdmin = r === 'admin';
    const isTeamLead = r === 'team lead';
    return isOwner || isAdmin || isTeamLead;
  };

  return {
    user,
    userRole,
    normalizedRole,
    canAddUpdate,
    showMemberFilter,
    projects,
    dailyUpdates,
    loading,
    searchQuery,
    setSearchQuery,
    projectFilter,
    setProjectFilter,
    dateFilter,
    setDateFilter,
    userFilter,
    setUserFilter,
    activeTab,
    setActiveTab,
    isAddModalOpen,
    setIsAddModalOpen,
    activeDetailItem,
    setActiveDetailItem,
    itemToDelete,
    setItemToDelete,
    loadData,
    uniqueUsers,
    selectedMemberName,
    filteredUpdates,
    totalCount,
    todayCount,
    todayHours,
    activeMembersToday,
    handleDeleteConfirm,
    canDeleteUpdate,
  };
}
