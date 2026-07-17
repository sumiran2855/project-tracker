'use server';

import { getSession } from '@/lib/auth/dal';
import { apiClient } from '@/lib/api/apiClient';
import { Member } from './projects';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Bug' | 'Task' | 'Improvement' | 'Security';
  projectId: string;
  projectName: string;
  dueDate: string;
  assignees: Member[];
  commentsCount: number;
  actualHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getIssuesByProjectAction(projectId: string): Promise<{ success: boolean; data?: Issue[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { issues: Issue[] } }>(
      `issues/project/${projectId}`,
      { token: session.token }
    );

    return { success: true, data: res.data.issues };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch issues' };
  }
}

export async function getIssueByIdAction(id: string): Promise<{ success: boolean; data?: Issue; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { issue: Issue } }>(
      `issues/${id}`,
      { token: session.token }
    );

    return { success: true, data: res.data.issue };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch issue' };
  }
}

export async function createIssueAction(issueData: any): Promise<{ success: boolean; data?: Issue; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.post<{ success: boolean; data: { issue: Issue } }>(
      'issues',
      issueData,
      { token: session.token }
    );

    return { success: true, data: res.data.issue };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to create issue' };
  }
}

export async function updateIssueAction(id: string, issueData: Partial<Issue>): Promise<{ success: boolean; data?: Issue; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { issue: Issue } }>(
      `issues/${id}`,
      issueData,
      { token: session.token }
    );

    return { success: true, data: res.data.issue };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update issue' };
  }
}

export async function deleteIssueAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    await apiClient.delete(
      `issues/${id}`,
      { token: session.token }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete issue' };
  }
}
