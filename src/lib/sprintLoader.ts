import { getSprintSummaryAction, Project } from '@/actions/projects';
import { Task } from '@/actions/tasks';
import { Issue } from '@/actions/issues';

interface SprintDataResult {
  tasks: Task[];
  issues: Issue[];
  projects: Project[];
}

let sprintDataCache: { data: SprintDataResult; timestamp: number } | null = null;
let activeSprintPromise: Promise<SprintDataResult> | null = null;
const SPRINT_CACHE_TTL_MS = 5000; // 5 seconds cache

export function clearSprintDataCache() {
  sprintDataCache = null;
  activeSprintPromise = null;
}

export async function fetchAllSprintData(): Promise<SprintDataResult> {
  const now = Date.now();

  // Return cached result if valid
  if (sprintDataCache && now - sprintDataCache.timestamp < SPRINT_CACHE_TTL_MS) {
    return sprintDataCache.data;
  }

  // Deduplicate in-flight promises
  if (activeSprintPromise) {
    return activeSprintPromise;
  }

  activeSprintPromise = (async () => {
    try {
      const summaryRes = await getSprintSummaryAction();
      if (summaryRes.success && summaryRes.data) {
        const result: SprintDataResult = {
          projects: summaryRes.data.projects || [],
          tasks: summaryRes.data.tasks || [],
          issues: summaryRes.data.issues || []
        };
        sprintDataCache = { data: result, timestamp: Date.now() };
        return result;
      }
    } catch (err) {
      console.error("Failed to fetch sprint summary from backend", err);
    }

    // Fallback to localStorage if backend is unreachable or returns empty
    let loadedProjects: Project[] = [];
    let tasks: Task[] = [];
    let issues: Issue[] = [];

    if (typeof window !== 'undefined') {
      try {
        const storedProjects = localStorage.getItem('pwt_projects');
        if (storedProjects) loadedProjects = JSON.parse(storedProjects);

        const storedIssues = localStorage.getItem('pwt_issues');
        if (storedIssues) issues = JSON.parse(storedIssues);

        loadedProjects.forEach(proj => {
          const storedTasksKey = `pwt_tasks_project_${proj.id}`;
          const storedTasksStr = localStorage.getItem(storedTasksKey);
          if (storedTasksStr) {
            const projTasks: Task[] = JSON.parse(storedTasksStr);
            tasks.push(...projTasks.map(t => ({ ...t, projectId: proj.id, projectName: proj.name })));
          }
        });
      } catch (e) {
        console.error("Error reading fallback sprint data from localStorage", e);
      }
    }

    const fallbackResult: SprintDataResult = { tasks, issues, projects: loadedProjects };
    sprintDataCache = { data: fallbackResult, timestamp: Date.now() };
    return fallbackResult;
  })().finally(() => {
    activeSprintPromise = null;
  });

  return activeSprintPromise;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'task' | 'issue' | 'project' | 'system';
  rawDate: Date;
}

export function getRelativeTimeString(dateStr: string | Date | undefined): string {
  if (!dateStr) return 'Unknown time';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown time';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

export async function fetchLiveNotifications(): Promise<NotificationItem[]> {
  const { tasks, issues, projects } = await fetchAllSprintData();
  
  const gathered: NotificationItem[] = [];

  // Read state lists from localStorage if we are in client side
  let readIds: string[] = [];
  let deletedIds: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const readStored = localStorage.getItem('pwt_read_notifications');
      if (readStored) readIds = JSON.parse(readStored);
      const deletedStored = localStorage.getItem('pwt_deleted_notifications');
      if (deletedStored) deletedIds = JSON.parse(deletedStored);
    } catch (e) {
      console.error(e);
    }
  }

  // Helper to add notification if not deleted
  const addNotif = (notif: Omit<NotificationItem, 'read'>) => {
    if (deletedIds.includes(notif.id)) return;
    gathered.push({
      ...notif,
      read: readIds.includes(notif.id)
    });
  };

  // 1. Projects activity
  projects.forEach(p => {
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      if (!isNaN(d.getTime())) {
        addNotif({
          id: `project_created_${p.id}`,
          title: 'Project Created',
          description: `New workspace "${p.name}" initialized.`,
          time: getRelativeTimeString(p.createdAt),
          type: 'project',
          rawDate: d
        });
      }
    }
    if (p.updatedAt && p.updatedAt !== p.createdAt) {
      const d = new Date(p.updatedAt);
      if (!isNaN(d.getTime())) {
        addNotif({
          id: `project_updated_${p.id}_${p.updatedAt}`,
          title: 'Project Updated',
          description: `Project "${p.name}" status updated to ${p.status}.`,
          time: getRelativeTimeString(p.updatedAt),
          type: 'project',
          rawDate: d
        });
      }
    }
  });

  // 2. Tasks activity
  tasks.forEach(task => {
    if (task.createdAt) {
      const d = new Date(task.createdAt);
      if (!isNaN(d.getTime())) {
        addNotif({
          id: `task_created_${task.id}`,
          title: 'New Task Added',
          description: `New task "${task.title}" added to ${task.projectName || 'Project'}.`,
          time: getRelativeTimeString(task.createdAt),
          type: 'task',
          rawDate: d
        });
      }
    }
    if (task.status === 'Done' && task.updatedAt) {
      const d = new Date(task.updatedAt);
      if (!isNaN(d.getTime())) {
        addNotif({
          id: `task_completed_${task.id}`,
          title: 'Task Completed',
          description: `Task "${task.title}" completed.`,
          time: getRelativeTimeString(task.updatedAt),
          type: 'task',
          rawDate: d
        });
      }
    }
  });

  // 3. Issues activity
  issues.forEach(issue => {
    if (issue.createdAt) {
      const d = new Date(issue.createdAt);
      if (!isNaN(d.getTime())) {
        addNotif({
          id: `issue_created_${issue.id}`,
          title: 'New Issue Reported',
          description: `New issue "${issue.title}" created in ${issue.projectName || 'Project'}.`,
          time: getRelativeTimeString(issue.createdAt),
          type: 'issue',
          rawDate: d
        });
      }
    }
    if ((issue.status === 'Resolved' || issue.status === 'Closed') && issue.updatedAt) {
      const d = new Date(issue.updatedAt);
      if (!isNaN(d.getTime())) {
        addNotif({
          id: `issue_resolved_${issue.id}`,
          title: 'Issue Resolved',
          description: `Issue "${issue.title}" resolved and marked ${issue.status}.`,
          time: getRelativeTimeString(issue.updatedAt),
          type: 'issue',
          rawDate: d
        });
      }
    }
  });

  // Sort by rawDate descending
  return gathered.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
}
