import { apiClient, ApiError } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import type { DailyUpdate, CreateDailyUpdateInput } from '@/types/daily-updates.types';

export const dailyUpdatesApi = {
  getDailyUpdates: async (token: string, filters?: { projectId?: string; userId?: string; date?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.projectId) queryParams.set('projectId', filters.projectId);
      if (filters?.userId) queryParams.set('userId', filters.userId);
      if (filters?.date) queryParams.set('date', filters.date);

      const queryString = queryParams.toString();
      const path = queryString ? `${API_ROUTES.DAILY_UPDATES_BASE}?${queryString}` : API_ROUTES.DAILY_UPDATES_BASE;

      const res = await apiClient.get<{ success: boolean; data: { dailyUpdates: DailyUpdate[] } }>(
        path,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: 'Failed to fetch daily updates', statusCode: 500 } };
    }
  },

  createDailyUpdate: async (updateData: CreateDailyUpdateInput, token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { dailyUpdate: DailyUpdate } }>(
        API_ROUTES.DAILY_UPDATES_BASE,
        updateData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: 'Failed to create daily update', statusCode: 500 } };
    }
  },

  deleteDailyUpdate: async (id: string, token: string) => {
    try {
      const res = await apiClient.delete<{ success: boolean; message: string }>(
        `${API_ROUTES.DAILY_UPDATES_BASE}/${id}`,
        { token }
      );
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: 'Failed to delete daily update', statusCode: 500 } };
    }
  },
};
