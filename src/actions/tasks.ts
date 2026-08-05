'use server';

import { getValidSession } from '@/helpers/auth.helpers';
import { tasksApi } from '@/api-services/tasks.api';
import { Task } from '@/types/tasks.types';

export async function getTasksByProjectAction(projectId: string): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await tasksApi.getTasksByProject(projectId, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.tasks };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getAllTasksAction(): Promise<{ success: boolean; data?: Task[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await tasksApi.getAllTasks(session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.tasks };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getTaskByIdAction(id: string): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await tasksApi.getTaskById(id, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.task };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function createTaskAction(taskData: any): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await tasksApi.createTask(taskData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.task };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function updateTaskAction(id: string, taskData: Partial<Task>): Promise<{ success: boolean; data?: Task; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await tasksApi.updateTask(id, taskData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.task };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function deleteTaskAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getValidSession();

    const { error } = await tasksApi.deleteTask(id, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}
