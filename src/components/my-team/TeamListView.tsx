import { Sparkles, Users, Search, Briefcase, User, Folder, Mail, ArrowRight } from 'lucide-react';
import type { TeamMember } from '@/services/useMyTeamService';

interface TeamListViewProps {
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

export function TeamListView({
  teamMembers,
  filteredMembers,
  stats,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  setSelectedMember,
  getInitials,
  getBgColor,
}: TeamListViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fadeDown">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Management Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 shadow-xs border border-indigo-100/30">
              <Users className="h-5 w-5" />
            </div>
            My Assigned Team
          </h1>
          <p className="text-xs text-slate-455 font-medium mt-1">
            Track workload, roles, and project portfolios of team leads and employees assigned to you.
          </p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-300 hover:border-indigo-400/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Members</span>
            <span className="text-3xl font-black text-slate-850 tracking-tight block mt-1">{stats.totalCount}</span>
            <span className="text-[10px] text-slate-455 font-bold block mt-0.5">active users</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-605">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-300 hover:border-amber-400/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Team Leads</span>
            <span className="text-3xl font-black text-slate-850 tracking-tight block mt-1">{stats.leadsCount}</span>
            <span className="text-[10px] text-slate-455 font-bold block mt-0.5">leads</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-605">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-300 hover:border-emerald-400/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Employees</span>
            <span className="text-3xl font-black text-slate-850 tracking-tight block mt-1">{stats.employeesCount}</span>
            <span className="text-[10px] text-slate-455 font-bold block mt-0.5">employees</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-605">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-300 hover:border-sky-400/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Projects</span>
            <span className="text-3xl font-black text-slate-850 tracking-tight block mt-1">{stats.uniqueProjectsCount}</span>
            <span className="text-[10px] text-slate-455 font-bold block mt-0.5">shared boards</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-605">
            <Folder className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-indigo-550 placeholder-slate-400 font-semibold"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-505 whitespace-nowrap">Filter Role:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['All', 'Team Lead', 'Employee'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-white text-slate-800 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {role === 'All' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-3xs">
          <Users className="h-12 w-12 text-slate-355 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-700">No Team Members Found</h3>
          {teamMembers.length === 0 ? (
            <p className="text-xs text-slate-450 mt-1 max-w-md mx-auto">
              You do not currently have any Team Leads or Employees assigned. Please coordinate with an Administrator to assign members to your team.
            </p>
          ) : (
            <p className="text-xs text-slate-450 mt-1">
              Adjust your search query or role filter to see your assigned team members.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map(member => {
            const initials = getInitials(member.name);
            const bg = getBgColor(member.name);
            const isLead = member.role === 'Team Lead';

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-6 shadow-3xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 cursor-pointer group/card flex flex-col space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white text-base font-black shadow-sm ring-4 ring-slate-50 transition-transform duration-300 group-hover/card:scale-105 shrink-0 ${bg}`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-850 group-hover/card:text-indigo-650 transition-colors truncate">
                        {member.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1 truncate">
                        <Mail className="h-3 w-3 text-slate-350" /> {member.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider shrink-0 shadow-3xs ${
                    isLead
                      ? 'bg-amber-50/70 border border-amber-200/50 text-amber-800'
                      : 'bg-emerald-50/70 border border-emerald-200/50 text-emerald-800'
                  }`}>
                    {isLead ? <Briefcase className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                    {member.role}
                  </span>
                </div>

                {/* Status & Workload Capacity Meter */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-slate-450 uppercase tracking-wider text-[9px]">Active status</span>
                    </div>
                    <span className="text-slate-707">Projects: {member.totalProjects}</span>
                  </div>
                  
                  {/* Workload Fill Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLead ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((member.totalProjects / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Projects Tag Cloud */}
                <div className="flex-1 flex flex-col pt-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Project Portfolio</p>
                  {member.projects.length === 0 ? (
                    <span className="inline-flex max-w-fit items-center gap-1 rounded-lg bg-slate-50 border border-slate-150 px-2.5 py-1.5 text-[9px] font-bold text-slate-400 shadow-3xs">
                      No assigned projects
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {member.projects.slice(0, 3).map(proj => (
                        <span
                          key={proj.id}
                          className="inline-flex items-center gap-1 bg-slate-50/50 border border-slate-200/60 px-2 py-1 rounded-lg text-[9px] font-extrabold text-slate-655 shadow-3xs hover:border-indigo-250 transition-colors"
                        >
                          <Folder className="h-3 w-3 text-indigo-550" />
                          {proj.name}
                          <span className={`text-[7px] px-1 py-0.5 rounded font-black border ml-1 ${
                            proj.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-105'
                              : proj.status === 'In Progress'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-105'
                              : 'bg-amber-50 text-amber-707 border-amber-105'
                          }`}>{proj.status}</span>
                        </span>
                      ))}
                      {member.projects.length > 3 && (
                        <span className="inline-flex items-center bg-slate-105 px-2 py-1 rounded-lg text-[9px] font-extrabold text-slate-500 shadow-3xs">
                          +{member.projects.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Click CTA Indicator */}
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-650 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-2 group-hover/card:translate-x-0 ml-auto pt-1">
                  <span>View Profile details</span>
                  <ArrowRight className="h-3 w-3 animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
