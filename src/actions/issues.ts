'use server';

import { getValidSession } from '@/helpers/auth.helpers';
import { issuesApi } from '@/api-services/issues.api';
import { Issue } from '@/types/issues.types';

export async function uploadIssueAttachmentAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await issuesApi.uploadAttachment(formData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data!.url };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getIssuesByProjectAction(projectId: string): Promise<{ success: boolean; data?: Issue[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await issuesApi.getIssuesByProject(projectId, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.issues };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getIssueByIdAction(id: string): Promise<{ success: boolean; data?: Issue; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await issuesApi.getIssueById(id, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.issue };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function createIssueAction(issueData: any): Promise<{ success: boolean; data?: Issue; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await issuesApi.createIssue(issueData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.issue };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function updateIssueAction(id: string, issueData: Partial<Issue>): Promise<{ success: boolean; data?: Issue; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await issuesApi.updateIssue(id, issueData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.issue };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function deleteIssueAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getValidSession();

    const { error } = await issuesApi.deleteIssue(id, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}
