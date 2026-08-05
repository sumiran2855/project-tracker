import { useState, useEffect, useMemo } from 'react';
import { getManagerTeamAction } from '@/actions/managers';
import type { TeamMember } from '@/types/my-team.types';


export function useMyTeamService() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    setLoading(true);
    setError(null);
    try {
      const res = await getManagerTeamAction();
      if (res.success && res.data) {
        setTeamMembers(res.data);
      } else {
        setError(res.error || 'Failed to retrieve team members.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred loading your team.');
    } finally {
      setLoading(false);
    }
  }

  // Filtered team members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [teamMembers, searchTerm, roleFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = teamMembers.length;
    const leadsCount = teamMembers.filter(m => m.role === 'Team Lead').length;
    const employeesCount = teamMembers.filter(m => m.role === 'Employee').length;
    
    // Unique project count across all team members
    const projectSet = new Set<string>();
    teamMembers.forEach(m => m.projects.forEach(p => projectSet.add(p.id)));
    const uniqueProjectsCount = projectSet.size;

    return {
      totalCount,
      leadsCount,
      employeesCount,
      uniqueProjectsCount
    };
  }, [teamMembers]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBgColor = (name: string) => {
    const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  return {
    teamMembers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    selectedMember,
    setSelectedMember,
    filteredMembers,
    stats,
    getInitials,
    getBgColor
  };
}
