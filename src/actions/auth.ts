'use server';

import { redirect } from 'next/navigation';
import { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/validations/auth.validation';
import { createSession, deleteSession } from '@/lib/auth/session';
import { DEFAULT_LOGIN_REDIRECT, LOGIN_ROUTE } from '@/constants/routes';
import { apiClient, ApiError } from '@/lib/api/apiClient';
import type { 
  LoginActionState, 
  SignupActionState, 
  ForgotPasswordActionState, 
  ResetPasswordActionState,
  SafeUser
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

  try {
    const res = await apiClient.post<{ success: boolean; data: { user: SafeUser; token: string } }>(
      'auth/login',
      { email, password }
    );
    await createSession(res.data.user, res.data.token, remember);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: 'Failed to connect to authentication server.' };
  }

  redirect(DEFAULT_LOGIN_REDIRECT);
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

  try {
    const res = await apiClient.post<{ success: boolean; data: { user: SafeUser; token: string } }>(
      'auth/register',
      { name: fullName, email, password }
    );
    await createSession(res.data.user, res.data.token, false);
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message };
    }
    return { message: 'Failed to connect to authentication server.' };
  }

  redirect(DEFAULT_LOGIN_REDIRECT);
}

export async function logoutAction(): Promise<never> {
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
    
    await createSession(res.data.user, session.token, false);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update user role' };
  }
}
