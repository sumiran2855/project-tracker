'use server';

import { getSession } from '@/lib/auth/dal';
import { apiClient } from '@/lib/api/apiClient';
import { Task } from '@/types/tasks.types';

export async function getTasksByProjectAction(projectId: string): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { tasks: Task[] } }>(
      `tasks/project/${projectId}`,
      { token: session.token }
    );

    return { success: true, data: res.data.tasks };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch tasks' };
  }
}

export async function getAllTasksAction(): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { tasks: Task[] } }>(
      'tasks',
      { token: session.token }
    );

    return { success: true, data: res.data.tasks };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch tasks' };
  }
}

export async function getTaskByIdAction(id: string): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { task: Task } }>(
      `tasks/${id}`,
      { token: session.token }
    );

    return { success: true, data: res.data.task };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch task' };
  }
}

export async function createTaskAction(taskData: any): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.post<{ success: boolean; data: { task: Task } }>(
      'tasks',
      taskData,
      { token: session.token }
    );

    return { success: true, data: res.data.task };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to create task' };
  }
}

export async function updateTaskAction(id: string, taskData: Partial<Task>): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { task: Task } }>(
      `tasks/${id}`,
      taskData,
      { token: session.token }
    );

    return { success: true, data: res.data.task };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update task' };
  }
}

export async function deleteTaskAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    await apiClient.delete(
      `tasks/${id}`,
      { token: session.token }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to delete task' };
  }
}
