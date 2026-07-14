'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Sliders, 
  Database, 
  Sparkles, 
  Check, 
  Save, 
  RefreshCcw,
  Volume2,
  Mail,
  Monitor,
  Layout,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { updateUserRoleAction } from '@/actions/auth';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface NotificationPrefs {
  emailTasks: boolean;
  emailDueDates: boolean;
  emailDigests: boolean;
  pushMentions: boolean;
  pushStatusChanges: boolean;
  soundAlerts: boolean;
}

interface WorkspacePrefs {
  defaultView: string;
  theme: 'light' | 'dark' | 'system';
  weekStart: 'Sunday' | 'Monday';
  accentTint: string;
}

const defaultProfile: UserProfile = {
  name: 'Sarah Connor',
  email: 'sarah.connor@cyberdyne.io',
  role: 'Workspace Administrator'
};

const defaultNotifications: NotificationPrefs = {
  emailTasks: true,
  emailDueDates: true,
  emailDigests: false,
  pushMentions: true,
  pushStatusChanges: false,
  soundAlerts: true
};

const defaultWorkspace: WorkspacePrefs = {
  defaultView: 'Dashboard',
  theme: 'light',
  weekStart: 'Monday',
  accentTint: '#6366f1' // indigo
};

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'workspace' | 'data' | 'testing'>('profile');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [notifications, setNotifications] = useState<NotificationPrefs>(defaultNotifications);
  const [workspace, setWorkspace] = useState<WorkspacePrefs>(defaultWorkspace);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load configuration
  useEffect(() => {
    const savedProfile = localStorage.getItem('pwt_settings_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedNotifications = localStorage.getItem('pwt_settings_notifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedWorkspace = localStorage.getItem('pwt_settings_workspace');
    if (savedWorkspace) setWorkspace(JSON.parse(savedWorkspace));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pwt_settings_profile', JSON.stringify(profile));
    localStorage.setItem('pwt_settings_notifications', JSON.stringify(notifications));
    localStorage.setItem('pwt_settings_workspace', JSON.stringify(workspace));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all workspace data? This will clear all projects, tasks, issues, and reset to defaults.')) {
      localStorage.clear();
      // Reload page to re-trigger default datasets
      window.location.reload();
    }
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>App Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30 shadow-xs">
              <Settings className="h-4.5 w-4.5" />
            </div>
            Settings Hub
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1">
            Personalize your workspace layout, configure alert triggers, and manage storage parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        
        {/* Navigation Tabs Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-1">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'workspace', label: 'Preferences', icon: Sliders },
            { id: 'data', label: 'Data & Storage', icon: Database },
            { id: 'testing', label: 'Testing Role Switcher', icon: RefreshCcw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer',
                  isActive 
                    ? 'bg-indigo-50/70 text-indigo-650' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[420px]">
          
          {/* Main Area */}
          <div className="p-6 sm:p-8 flex-1 space-y-6">
            
            {/* 1. Profile Section */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">User Profile Details</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage your identity credentials across pages.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Display Name</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Role / Designation</label>
                    <input
                      type="text"
                      required
                      value={profile.role}
                      onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 2. Notifications Section */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Alert triggers & Notifications</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle what triggers email digests and real-time alarms.</p>
                </div>

                <div className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email Communications</span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Toggle row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Task Assignments</p>
                        <p className="text-[10px] text-slate-400">Receive alert when you are assigned to a new track.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotification('emailTasks')}
                        className={cn(
                          'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          notifications.emailTasks ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span className={cn(
                          'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          notifications.emailTasks ? 'translate-x-4.5' : 'translate-x-0'
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Due Date Reminders</p>
                        <p className="text-[10px] text-slate-400">Get warnings of upcoming tasks close to deadlines.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotification('emailDueDates')}
                        className={cn(
                          'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          notifications.emailDueDates ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span className={cn(
                          'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          notifications.emailDueDates ? 'translate-x-4.5' : 'translate-x-0'
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Daily Activity Digest</p>
                        <p className="text-[10px] text-slate-400">A clean daily summary of tasks completed and logged bugs.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotification('emailDigests')}
                        className={cn(
                          'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          notifications.emailDigests ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span className={cn(
                          'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          notifications.emailDigests ? 'translate-x-4.5' : 'translate-x-0'
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 pt-2">
                    <Monitor className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Desktop & Alerts</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Direct Mentions</p>
                        <p className="text-[10px] text-slate-400">Show floating banners immediately on updates.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotification('pushMentions')}
                        className={cn(
                          'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          notifications.pushMentions ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span className={cn(
                          'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          notifications.pushMentions ? 'translate-x-4.5' : 'translate-x-0'
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Sound Alarms</p>
                        <p className="text-[10px] text-slate-400">Play audio ping when changes happen in the board.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleNotification('soundAlerts')}
                        className={cn(
                          'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          notifications.soundAlerts ? 'bg-indigo-600' : 'bg-slate-200'
                        )}
                      >
                        <span className={cn(
                          'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                          notifications.soundAlerts ? 'translate-x-4.5' : 'translate-x-0'
                        )} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3. Workspace Preferences Section */}
            {activeTab === 'workspace' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Workspace Preferences</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Control layout defaults and presentation formats.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Default Entry View</label>
                    <select
                      value={workspace.defaultView}
                      onChange={e => setWorkspace(w => ({ ...w, defaultView: e.target.value }))}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Dashboard">Dashboard</option>
                      <option value="Projects">Projects Hub</option>
                      <option value="Tasks Board">Tasks Board</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Theme Mode</label>
                    <select
                      value={workspace.theme}
                      onChange={e => setWorkspace(w => ({ ...w, theme: e.target.value as any }))}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode (Coming Soon)</option>
                      <option value="system">Follow System</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Calendar Week Starts On</label>
                    <select
                      value={workspace.weekStart}
                      onChange={e => setWorkspace(w => ({ ...w, weekStart: e.target.value as any }))}
                      className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Brand Accent Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      {['#6366f1', '#3b82f6', '#10b981', '#f43f5e', '#a855f7'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setWorkspace(w => ({ ...w, accentTint: color }))}
                          className="h-7 w-7 rounded-full border border-slate-200/50 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                          style={{ backgroundColor: color }}
                        >
                          {workspace.accentTint === color && (
                            <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Storage Section */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Workspace Storage Parameters</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Control browser storage parameters and hard factory resets.</p>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-5 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-800">Clear all records / Reset Sandbox</h4>
                      <p className="text-[10px] text-rose-600 mt-0.5 leading-relaxed">
                        This action is destructive and irreversible. Clicking this button clears all project, task, roadmap milestones, and configuration files stored inside your browser. Your sandbox environment will be immediately reset back to standard starter kits.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-rose-600/10 cursor-pointer transition-colors"
                  >
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin-reverse" />
                    <span>Reset Workspace Sandbox</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. Testing Role Switcher Section */}
            {activeTab === 'testing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Development Role Switcher</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dynamically switch between user roles to test Role-Based Access Control (RBAC) permissions.</p>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-150/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-650 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Current Active Role: <span className="text-indigo-650 font-black">{user?.role}</span></p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Changing your role will update your account in the database and active session context. Pages, sidebar options, and action triggers will immediately update to reflect your selected role's permissions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(['Employee', 'Admin', 'Manager', 'Team Lead', 'Client'] as const).map((r) => {
                    const isCurrent = user?.role?.toLowerCase() === r.toLowerCase();
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={async () => {
                          if (isCurrent) return;
                          const res = await updateUserRoleAction(r);
                          if (res.success) {
                            if (user) {
                              setUser({ ...user, role: r });
                            }
                            setSaveSuccess(true);
                            setTimeout(() => setSaveSuccess(false), 3000);
                          } else {
                            alert(res.error || 'Failed to update role');
                          }
                        }}
                        className={cn(
                          "flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer select-none",
                          isCurrent
                            ? "bg-white border-indigo-650 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-slate-50/50 border-slate-200 hover:border-slate-350 hover:bg-white"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={cn("text-xs font-black", isCurrent ? "text-indigo-650 font-extrabold" : "text-slate-700")}>
                            {r}
                          </span>
                          {isCurrent && (
                            <Check className="h-4 w-4 text-indigo-600" />
                          )}
                        </div>
                        <span className="text-[9px] text-slate-450 mt-1.5 font-medium leading-normal">
                          {r === 'Admin' && 'Full system control, manages all entities and configurations.'}
                          {r === 'Manager' && 'Manages projects, tasks, roadmaps, views reports and team workload.'}
                          {r === 'Team Lead' && 'Oversees teams, manages projects/tasks/roadmaps, views workload.'}
                          {r === 'Client' && 'Views/creates projects, views roadmaps and reports, manages client tasks.'}
                          {r === 'Employee' && 'Default role. Accesses assigned projects, tasks, roadmaps. Restricted reports.'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer bar */}
          {activeTab !== 'data' && activeTab !== 'testing' && (
            <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                    Settings saved successfully!
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
              >
                <Save className="h-4.5 w-4.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}

        </form>

      </div>

    </div>
  );
}
