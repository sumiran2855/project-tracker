import { apiClient, ApiError } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ERROR_CODES } from '@/constants/errorCodes';
import type { Project, Employee } from '@/types/projects.types';

export const projectsApi = {
  getProjects: async (token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { projects: Project[] } }>(
        API_ROUTES.PROJECTS_BASE,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_PROJECTS, statusCode: 500 } };
    }
  },

  getProjectById: async (id: string, token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { project: Project } }>(
        `${API_ROUTES.PROJECTS_BASE}/${id}`,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_PROJECT, statusCode: 500 } };
    }
  },

  createProject: async (projectData: Partial<Project>, token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { project: Project } }>(
        API_ROUTES.PROJECTS_BASE,
        projectData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CREATE_PROJECT, statusCode: 500 } };
    }
  },

  updateProject: async (id: string, projectData: Partial<Project>, token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { project: Project } }>(
        `${API_ROUTES.PROJECTS_BASE}/${id}`,
        projectData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_UPDATE_PROJECT, statusCode: 500 } };
    }
  },

  deleteProject: async (id: string, token: string) => {
    try {
      const res = await apiClient.delete(
        `${API_ROUTES.PROJECTS_BASE}/${id}`,
        { token }
      );
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_DELETE_PROJECT, statusCode: 500 } };
    }
  },

  getEmployees: async (token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { employees: Employee[] } }>(
        API_ROUTES.AUTH_EMPLOYEES,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_EMPLOYEES, statusCode: 500 } };
    }
  },
};
