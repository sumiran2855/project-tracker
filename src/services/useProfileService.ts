import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useUser } from '@/contexts/UserContext';
import { 
  updateProfileAction, 
  inviteCollaboratorAction, 
  removeCollaboratorAction, 
  generateClientInviteAction 
} from '@/actions/auth';
import { getEmployeesAction } from '@/actions/projects';
import { fetchAllSprintData } from '@/lib/sprintLoader';
import type { Member, ProjectStats, UserProfile } from '@/types/profile.types';
import { Employee } from '@/types/projects.types';

export function useProfileService() {
  const { user, setUser } = useUser();

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    location: user?.location || "",
    department: user?.department || "",
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "",
    skills: user?.skills || [],
  });
  const [collabs, setCollabs] = useState<Member[]>(user?.collaborators && user.collaborators.length > 0 ? user.collaborators : []);
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
  const isAdmin = profile.role?.toLowerCase() === 'admin';
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

      // Compute stats
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

  const handleCopyClientInviteLink = async () => {
    try {
      const res = await generateClientInviteAction();
      if (res.success && res.token) {
        const inviteUrl = `${window.location.origin}/signup?inviteToken=${res.token}`;
        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Client invitation link copied to clipboard!');
      } else {
        toast.error(res.error || 'Failed to generate client invite link.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to copy client invite link.');
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

  return {
    user,
    profile,
    collabs,
    stats,
    isEditModalOpen,
    setIsEditModalOpen,
    isCollabModalOpen,
    setIsCollabModalOpen,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editRole,
    setEditRole,
    editLocation,
    setEditLocation,
    editDepartment,
    setEditDepartment,
    editSkills,
    setEditSkills,
    newSkillText,
    setNewSkillText,
    systemEmployees,
    selectedColleagueId,
    setSelectedColleagueId,
    newCollabName,
    setNewCollabName,
    newCollabRole,
    setNewCollabRole,
    newCollabBg,
    setNewCollabBg,
    isAddingColleague,
    feedbackModal,
    setFeedbackModal,
    showFeedback,
    isEmployeeOrLead,
    isAdminOrManager,
    isAdmin,
    isClient,
    initials,
    openEditModal,
    handleSaveProfile,
    handleAddSkill,
    handleRemoveSkill,
    handleAddCollaborator,
    handleDeleteCollab,
    handleCopyClientInviteLink
  };
}
