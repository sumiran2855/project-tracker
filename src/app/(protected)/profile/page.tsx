'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  MapPin,
  Briefcase,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Folder,
  Layers,
  Code,
  Users,
  Clock,
  X,
  Plus,
  Trash2,
  Sliders,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Member {
  name: string;
  initials: string;
  bg: string;
  role: string;
}

interface ProjectStats {
  assignedTasks: number;
  completedTasks: number;
  loggedIssues: number;
  projectsCount: number;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  department: string;
  joinDate: string;
  skills: string[];
}

const defaultProfile: UserProfile = {
  name: 'Sarah Connor',
  email: 'sarah.connor@cyberdyne.io',
  role: 'Workspace Administrator',
  location: 'Los Angeles, CA',
  department: 'Product Development',
  joinDate: 'Jan 2026',
  skills: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'Agile Planning', 'UI Design']
};

const defaultCollaborators: Member[] = [
  { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500', role: 'Senior Developer' },
  { name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500', role: 'DevOps Lead' },
  { name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500', role: 'UI/UX Designer' }
];

const bgOptions = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-sky-500'
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [collabs, setCollabs] = useState<Member[]>(defaultCollaborators);
  const [stats, setStats] = useState<ProjectStats>({
    assignedTasks: 18,
    completedTasks: 12,
    loggedIssues: 3,
    projectsCount: 4
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  // Temporary edit form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkillText, setNewSkillText] = useState('');

  // New collaborator states
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('');
  const [newCollabBg, setNewCollabBg] = useState('bg-indigo-500');

  // Load from localstorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('pwt_settings_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          role: parsed.role || prev.role,
          location: parsed.location || prev.location,
          department: parsed.department || prev.department,
          joinDate: parsed.joinDate || prev.joinDate,
          skills: parsed.skills || prev.skills
        }));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCollabs = localStorage.getItem('pwt_profile_collaborators');
    if (savedCollabs) {
      try {
        setCollabs(JSON.parse(savedCollabs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update dynamic counts
  useEffect(() => {
    let assigned = 0;
    let completed = 0;
    let projectsCount = 0;

    const storedProjects = localStorage.getItem('pwt_projects');
    if (storedProjects) {
      try {
        const parsedProj = JSON.parse(storedProjects);
        projectsCount = parsedProj.length;

        parsedProj.forEach((p: any) => {
          const projectTasks = localStorage.getItem(`pwt_tasks_project_${p.id}`);
          if (projectTasks) {
            const parsedTasks = JSON.parse(projectTasks);
            parsedTasks.forEach((t: any) => {
              const isAssignee = t.assignees?.some((a: any) => a.name.toLowerCase() === profile.name.toLowerCase() || a.initials === 'SC');
              if (isAssignee) {
                assigned++;
                if (t.status === 'Done') {
                  completed++;
                }
              }
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
    }

    let loggedIssues = 0;
    const storedIssues = localStorage.getItem('pwt_issues');
    if (storedIssues) {
      try {
        const parsedIssues = JSON.parse(storedIssues);
        loggedIssues = parsedIssues.filter((iss: any) =>
          iss.assignees?.some((a: any) => a.name.toLowerCase() === profile.name.toLowerCase() || a.initials === 'SC')
        ).length;
      } catch (e) {
        console.error(e);
      }
    }

    setStats({
      assignedTasks: assigned || 18,
      completedTasks: completed || 12,
      loggedIssues: loggedIssues || 3,
      projectsCount: projectsCount || 4
    });
  }, [profile.name]);

  const openEditModal = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditRole(profile.role);
    setEditLocation(profile.location);
    setEditDepartment(profile.department);
    setEditSkills([...profile.skills]);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...profile,
      name: editName,
      email: editEmail,
      role: editRole,
      location: editLocation,
      department: editDepartment,
      skills: editSkills
    };

    setProfile(updatedProfile);
    localStorage.setItem('pwt_settings_profile', JSON.stringify(updatedProfile));
    setIsEditModalOpen(false);

    // If active in dashboard, force matching states
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkillText.trim()) {
      e.preventDefault();
      if (!editSkills.includes(newSkillText.trim())) {
        setEditSkills([...editSkills, newSkillText.trim()]);
      }
      setNewSkillText('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter(s => s !== skillToRemove));
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName.trim() || !newCollabRole.trim()) return;

    const initials = newCollabName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newCollab: Member = {
      name: newCollabName,
      initials,
      bg: newCollabBg,
      role: newCollabRole
    };

    const updatedCollabs = [...collabs, newCollab];
    setCollabs(updatedCollabs);
    localStorage.setItem('pwt_profile_collaborators', JSON.stringify(updatedCollabs));

    // Reset inputs
    setNewCollabName('');
    setNewCollabRole('');
    setNewCollabBg('bg-indigo-500');
  };

  const handleDeleteCollab = (nameToDelete: string) => {
    const updatedCollabs = collabs.filter(c => c.name !== nameToDelete);
    setCollabs(updatedCollabs);
    localStorage.setItem('pwt_profile_collaborators', JSON.stringify(updatedCollabs));
  };

  const initials = profile.name
    ? profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'SC';

  return (
    <>
      <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-650 to-violet-650 p-6 sm:p-8 text-white overflow-hidden shadow-md">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-32 w-32 bg-indigo-400/20 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              {/* Avatar circle */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-3xl font-black tracking-tight text-white shadow-inner">
                {initials}
              </div>

              <div className="text-center sm:text-left space-y-1">
                <h1 className="text-2xl font-black tracking-tight">{profile.name}</h1>
                <p className="text-sm font-semibold text-indigo-100 flex items-center justify-center sm:justify-start gap-1.5">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  {profile.role}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-white/80">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {profile.department}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Member since {profile.joinDate}</span>
                </div>
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4.5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-800/10 shrink-0"
            >
              <Sliders className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Stats Counter Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Assigned Tasks', value: stats.assignedTasks, icon: Layers, tint: '#64748b' },
            { label: 'Completed Tracks', value: stats.completedTasks, icon: CheckCircle2, tint: '#10b981' },
            { label: 'Issues Managed', value: stats.loggedIssues, icon: AlertCircle, tint: '#ef4444' },
            { label: 'Active Projects', value: stats.projectsCount, icon: Folder, tint: '#6366f1' },
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

                {/* Text */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Info & Skills */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Details Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-4.5 w-4.5 text-indigo-650" />
                <h2 className="text-sm font-black text-slate-800">Primary Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="text-slate-800 break-all flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {profile.email}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">System Access Role</span>
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Skill Tag list */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Code className="h-4.5 w-4.5 text-indigo-650" />
                <h2 className="text-sm font-black text-slate-800">Skills & Competencies</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <span className="text-xs text-slate-400 font-bold">No skills added yet.</span>
                ) : (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-1.5 text-[10px] font-bold text-indigo-750"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Collaborators Column */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-indigo-650" />
                  <h2 className="text-sm font-black text-slate-800">Frequent Collaborators</h2>
                </div>
                <button
                  onClick={() => setIsCollabModalOpen(true)}
                  className="h-6.5 w-6.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-650 cursor-pointer transition-colors border border-indigo-100/40"
                  title="Manage Collaborators"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                {collabs.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold">No collaborators listed.</p>
                ) : (
                  collabs.map((c) => (
                    <div key={c.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("h-8 w-8 rounded-xl text-xs font-black text-white flex items-center justify-center shrink-0 shadow-2xs", c.bg)}>
                          {c.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{c.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{c.role}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCollab(c.name)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs text-center space-y-2">
              <Clock className="h-6 w-6 text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Recent Login Details</p>
              <p className="text-[10px] text-slate-400">Current Session: 127.0.0.1 (Active)</p>
            </div>
          </div>

        </div>

      </div>

      {/* modal - Edit Profile & Collaborators Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-scaleIn">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650">
                  <Sliders className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800">Edit Profile & Directory</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable container for forms */}
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6">

              {/* Primary Info Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="text-xs font-black text-indigo-650 uppercase tracking-widest border-b border-slate-100 pb-1">
                  Primary Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Display Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Role / Title</label>
                    <input
                      type="text"
                      required
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Location</label>
                    <input
                      type="text"
                      required
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Department</label>
                    <input
                      type="text"
                      required
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Skills tags field */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Skills (Press Enter to add)</label>
                  <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-250 bg-slate-50/50 p-2 min-h-12 items-center">
                    {editSkills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-lg text-slate-700">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-red-500">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Type & Enter..."
                      value={newSkillText}
                      onChange={e => setNewSkillText(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="bg-transparent border-none text-xs outline-none text-slate-800 ml-1 flex-1 min-w-[80px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Profile & Skills</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Footer buttons to close modal */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                Close Dialog
              </button>
            </div>

          </div>
        </div>
      )}

      {/* modal - Manage Collaborators Modal */}
      {isCollabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-scaleIn">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800">Manage Collaborators</h3>
              </div>
              <button
                onClick={() => setIsCollabModalOpen(false)}
                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-150 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List & Add Forms */}
            <div className="space-y-6">

              {/* Add form */}
              <form onSubmit={handleAddCollaborator} className="space-y-4">
                <div className="text-xs font-black text-indigo-650 uppercase tracking-widest border-b border-slate-100 pb-1">
                  Add Collaborator
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Colleague Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newCollabName}
                      onChange={e => setNewCollabName(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Role / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DevOps Lead"
                      value={newCollabRole}
                      onChange={e => setNewCollabRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Avatar Accent color</label>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {bgOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCollabBg(color)}
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110",
                            color
                          )}
                        >
                          {newCollabBg === color && (
                            <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4 py-2 text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Colleague</span>
                  </button>
                </div>
              </form>

              {/* Current List inside modal to easily view and delete */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Current Directory ({collabs.length})
                </div>

                <div className="max-h-[160px] overflow-y-auto space-y-2.5 pr-1">
                  {collabs.map((c) => (
                    <div key={c.name} className="flex items-center justify-between border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("h-7 w-7 rounded-lg text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-3xs", c.bg)}>
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{c.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{c.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCollab(c.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCollabModalOpen(false)}
                className="px-4.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
