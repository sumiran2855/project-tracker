import { apiClient, ApiError } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ERROR_CODES } from '@/constants/errorCodes';
import type { Task } from '@/types/tasks.types';

export const tasksApi = {
  getTasksByProject: async (projectId: string, token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { tasks: Task[] } }>(
        `${API_ROUTES.TASKS_PROJECT}/${projectId}`,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_TASKS, statusCode: 500 } };
    }
  },

  getAllTasks: async (token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { tasks: Task[] } }>(
        API_ROUTES.TASKS_BASE,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_TASKS, statusCode: 500 } };
    }
  },

  getTaskById: async (id: string, token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { task: Task } }>(
        `${API_ROUTES.TASKS_BASE}/${id}`,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_TASK, statusCode: 500 } };
    }
  },

  createTask: async (taskData: any, token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { task: Task } }>(
        API_ROUTES.TASKS_BASE,
        taskData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CREATE_TASK, statusCode: 500 } };
    }
  },

  updateTask: async (id: string, taskData: Partial<Task>, token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { task: Task } }>(
        `${API_ROUTES.TASKS_BASE}/${id}`,
        taskData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_UPDATE_TASK, statusCode: 500 } };
    }
  },

  deleteTask: async (id: string, token: string) => {
    try {
      const res = await apiClient.delete(
        `${API_ROUTES.TASKS_BASE}/${id}`,
        { token }
      );
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_DELETE_TASK, statusCode: 500 } };
    }
  },
};
