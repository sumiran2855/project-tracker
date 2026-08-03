'use server';

import { redirect } from 'next/navigation';
import { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema, VerifyEmailSchema } from '@/validations/auth.validation';
import { createSession, deleteSession } from '@/lib/auth/session';
import { LOGIN_ROUTE } from '@/constants/routes';
import { apiClient, ApiError } from '@/lib/api/apiClient';
import { getDefaultViewRoute } from '@/lib/utils';
import type {
  LoginActionState,
  SignupActionState,
  ForgotPasswordActionState,
  ResetPasswordActionState,
  VerifyEmailActionState,
  SafeUser,
  WorkspacePrefs,
  NotificationPrefs
} from '@/types/auth.types';

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  const remember = formData.get('remember') === 'on';

  let user: SafeUser | null = null;
  let redirectToVerify = false;

  try {
    const res = await apiClient.post<{ success: boolean; data: { user: SafeUser; accessToken: string; refreshToken: string } }>(
      'auth/login',
      { email, password }
    );
    user = res.data.user;
    await createSession(res.data.user, res.data.accessToken, res.data.refreshToken, remember);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 403) {
        redirectToVerify = true;
      } else {
        return { message: error.message };
      }
    } else {
      return { message: 'Failed to connect to authentication server.' };
    }
  }

  if (redirectToVerify) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&unverify=true`);
  }

  const redirectRoute = getDefaultViewRoute(user?.workspacePrefs?.defaultView);
  redirect(redirectRoute);
}

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const validatedFields = SignupSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, password } = validatedFields.data;
  const inviteToken = formData.get('inviteToken')?.toString() || undefined;
  let signupSuccess = false;

  try {
    await apiClient.post(
      'auth/register',
      { name: fullName, email, password, inviteToken }
    );
    signupSuccess = true;
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: 'Failed to connect to authentication server.' };
  }

  if (signupSuccess) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}&registered=true`);
  }
}

export async function verifyEmailAction(
  _prevState: VerifyEmailActionState,
  formData: FormData
): Promise<VerifyEmailActionState> {
  const validatedFields = VerifyEmailSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, code } = validatedFields.data;

  try {
    await apiClient.post('auth/verify-email', { email, code });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: 'Failed to connect to authentication server.' };
  }

  redirect('/login?verifySuccess=true');
}

export async function resendVerificationAction(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      'auth/resend-verification',
      { email }
    );
    return { success: true, message: res.message || 'Verification code resent successfully' };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Failed to connect to authentication server.' };
  }
}

export async function logoutAction(): Promise<never> {
  const { getSession } = await import('@/lib/auth/dal');
  try {
    const session = await getSession();
    if (session?.token && session?.refreshToken) {
      await apiClient.post(
        'auth/logout',
        { refreshToken: session.refreshToken },
        { token: session.token }
      );
    }
  } catch (error) {
    console.error("Error in logoutAction:", error);
  }
  await deleteSession();
  redirect(LOGIN_ROUTE);
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> {
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    await apiClient.post('auth/forgot-password', { email });
    return {
      successMessage: 'If that email is registered, we have sent a link to reset your password.',
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: 'Failed to request password reset link.' };
  }
}

export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    await apiClient.post('auth/reset-password', { token, password });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: 'Failed to reset password.' };
  }

  redirect('/login?resetSuccess=true');
}

export async function updateUserRoleAction(role: string): Promise<{ success: boolean; error?: string }> {
  const { getCurrentUser, getSession } = await import('@/lib/auth/dal');

  try {
    const user = await getCurrentUser();
    const session = await getSession();
    if (!user || !session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
      'auth/role',
      { role },
      { token: session.token }
    );

    await createSession(res.data.user, session.token, session.refreshToken, false);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update user role' };
  }
}

export async function updateNotificationStateAction(
  readNotifications: string[],
  deletedNotifications: string[]
): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const { getSession } = await import('@/lib/auth/dal');

  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
      'auth/notifications/state',
      { readNotifications, deletedNotifications },
      { token: session.token }
    );

    // Update local next.js session too so that next.js session cookie is up to date
    await createSession(res.data.user, session.token, session.refreshToken, false);

    return { success: true, data: res.data.user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update notification state' };
  }
}

export async function updateProfileAction(profileData: {
  name: string;
  email: string;
  role: string;
  location: string;
  department: string;
  skills: string[];
  collaborators: { name: string; initials: string; bg: string; role: string }[];
}): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const { getSession } = await import('@/lib/auth/dal');

  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
      'auth/profile',
      profileData,
      { token: session.token }
    );

    // Update local next.js session too so that next.js session cookie is up to date
    await createSession(res.data.user, session.token, session.refreshToken, false);

    return { success: true, data: res.data.user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update profile' };
  }
}

export async function inviteCollaboratorAction(inviteeData: {
  email: string;
  name: string;
  role: string;
  bg: string;
  initials: string;
}): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const { getSession } = await import('@/lib/auth/dal');

  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.post<{ success: boolean; data: { user: SafeUser } }>(
      'auth/collab/invite',
      inviteeData,
      { token: session.token }
    );

    // Update local next.js session too so that next.js session cookie is up to date
    await createSession(res.data.user, session.token, session.refreshToken, false);

    return { success: true, data: res.data.user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to send collaboration invitation' };
  }
}

export async function removeCollaboratorAction(email: string): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const { getSession } = await import('@/lib/auth/dal');

  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.delete<{ success: boolean; data: { user: SafeUser } }>(
      `auth/collab/remove?email=${encodeURIComponent(email)}`,
      { token: session.token }
    );

    // Update local next.js session too so that next.js session cookie is up to date
    await createSession(res.data.user, session.token, session.refreshToken, false);

    return { success: true, data: res.data.user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to remove collaborator' };
  }
}

export async function updatePreferencesAction(prefs: {
  workspacePrefs?: WorkspacePrefs;
  notificationPrefs?: NotificationPrefs;
}): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  const { getSession } = await import('@/lib/auth/dal');

  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.put<{ success: boolean; data: { user: SafeUser } }>(
      'auth/preferences',
      prefs,
      { token: session.token }
    );

    await createSession(res.data.user, session.token, session.refreshToken, false);

    return { success: true, data: res.data.user };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update preferences' };
  }
}

export async function generateClientInviteAction(): Promise<{ success: boolean; token?: string; error?: string }> {
  const { getSession } = await import('@/lib/auth/dal');

  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.post<{ success: boolean; token: string }>(
      'auth/client-invite',
      {},
      { token: session.token }
    );

    return { success: true, token: res.token };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to generate invitation link' };
  }
}
