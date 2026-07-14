'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, usePermission } from '@/contexts/UserContext';
import { 
  BarChart3, 
  TrendingUp, 
  Folder, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  FileText,
  Printer,
  RefreshCw,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Member {
  name: string;
  initials: string;
  bg: string;
}

interface Project {
  id: string;
  name: string;
  dueDate: string;
  members: Member[];
  status: string;
}

interface Task {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  assignees: Member[];
}

interface ProjectStats {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

interface PriorityStats {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface TeamStats {
  name: string;
  initials: string;
  bg: string;
  taskCount: number;
  load: number; // percentage
}

// Fallbacks
const defaultProjects: Project[] = [
  { id: '1', name: 'SaaS Onboarding Flow', dueDate: '2026-07-25', members: [], status: 'In Progress' },
  { id: '2', name: 'API Authentication V2', dueDate: '2026-07-18', members: [], status: 'In Review' },
  { id: '3', name: 'Corporate Marketing Site', dueDate: '2026-08-05', members: [], status: 'In Progress' },
  { id: '4', name: 'Mobile App Wireframes', dueDate: '2026-06-30', members: [], status: 'Completed' },
  { id: '5', name: 'Billing & Stripe Integration', dueDate: '2026-08-20', members: [], status: 'Planning' },
  { id: '6', name: 'Realtime Analytics Dash', dueDate: '2026-09-10', members: [], status: 'Planning' },
];

const fallbackTasks: Record<string, Task[]> = {
  '1': [
    { id: 't1', title: 'Task 1', status: 'Done', priority: 'High', dueDate: '2026-07-06', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
    { id: 't2', title: 'Task 2', status: 'In Progress', priority: 'Medium', dueDate: '2026-07-12', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
    { id: 't3', title: 'Task 3', status: 'To Do', priority: 'Low', dueDate: '2026-07-20', assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }] },
    { id: 't4', title: 'Task 4', status: 'In Review', priority: 'High', dueDate: '2026-07-15', assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }] },
    { id: 't5', title: 'Task 5', status: 'To Do', priority: 'Urgent', dueDate: '2026-07-24', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
  ],
  '2': [
    { id: 't6', title: 'Task 6', status: 'Done', priority: 'High', dueDate: '2026-07-04', assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }] },
    { id: 't7', title: 'Task 7', status: 'In Progress', priority: 'Urgent', dueDate: '2026-07-12', assignees: [{ name: 'Alex Mercer', initials: 'AM', bg: 'bg-violet-500' }, { name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }] },
    { id: 't8', title: 'Task 8', status: 'To Do', priority: 'Medium', dueDate: '2026-07-18', assignees: [{ name: 'John Doe', initials: 'JD', bg: 'bg-emerald-500' }] },
  ],
  '3': [
    { id: 't9', title: 'Task 9', status: 'In Progress', priority: 'Medium', dueDate: '2026-07-28', assignees: [{ name: 'Sarah Connor', initials: 'SC', bg: 'bg-indigo-500' }] },
    { id: 't10', title: 'Task 10', status: 'To Do', priority: 'Low', dueDate: '2026-08-01', assignees: [{ name: 'Emma Watson', initials: 'EW', bg: 'bg-rose-500' }] },
  ]
};

const defaultHours = [
  { day: 'Mon', hours: 12 },
  { day: 'Tue', hours: 16 },
  { day: 'Wed', hours: 10 },
  { day: 'Thu', hours: 15 },
  { day: 'Fri', hours: 18 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 2 },
];

