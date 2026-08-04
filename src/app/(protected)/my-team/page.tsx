'use client';

import { AlertCircle } from 'lucide-react';
import { useMyTeamService } from '@/services/useMyTeamService';
import { TeamMemberProfileView } from '@/components/my-team/TeamMemberProfileView';
import { TeamListView } from '@/components/my-team/TeamListView';

export default function MyTeamPage() {
  const {
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
  } = useMyTeamService();

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 md:p-8 lg:p-10">
      {selectedMember ? (
        <TeamMemberProfileView
          member={selectedMember}
          onBack={() => setSelectedMember(null)}
          getInitials={getInitials}
          getBgColor={getBgColor}
        />
      ) : loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-55 px-4 py-3 text-xs font-bold text-red-650 border border-red-100 max-w-xl">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : (
        <TeamListView
          teamMembers={teamMembers}
          filteredMembers={filteredMembers}
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          setSelectedMember={setSelectedMember}
          getInitials={getInitials}
          getBgColor={getBgColor}
        />
      )}
    </div>
  );
}
