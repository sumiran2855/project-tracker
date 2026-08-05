'use server';

import { redirect } from 'next/navigation';
import { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema, VerifyEmailSchema } from '@/validations/auth.validation';
import { createSession, deleteSession } from '@/lib/auth/session';
import { LOGIN_ROUTE } from '@/constants/routes';
import { authApi } from '@/api-services/auth.api';
import { getValidSession, updateLocalSession } from '@/helpers/auth.helpers';
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

  const { data, error } = await authApi.login(email, password);

  if (error) {
    if (error.statusCode === 403) {
      redirectToVerify = true;
    } else {
      return { message: error.message };
    }
  } else if (data) {
    user = data.user;
    await createSession(data.user, data.accessToken, data.refreshToken, remember);
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

  const { error } = await authApi.register({ name: fullName, email, password, inviteToken });

  if (error) {
    return { message: error.message };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}&registered=true`);
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

  const { error } = await authApi.verifyEmail(email, code);

  if (error) {
    return { message: error.message };
  }

  redirect('/login?verifySuccess=true');
}

export async function resendVerificationAction(
  email: string
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await authApi.resendVerification(email);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: data?.message || 'Verification code resent successfully' };
}

export async function logoutAction(): Promise<never> {
  try {
    const session = await getValidSession();
    await authApi.logout(session.token, session.refreshToken as string);
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

  const { error } = await authApi.forgotPassword(email);

  if (error) {
    return { message: error.message };
  }

  return {
    successMessage: 'If that email is registered, we have sent a link to reset your password.',
  };
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

  const { error } = await authApi.resetPassword(token, password);

  if (error) {
    return { message: error.message };
  }

  redirect('/login?resetSuccess=true');
}

export async function updateUserRoleAction(role: string): Promise<{ success: boolean; error?: string }> {
  const { getCurrentUser } = await import('@/lib/auth/dal');

  try {
    const user = await getCurrentUser();
    const session = await getValidSession();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await authApi.updateRole(role, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    await updateLocalSession(data!.user, session.token, session.refreshToken);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function updateNotificationStateAction(
  readNotifications: string[],
  deletedNotifications: string[]
): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await authApi.updateNotificationState(readNotifications, deletedNotifications, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    await updateLocalSession(data!.user, session.token, session.refreshToken);

    return { success: true, data: data!.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
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
  try {
    const session = await getValidSession();

    const { data, error } = await authApi.updateProfile(profileData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    await updateLocalSession(data!.user, session.token, session.refreshToken);

    return { success: true, data: data!.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function inviteCollaboratorAction(inviteeData: {
  email: string;
  name: string;
  role: string;
  bg: string;
  initials: string;
}): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await authApi.inviteCollaborator(inviteeData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    await updateLocalSession(data!.user, session.token, session.refreshToken);

    return { success: true, data: data!.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function removeCollaboratorAction(email: string): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await authApi.removeCollaborator(email, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    await updateLocalSession(data!.user, session.token, session.refreshToken);

    return { success: true, data: data!.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function updatePreferencesAction(prefs: {
  workspacePrefs?: WorkspacePrefs;
  notificationPrefs?: NotificationPrefs;
}): Promise<{ success: boolean; data?: SafeUser; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await authApi.updatePreferences(prefs, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    await updateLocalSession(data!.user, session.token, session.refreshToken);

    return { success: true, data: data!.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function generateClientInviteAction(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await authApi.generateClientInvite(session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, token: data!.token };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}
