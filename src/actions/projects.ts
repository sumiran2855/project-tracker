'use server';

import { getSession } from '@/lib/auth/dal';
import { apiClient, ApiError } from '@/lib/api/apiClient';

export interface Member {
  userId?: string;
  name: string;
  initials: string;
  bg: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'In Review' | 'Completed';
  progress: number;
  tags: string[];
  tasksCount: number;
  completedTasks: number;
  commentsCount: number;
  attachmentsCount: number;
  dueDate: string;
  members: Member[];
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
  startDate?: string;
  targetQuarter?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  bg: string;
}

export async function getProjectsAction(): Promise<{ success: boolean; data?: Project[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { projects: Project[] } }>(
      'projects',
      { token: session.token }
    );

    return { success: true, data: res.data.projects };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch projects' };
  }
}

export async function getProjectByIdAction(id: string): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { project: Project } }>(
      `projects/${id}`,
      { token: session.token }
    );

    return { success: true, data: res.data.project };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch project' };
  }
}

export async function createProjectAction(projectData: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.post<{ success: boolean; data: { project: Project } }>(
      'projects',
      projectData,
      { token: session.token }
    );

    return { success: true, data: res.data.project };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to create project' };
  }
}

export async function updateProjectAction(id: string, projectData: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { project: Project } }>(
      `projects/${id}`,
      projectData,
      { token: session.token }
    );

    return { success: true, data: res.data.project };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update project' };
  }
}

export async function getEmployeesAction(): Promise<{ success: boolean; data?: Employee[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { employees: Employee[] } }>(
      'auth/employees',
      { token: session.token }
    );

    return { success: true, data: res.data.employees };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch employees' };
  }
}

export async function deleteProjectAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    await apiClient.delete(
      `projects/${id}`,
      { token: session.token }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete project' };
  }
}
