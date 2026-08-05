import { apiClient, ApiError } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ERROR_CODES } from '@/constants/errorCodes';
import type { Issue } from '@/types/issues.types';

export const issuesApi = {
  uploadAttachment: async (formData: FormData, token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
        API_ROUTES.ISSUES_UPLOAD,
        formData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_UPLOAD_IMAGE, statusCode: 500 } };
    }
  },

  getIssuesByProject: async (projectId: string, token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { issues: Issue[] } }>(
        `${API_ROUTES.ISSUES_PROJECT}/${projectId}`,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_ISSUES, statusCode: 500 } };
    }
  },

  getAllIssues: async (token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { issues: Issue[] } }>(
        API_ROUTES.ISSUES_BASE,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_ISSUES, statusCode: 500 } };
    }
  },

  getIssueById: async (id: string, token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { issue: Issue } }>(
        `${API_ROUTES.ISSUES_BASE}/${id}`,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_ISSUE, statusCode: 500 } };
    }
  },

  createIssue: async (issueData: any, token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { issue: Issue } }>(
        API_ROUTES.ISSUES_BASE,
        issueData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CREATE_ISSUE, statusCode: 500 } };
    }
  },

  updateIssue: async (id: string, issueData: Partial<Issue>, token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { issue: Issue } }>(
        `${API_ROUTES.ISSUES_BASE}/${id}`,
        issueData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_UPDATE_ISSUE, statusCode: 500 } };
    }
  },

  deleteIssue: async (id: string, token: string) => {
    try {
      const res = await apiClient.delete(
        `${API_ROUTES.ISSUES_BASE}/${id}`,
        { token }
      );
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_DELETE_ISSUE, statusCode: 500 } };
    }
  },
};
