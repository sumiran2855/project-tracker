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
import { useUser } from '@/contexts/UserContext';
import { updateProfileAction, inviteCollaboratorAction, removeCollaboratorAction } from '@/actions/auth';
import { getEmployeesAction, getProjectsAction } from '@/actions/projects';
import type { Employee } from '@/actions/projects';
import { getTasksByProjectAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';
import { fetchAllSprintData } from '@/lib/sprintLoader';

interface Member {
  name: string;
  initials: string;
  bg: string;
  role: string;
  email?: string;
  status?: 'Pending' | 'Accepted';
}

interface ProjectStats {
  assignedTasks: number;
  completedTasks: number;
  loggedIssues: number;
  projectsCount: number;

  totalProjects: number;
  totalEmployees: number;
  totalPendingTasks: number;
  totalActiveIssues: number;

  clientProjectsCount: number;
  clientTasksCount: number;
  clientEmployeesCount: number;
  clientIssuesCount: number;
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
  const { user, setUser } = useUser();

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || defaultProfile.name,
    email: user?.email || defaultProfile.email,
    role: user?.role || defaultProfile.role,
    location: user?.location || defaultProfile.location,
    department: user?.department || defaultProfile.department,
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : defaultProfile.joinDate,
    skills: user?.skills || defaultProfile.skills,
  });
  const [collabs, setCollabs] = useState<Member[]>(user?.collaborators && user.collaborators.length > 0 ? user.collaborators : defaultCollaborators);
  const [stats, setStats] = useState<ProjectStats>({
    assignedTasks: 0,
    completedTasks: 0,
    loggedIssues: 0,
    projectsCount: 0,
    totalProjects: 0,
    totalEmployees: 0,
    totalPendingTasks: 0,
    totalActiveIssues: 0,
    clientProjectsCount: 0,
    clientTasksCount: 0,
    clientEmployeesCount: 0,
    clientIssuesCount: 0
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

  const [systemEmployees, setSystemEmployees] = useState<Employee[]>([]);
  const [selectedColleagueId, setSelectedColleagueId] = useState('');
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('');
  const [newCollabBg, setNewCollabBg] = useState('bg-indigo-500');

  const [isAddingColleague, setIsAddingColleague] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showFeedback = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const isEmployeeOrLead = profile.role?.toLowerCase() === 'employee' || profile.role?.toLowerCase() === 'team lead';
  const isAdminOrManager = profile.role?.toLowerCase() === 'admin' || profile.role?.toLowerCase() === 'manager';
  const isClient = profile.role?.toLowerCase() === 'client';

  useEffect(() => {
    getEmployeesAction().then(res => {
      if (res.success && res.data) {
        setSystemEmployees(res.data);
      }
    });
  }, []);

  // Check for collabAccepted parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('collabAccepted') === 'true') {
        showFeedback('Success', 'Collaboration invitation accepted successfully!', 'success');
        // Clean URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Sync state with logged in user context
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        location: user.location || '',
        department: user.department || '',
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jul 2026',
        skills: user.skills || [],
      });
      if (user.collaborators) {
        setCollabs(user.collaborators);
      }
    }
  }, [user]);

  // Update dynamic counts
  useEffect(() => {
    async function fetchStats() {
      const { projects: loadedProjects, tasks: allTasks, issues: allIssues } = await fetchAllSprintData();

      // 3. Compute stats
      let assigned = 0;
      let completed = 0;
      let projectsCount = loadedProjects.length;

      // Admin/Manager
      let totalProjects = loadedProjects.length;
      let totalPendingTasks = 0;
      let totalActiveIssues = 0;

      // Client
      let clientProjectsCount = 0;
      let clientTasksCount = 0;
      const clientEmployees = new Set<string>();
      let clientIssuesCount = 0;

      const initials = profile.name
        ? profile.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
        : 'SC';

      allTasks.forEach((t: any) => {
        if (t.status !== 'Done') {
          totalPendingTasks++;
        }

        const isAssignee = t.assignees?.some((a: any) => a.name.toLowerCase() === profile.name.toLowerCase() || a.initials === initials);
        if (isAssignee) {
          assigned++;
          if (t.status === 'Done') {
            completed++;
          }
        }
      });

      totalActiveIssues = allIssues.filter((iss: any) => iss.status !== 'Closed').length;

      loadedProjects.forEach((p: any) => {
        const isMember = p.members?.some((m: any) => m.name.toLowerCase() === profile.name.toLowerCase());
        if (isMember) {
          clientProjectsCount++;

          const projectTasks = allTasks.filter(t => t.projectId === p.id);
          clientTasksCount += projectTasks.length;

          p.members?.forEach((m: any) => {
            if (m.name.toLowerCase() !== profile.name.toLowerCase()) {
              clientEmployees.add(m.name);
            }
          });
          projectTasks.forEach((t: any) => {
            t.assignees?.forEach((a: any) => {
              if (a.name.toLowerCase() !== profile.name.toLowerCase()) {
                clientEmployees.add(a.name);
              }
            });
          });

          const projIssues = allIssues.filter((iss: any) => iss.projectId === p.id && iss.status !== 'Closed');
          clientIssuesCount += projIssues.length;
        }
      });

      let loggedIssues = allIssues.filter((iss: any) =>
        iss.assignees?.some((a: any) => a.name.toLowerCase() === profile.name.toLowerCase() || a.initials === initials)
      ).length;

      // Filter employees: exclude Admins & Clients
      const activeEmployeesCount = systemEmployees.filter(emp =>
        ['employee', 'team lead', 'manager'].includes(emp.role?.toLowerCase() || '')
      ).length || 1;

      setStats({
        assignedTasks: assigned,
        completedTasks: completed,
        loggedIssues: loggedIssues,
        projectsCount,
        // Admin/Manager
        totalProjects,
        totalEmployees: activeEmployeesCount,
        totalPendingTasks,
        totalActiveIssues,
        // Client
        clientProjectsCount,
        clientTasksCount,
        clientEmployeesCount: clientEmployees.size,
        clientIssuesCount
      });
    }

    fetchStats();
  }, [profile.name, systemEmployees.length]);

  const openEditModal = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditRole(profile.role);
    setEditLocation(profile.location);
    setEditDepartment(profile.department);
    setEditSkills([...profile.skills]);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfileData = {
      name: editName,
      email: editEmail,
      role: editRole,
      location: editLocation,
      department: editDepartment,
      skills: editSkills,
      collaborators: collabs
    };

    const res = await updateProfileAction(updatedProfileData);
    if (res.success && res.data) {
      setUser(res.data);
      setIsEditModalOpen(false);
      showFeedback('Success', 'Profile saved successfully!', 'success');
    } else {
      showFeedback('Error', res.error || 'Failed to save profile', 'error');
    }
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

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColleagueId) return;

    const emp = systemEmployees.find(emp => emp.id === selectedColleagueId);
    if (!emp) return;

    setIsAddingColleague(true);
    try {
      const res = await inviteCollaboratorAction({
        email: emp.email,
        name: emp.name,
        role: emp.role,
        bg: emp.bg || 'bg-indigo-500',
        initials: emp.initials || emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
      });

      if (res.success && res.data) {
        setUser(res.data);
        setSelectedColleagueId('');
        setNewCollabName('');
        setNewCollabRole('');
        showFeedback('Success', `Invitation sent successfully to ${emp.name}!`, 'success');
      } else {
        showFeedback('Error', res.error || 'Failed to add collaborator', 'error');
      }
    } catch (err: any) {
      showFeedback('Error', err?.message || 'Failed to add collaborator', 'error');
    } finally {
      setIsAddingColleague(false);
    }
  };

  const handleDeleteCollab = async (nameToDelete: string) => {
    const collab = collabs.find(c => c.name === nameToDelete || c.email === nameToDelete);
    if (!collab?.email) return;

    const res = await removeCollaboratorAction(collab.email);
    if (res.success && res.data) {
      setUser(res.data);
      showFeedback('Success', 'Collaborator removed successfully!', 'success');
    } else {
      showFeedback('Error', res.error || 'Failed to delete collaborator', 'error');
    }
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
        {isEmployeeOrLead && (
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
        )}

        {isAdminOrManager && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Projects', value: stats.totalProjects, icon: Folder, tint: '#6366f1' },
              { label: 'Total Employees', value: stats.totalEmployees, icon: Users, tint: '#10b981' },
              { label: 'Tasks Pending', value: stats.totalPendingTasks, icon: Layers, tint: '#f59e0b' },
              { label: 'Active Issues', value: stats.totalActiveIssues, icon: AlertCircle, tint: '#ef4444' },
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
        )}

        {isClient && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Your Projects', value: stats.clientProjectsCount, icon: Folder, tint: '#6366f1' },
              { label: 'Project Tasks', value: stats.clientTasksCount, icon: Layers, tint: '#f59e0b' },
              { label: 'Active Employees', value: stats.clientEmployeesCount, icon: Users, tint: '#10b981' },
              { label: 'Project Issues', value: stats.clientIssuesCount, icon: AlertCircle, tint: '#ef4444' },
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
        )}

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
                {collabs.filter(c => c.status === 'Accepted').length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold">No collaborators listed.</p>
                ) : (
                  collabs.filter(c => c.status === 'Accepted').map((c) => (
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
              <Clock className="h-6 w-6 text-indigo-650 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Recent Login Details</p>
              {user?.lastLogin ? (
                <p className="text-[10px] text-slate-500 font-bold">
                  Last Login: {new Date(user.lastLogin).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400">First Session (Active)</p>
              )}
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
                    <select
                      required
                      value={selectedColleagueId}
                      onChange={e => {
                        const id = e.target.value;
                        setSelectedColleagueId(id);
                        const emp = systemEmployees.find(emp => emp.id === id);
                        if (emp) {
                          setNewCollabName(emp.name);
                          setNewCollabRole(emp.role);
                          setNewCollabBg(emp.bg || 'bg-indigo-500');
                        } else {
                          setNewCollabName('');
                          setNewCollabRole('');
                        }
                      }}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Select Colleague --</option>
                      {systemEmployees
                        .filter(emp => emp.email.toLowerCase() !== user?.email?.toLowerCase() && ['employee', 'team lead', 'manager', 'client'].includes(emp.role.toLowerCase()))
                        .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.role})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Role / Title</label>
                    <input
                      type="text"
                      required
                      readOnly
                      placeholder="Role will be auto-filled"
                      value={newCollabRole}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
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
                    disabled={isAddingColleague}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4 py-2 text-xs font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                  >
                    {isAddingColleague ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Colleague</span>
                      </>
                    )}
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
                    <div key={c.email || c.name} className="flex items-center justify-between border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn("h-7 w-7 rounded-lg text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-3xs", c.bg)}>
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-800 leading-tight truncate">{c.name}</p>
                            {c.status === 'Pending' ? (
                              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                Pending
                              </span>
                            ) : (
                              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Active
                              </span>
                            )}
                          </div>
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

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-scaleIn">
            <div className="flex flex-col items-center space-y-4">
              {feedbackModal.type === 'success' ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                  <AlertCircle className="h-6 w-6" />
                </div>
              )}
              <h3 className="text-lg font-black text-slate-800">{feedbackModal.title}</h3>
              <p className="text-xs text-slate-550 font-bold leading-relaxed">{feedbackModal.message}</p>
            </div>
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm",
                  feedbackModal.type === 'success' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-650 hover:bg-red-700"
                )}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
