import React from 'react';

export interface ProjectInfo {
  id: string;
  name: string;
  status: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  skills?: string[];
  projects: ProjectInfo[];
  totalProjects: number;
}

export interface TeamListViewProps {
  teamMembers: TeamMember[];
  filteredMembers: TeamMember[];
  stats: {
    totalCount: number;
    leadsCount: number;
    employeesCount: number;
    uniqueProjectsCount: number;
  };
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  setSelectedMember: (member: TeamMember) => void;
  getInitials: (name: string) => string;
  getBgColor: (name: string) => string;
}

export interface TeamMemberProfileViewProps {
  member: TeamMember;
  onBack: () => void;
  getInitials: (name: string) => string;
  getBgColor: (name: string) => string;
}
