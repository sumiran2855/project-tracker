import { getProjectsAction } from '@/actions/projects';
import { getTasksByProjectAction, Task } from '@/actions/tasks';
import { getIssuesByProjectAction, Issue } from '@/actions/issues';

export async function fetchAllSprintData() {
  let loadedProjects: any[] = [];
  
  try {
    const projRes = await getProjectsAction();
    if (projRes.success && projRes.data) {
      loadedProjects = projRes.data;
    }
  } catch (err) {
    console.error("Failed to fetch projects from backend", err);
  }

  if (loadedProjects.length === 0 && typeof window !== 'undefined') {
    const storedProjects = localStorage.getItem('pwt_projects');
    if (storedProjects) {
      try {
        loadedProjects = JSON.parse(storedProjects);
      } catch (e) {
        console.error(e);
      }
    }
  }

  // Fetch tasks for all projects
  const tasksPromises = loadedProjects.map(async (proj) => {
    try {
      const tasksRes = await getTasksByProjectAction(proj.id);
      if (tasksRes.success && tasksRes.data) {
        return tasksRes.data.map(task => ({
          ...task,
          projectId: proj.id,
          projectName: proj.name
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch tasks for project ${proj.id}`, err);
    }

    // Fallback to localStorage
    const storedTasksKey = `pwt_tasks_project_${proj.id}`;
    const storedTasksStr = typeof window !== 'undefined' ? localStorage.getItem(storedTasksKey) : null;
    let projTasks: Task[] = [];
    if (storedTasksStr) {
      try {
        projTasks = JSON.parse(storedTasksStr);
      } catch (e) {
        console.error(e);
      }
    }
    return projTasks.map(task => ({
      ...task,
      projectId: proj.id,
      projectName: proj.name
    }));
  });

  const allTasksResults = await Promise.all(tasksPromises);
  const tasks = allTasksResults.flat();

  // Fetch issues for all projects
  let issues: Issue[] = [];
  try {
    const issuesPromises = loadedProjects.map((p: any) => getIssuesByProjectAction(p.id));
    const results = await Promise.all(issuesPromises);
    results.forEach(r => {
      if (r.success && r.data) {
        issues.push(...r.data);
      }
    });
  } catch (err) {
    console.error("Failed to fetch issues from backend", err);
  }

  if (issues.length === 0 && typeof window !== 'undefined') {
    const storedIssues = localStorage.getItem('pwt_issues');
    if (storedIssues) {
      try {
        issues = JSON.parse(storedIssues);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return { tasks, issues, projects: loadedProjects };
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
