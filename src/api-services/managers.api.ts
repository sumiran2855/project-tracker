import { apiClient, ApiError } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ERROR_CODES } from '@/constants/errorCodes';

export const managersApi = {
  getManagers: async (token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { managers: any[] } }>(
        API_ROUTES.MANAGERS_BASE,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_MANAGERS, statusCode: 500 } };
    }
  },

  updateAssignments: async (managerId: string, employeeIds: string[], teamLeadIds: string[], token: string) => {
    try {
      const res = await apiClient.put(
        `${API_ROUTES.MANAGERS_BASE}/${managerId}/assignments`,
        { employeeIds, teamLeadIds },
        { token }
      );
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_UPDATE_ASSIGNMENTS, statusCode: 500 } };
    }
  },

  getManagerTeam: async (token: string) => {
    try {
      const res = await apiClient.get<{ success: boolean; data: { team: any[] } }>(
        API_ROUTES.MANAGERS_MY_TEAM,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_FETCH_TEAM, statusCode: 500 } };
    }
  },
};
