import { ArrowLeft, Briefcase, User, Mail, Award, FileText, Folder, TrendingUp } from 'lucide-react';
import type { TeamMemberProfileViewProps } from '@/types/my-team.types';

export function TeamMemberProfileView({
  member,
  onBack,
  getInitials,
  getBgColor,
}: TeamMemberProfileViewProps) {
  const initials = getInitials(member.name);
  const bg = getBgColor(member.name);
  const isLead = member.role === 'Team Lead';
  const hasSkills = !!(member.skills && member.skills.length > 0);

  return (
    <div className="animate-fadeUp">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-655 shadow-3xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Team List
      </button>

      {/* Profile Card Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 text-slate-808 shadow-3xs mb-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className={`h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-md ring-4 ring-slate-50 shrink-0 ${bg}`}>
            {initials}
          </div>

          <div className="text-center sm:text-left space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-850">{member.name}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-3xs ${
                isLead
                  ? 'bg-amber-50/70 border border-amber-200/50 text-amber-808'
                  : 'bg-emerald-50/70 border border-emerald-200/50 text-emerald-808'
              }`}>
                {isLead ? <Briefcase className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {member.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                {member.email}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Status
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Sidebar Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Skills Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-500" />
              Skills & Expertise
            </h2>
            <p className="text-xs text-slate-450 leading-relaxed">
              Core competencies and professional technical skillsets assigned to this team member.
            </p>
            {hasSkills ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {member.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center bg-indigo-50/50 border border-indigo-100/80 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 shadow-3xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <Award className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-[11px] font-bold text-slate-450">No skill set is yet set</p>
              </div>
            )}
          </div>

          {/* Profile Context / Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#F4A340]" />
              Team Assignment
            </h2>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-455">Department</span>
                <span className="font-bold text-slate-707">Engineering</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-455">Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Full-Time
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-slate-455">Location</span>
                <span className="font-bold text-slate-707">Remote / Hybrid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Project List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Folder className="h-4 w-4 text-indigo-500" />
                Assigned Project Portfolio
              </h2>
              <span className="text-xs font-bold text-slate-450 bg-slate-100 px-2.5 py-1 rounded-lg">
                {member.projects.length} Active {member.projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            </div>
            <p className="text-xs text-slate-455 leading-relaxed">
              Projects currently assigned to this user. They can manage tasks, collaborate on issues, and contribute to sprints within these work boards.
            </p>

            {member.projects.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <Folder className="h-8 w-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-650">No Projects Assigned</p>
                <p className="text-[10px] text-slate-400 mt-0.5">This user has not been added to any active project boards yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {member.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="group border border-slate-200 hover:border-indigo-400 hover:shadow-2xs p-4 rounded-2xl bg-slate-50/30 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-650 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-800">{proj.name}</h3>
                          <span className="text-[9px] text-slate-400 font-semibold">ID: {proj.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="font-bold text-slate-455">Board Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold border ${
                        proj.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : proj.status === 'In Progress'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workload Capacity Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Workload & Capacity Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Workboards</span>
                <span className="text-xl font-black text-slate-808 mt-1 block">{member.projects.length} Boards</span>
                <p className="text-[10px] text-slate-450 mt-1">Cross-project collaborations.</p>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Load</span>
                <span className="text-xl font-black text-slate-808 mt-1 block">Optimal</span>
                <p className="text-[10px] text-slate-450 mt-1">Balanced task distribution.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