export default function ReportsPage() {
  const { user } = useUser();
  const router = useRouter();
  const canViewReports = usePermission('report:view');

  useEffect(() => {
    if (user && !canViewReports) {
      router.push('/dashboard');
    }
  }, [user, canViewReports, router]);

  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  
  // Chart states
  const [projectStatsList, setProjectStatsList] = useState<ProjectStats[]>([]);
  const [priorityStatsList, setPriorityStatsList] = useState<PriorityStats[]>([]);
  const [teamStatsList, setTeamStatsList] = useState<TeamStats[]>([]);
  const [timeLogs, setTimeLogs] = useState(defaultHours);

  // Load from local storage and compute report metrics
  const loadReportData = () => {
    // 1. Get Projects
    let loadedProjects: Project[] = [];
    const storedProjects = localStorage.getItem('pwt_projects');
    if (storedProjects) {
      try {
        loadedProjects = JSON.parse(storedProjects);
      } catch (e) {
        console.error(e);
      }
    }
    if (loadedProjects.length === 0) {
      loadedProjects = defaultProjects;
    }
    setProjectsCount(loadedProjects.length);

    // 2. Loop and compile tasks
    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    const projectStats: ProjectStats[] = [];

    // Priority accumulation
    let urgent = 0, high = 0, medium = 0, low = 0;

    // Team allocation accumulation
    const memberTaskMap: Record<string, { initials: string; bg: string; count: number }> = {};
    const today = new Date().toISOString().split('T')[0];

    loadedProjects.forEach(proj => {
      const storedTasksKey = `pwt_tasks_project_${proj.id}`;
      const storedTasksStr = localStorage.getItem(storedTasksKey);
      let projTasks: Task[] = [];
      
      if (storedTasksStr) {
        try {
          projTasks = JSON.parse(storedTasksStr);
        } catch (e) {
          console.error(e);
        }
      } else {
        projTasks = fallbackTasks[proj.id] || [];
      }

      const projTotal = projTasks.length;
      const projCompleted = projTasks.filter(t => t.status === 'Done').length;
      
      totalTasks += projTotal;
      completedTasks += projCompleted;

      // Project stats
      projectStats.push({
        id: proj.id,
        name: proj.name,
        totalTasks: projTotal,
        completedTasks: projCompleted,
        progress: projTotal > 0 ? Math.round((projCompleted / projTotal) * 100) : 0
      });

      // Task attributes
      projTasks.forEach(task => {
        // Priority
        if (task.priority === 'Urgent') urgent++;
        else if (task.priority === 'High') high++;
        else if (task.priority === 'Medium') medium++;
        else low++;

        // Overdue status (not completed and past due date)
        if (task.status !== 'Done' && task.dueDate && task.dueDate !== 'No Due Date' && task.dueDate < today) {
          overdueTasks++;
        }

        // Assignees workload
        task.assignees.forEach(assignee => {
          if (memberTaskMap[assignee.name]) {
            memberTaskMap[assignee.name].count++;
          } else {
            memberTaskMap[assignee.name] = {
              initials: assignee.initials,
              bg: assignee.bg,
              count: 1
            };
          }
        });
      });
    });

    setTasksCount(totalTasks);
    setCompletedTasksCount(completedTasks);
    setOverdueTasksCount(overdueTasks);
    setCompletionRate(totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
    setProjectStatsList(projectStats);

    // Calculate priority statistics
    const prioritySum = urgent + high + medium + low;
    setPriorityStatsList([
      { name: 'Urgent', value: urgent, color: 'stroke-red-500 fill-red-500 text-red-500', percentage: prioritySum > 0 ? Math.round((urgent / prioritySum) * 100) : 0 },
      { name: 'High', value: high, color: 'stroke-orange-500 fill-orange-500 text-orange-500', percentage: prioritySum > 0 ? Math.round((high / prioritySum) * 100) : 0 },
      { name: 'Medium', value: medium, color: 'stroke-indigo-500 fill-indigo-500 text-indigo-500', percentage: prioritySum > 0 ? Math.round((medium / prioritySum) * 100) : 0 },
      { name: 'Low', value: low, color: 'stroke-slate-400 fill-slate-400 text-slate-400', percentage: prioritySum > 0 ? Math.round((low / prioritySum) * 100) : 0 },
    ]);

    // Calculate team allocation load (assuming max task capacity = 8 tasks)
    const teamStats: TeamStats[] = [];
    Object.keys(memberTaskMap).forEach(name => {
      const info = memberTaskMap[name];
      teamStats.push({
        name,
        initials: info.initials,
        bg: info.bg,
        taskCount: info.count,
        load: Math.min(100, Math.round((info.count / 8) * 100))
      });
    });
    setTeamStatsList(teamStats.sort((a, b) => b.taskCount - a.taskCount));
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Donut chart stroke dashes calculations
  let accumulatedPercent = 0;

  if (!user || !canViewReports) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Reports Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Workspace Metrics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 shadow-xs border border-indigo-100/30">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            Workspace Insights
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1">
            Realtime workload metrics, team capacity status, and sprint progression statistics.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={loadReportData}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-650 shadow-3xs cursor-pointer active:scale-98 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer active:scale-98 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, subtext: `${completedTasksCount} of ${tasksCount} tasks completed`, icon: TrendingUp, tint: 'bg-emerald-50 text-emerald-700 border-emerald-100/50' },
          { label: 'Active Initiatives', value: projectsCount, subtext: 'Total projects in pipeline', icon: Folder, tint: 'bg-indigo-50 text-indigo-700 border-indigo-100/50' },
          { label: 'Remaining Tasks', value: tasksCount - completedTasksCount, subtext: 'Tasks to be processed', icon: CheckSquare, tint: 'bg-blue-50 text-blue-700 border-blue-100/50' },
          { label: 'Overdue Bottlenecks', value: overdueTasksCount, subtext: 'Tasks past their due date', icon: AlertCircle, tint: cn(overdueTasksCount > 0 ? 'bg-red-50 text-red-700 border-red-150/40' : 'bg-slate-50 text-slate-500 border-slate-200/50') },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <div className={cn("p-1.5 rounded-lg border", stat.tint)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bento grid reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Project Workload Allocation (Double bar chart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800">Project Workload Allocation</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Completed vs total task loads per project workspace</p>
          </div>

          <div className="space-y-4.5 flex-1 mt-4">
            {projectStatsList.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">No project metrics to plot.</div>
            ) : (
              projectStatsList.map(proj => (
                <div key={proj.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 truncate max-w-[200px]">{proj.name}</span>
                    <span className="text-slate-500 font-semibold">{proj.completedTasks} / {proj.totalTasks} Tasks ({proj.progress}%)</span>
                  </div>
                  
                  {/* Custom CSS progress bar */}
                  <div className="h-3 w-full bg-slate-50 border border-slate-150 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-lg transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Task Priorities distribution (SVG Donut Chart) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Task Priorities</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Breakdown of operational tasks by priority level</p>
          </div>

          <div className="flex flex-col items-center justify-center my-6 relative">
            
            {/* SVG Donut */}
            <svg width="150" height="150" viewBox="0 0 150 150" className="rotate-270">
              <circle cx="75" cy="75" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
              {priorityStatsList.map((stat, idx) => {
                const radius = 50;
                const circumference = 2 * Math.PI * radius; // ~314.16
                const strokeDash = (stat.percentage / 100) * circumference;
                const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
                
                // Accumulate percentage for the next offset
                accumulatedPercent += stat.percentage;

                return (
                  <circle
                    key={idx}
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="transparent"
                    className={cn("transition-all duration-500", stat.color.split(' ')[0])}
                    strokeWidth="18"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap={stat.percentage > 0 ? "round" : "butt"}
                  />
                );
              })}
            </svg>
            
            {/* Center Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-800">{tasksCount}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Tasks</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[10px] font-bold">
            {priorityStatsList.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", stat.color.split(' ')[1])} />
                <span className="text-slate-500">{stat.name}:</span>
                <span className="text-slate-800 font-black ml-auto">{stat.value} ({stat.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Timesheet Logs (Vertical Bar Graph) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Logged Hours</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Workspace team activity log hours per day</p>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 mt-8 border-b border-slate-150 pb-2">
            {timeLogs.map((log, idx) => {
              const maxHours = Math.max(...timeLogs.map(t => t.hours));
              const heightPercent = maxHours > 0 ? (log.hours / maxHours) * 100 : 0;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[9px] font-black text-slate-700">{log.hours}h</span>
                  <div className="w-full bg-slate-50 border border-slate-150 rounded-t-lg h-36 flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-650 rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{log.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Team Workload Capacity */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">Team Allocation Capacity</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Tasks workload status per team member</p>
          </div>

          <div className="space-y-4 flex-1 mt-6">
            {teamStatsList.length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-slate-400">No member allocations tracked.</div>
            ) : (
              teamStatsList.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-3xs", member.bg)}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-800 truncate">{member.name}</span>
                      <span className="text-slate-450">{member.taskCount} tasks ({member.load}%)</span>
                    </div>
                    {/* Capacity progress */}
                    <div className="h-1.5 w-full bg-slate-50 border border-slate-150 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          member.taskCount > 6 ? 'bg-red-500' :
                          member.taskCount > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${member.load}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
