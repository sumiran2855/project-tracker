import { apiClient, ApiError } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ERROR_CODES } from '@/constants/errorCodes';
import type { SafeUser, WorkspacePrefs, NotificationPrefs } from '@/types/auth.types';

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { user: SafeUser; accessToken: string; refreshToken: string } }>(
        API_ROUTES.AUTH_LOGIN,
        { email, password }
      );
      return { data: res.data, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CONNECTION, statusCode: 500 } };
    }
  },

  register: async (userData: any) => {
    try {
      const res = await apiClient.post(API_ROUTES.AUTH_REGISTER, userData);
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CONNECTION, statusCode: 500 } };
    }
  },

  verifyEmail: async (email: string, code: string) => {
    try {
      const res = await apiClient.post(API_ROUTES.AUTH_VERIFY_EMAIL, { email, code });
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CONNECTION, statusCode: 500 } };
    }
  },

  resendVerification: async (email: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(API_ROUTES.AUTH_RESEND_VERIFICATION, { email });
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_CONNECTION, statusCode: 500 } };
    }
  },

  logout: async (token: string, refreshToken: string) => {
    try {
      const res = await apiClient.post(API_ROUTES.AUTH_LOGOUT, { refreshToken }, { token });
      return { data: res, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Failed to logout', statusCode: 500 } };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await apiClient.post(API_ROUTES.AUTH_FORGOT_PASSWORD, { email });
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_RESET_LINK, statusCode: 500 } };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const res = await apiClient.post(API_ROUTES.AUTH_RESET_PASSWORD, { token, password });
      return { data: res, error: null };
    } catch (error) {
      if (error instanceof ApiError) {
        return { data: null, error: { message: error.message, statusCode: error.statusCode } };
      }
      return { data: null, error: { message: ERROR_CODES.FAILED_RESET_PASSWORD, statusCode: 500 } };
    }
  },

  updateRole: async (role: string, token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
        API_ROUTES.AUTH_ROLE,
        { role },
        { token }
      );
      return { data: res.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_ROLE_UPDATE, statusCode: error?.statusCode || 500 } };
    }
  },

  updateNotificationState: async (readNotifications: string[], deletedNotifications: string[], token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
        API_ROUTES.AUTH_NOTIFICATIONS_STATE,
        { readNotifications, deletedNotifications },
        { token }
      );
      return { data: res.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_NOTIFICATION_UPDATE, statusCode: error?.statusCode || 500 } };
    }
  },

  updateProfile: async (profileData: any, token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
        API_ROUTES.AUTH_PROFILE,
        profileData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_PROFILE_UPDATE, statusCode: error?.statusCode || 500 } };
    }
  },

  inviteCollaborator: async (inviteeData: any, token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; data: { user: SafeUser } }>(
        API_ROUTES.AUTH_COLLAB_INVITE,
        inviteeData,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_INVITE_COLLAB, statusCode: error?.statusCode || 500 } };
    }
  },

  removeCollaborator: async (email: string, token: string) => {
    try {
      const res = await apiClient.delete<{ success: boolean; data: { user: SafeUser } }>(
        `${API_ROUTES.AUTH_COLLAB_REMOVE}?email=${encodeURIComponent(email)}`,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_REMOVE_COLLAB, statusCode: error?.statusCode || 500 } };
    }
  },

  updatePreferences: async (prefs: { workspacePrefs?: WorkspacePrefs; notificationPrefs?: NotificationPrefs }, token: string) => {
    try {
      const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
        API_ROUTES.AUTH_PREFERENCES,
        prefs,
        { token }
      );
      return { data: res.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_UPDATE_PREFS, statusCode: error?.statusCode || 500 } };
    }
  },

  generateClientInvite: async (token: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; token: string }>(
        API_ROUTES.AUTH_CLIENT_INVITE,
        {},
        { token }
      );
      return { data: res, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || ERROR_CODES.FAILED_GENERATE_INVITE, statusCode: error?.statusCode || 500 } };
    }
  },
};
