'use server';

import { getValidSession } from '@/helpers/auth.helpers';
import { projectsApi } from '@/api-services/projects.api';
import { tasksApi } from '@/api-services/tasks.api';
import { issuesApi } from '@/api-services/issues.api';
import { Project, Employee } from '@/types/projects.types';

function filterAdminMembersFromProjects(projects: Project[], employees?: Employee[]): Project[] {
  const adminNames = new Set(
    (employees || [])
      .filter((e) => e.role?.toLowerCase() === 'admin')
      .map((e) => e.name.toLowerCase())
  );

  return projects.map((p) => ({
    ...p,
    members: (p.members || []).filter((m: any) => {
      if (m.role?.toLowerCase() === 'admin') return false;
      if (m.name && adminNames.has(m.name.toLowerCase())) return false;
      return true;
    }),
  }));
}

export async function getProjectsAction(): Promise<{ success: boolean; data?: Project[]; error?: string }> {
  try {
    const session = await getValidSession();

    const [projectsRes, empRes] = await Promise.all([
      projectsApi.getProjects(session.token),
      projectsApi.getEmployees(session.token),
    ]);

    if (projectsRes.error) {
      return { success: false, error: projectsRes.error.message };
    }

    const employees = empRes.data?.employees || [];
    const projects = filterAdminMembersFromProjects(projectsRes.data!.projects || [], employees);

    return { success: true, data: projects };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getProjectByIdAction(id: string): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const session = await getValidSession();

    const [projectRes, empRes] = await Promise.all([
      projectsApi.getProjectById(id, session.token),
      projectsApi.getEmployees(session.token),
    ]);

    if (projectRes.error) {
      return { success: false, error: projectRes.error.message };
    }

    const employees = empRes.data?.employees || [];
    const project = filterAdminMembersFromProjects([projectRes.data!.project], employees)[0];

    return { success: true, data: project };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function createProjectAction(projectData: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await projectsApi.createProject(projectData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.project };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function updateProjectAction(id: string, projectData: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await projectsApi.updateProject(id, projectData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.project };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getEmployeesAction(): Promise<{ success: boolean; data?: Employee[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await projectsApi.getEmployees(session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.employees };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function deleteProjectAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getValidSession();

    const { error } = await projectsApi.deleteProject(id, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getSprintSummaryAction(): Promise<{
  success: boolean;
  data?: { projects: Project[]; tasks: any[]; issues: any[] };
  error?: string;
}> {
  try {
    const session = await getValidSession();

    const [projectsRes, tasksRes, issuesRes, empRes] = await Promise.all([
      projectsApi.getProjects(session.token),
      tasksApi.getAllTasks(session.token),
      issuesApi.getAllIssues(session.token),
      projectsApi.getEmployees(session.token)
    ]);

    const employees = empRes.data?.employees || [];
    const rawProjects = projectsRes.data?.projects || [];
    const projects = filterAdminMembersFromProjects(rawProjects, employees);
    const tasks = tasksRes.data?.tasks || [];
    const issues = issuesRes.data?.issues || [];

    return {
      success: true,
      data: {
        projects,
        tasks,
        issues
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch sprint summary' };
  }
}
