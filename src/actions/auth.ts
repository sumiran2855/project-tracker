'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/validations/auth.validation';
import { authenticateUser, registerUser } from '@/services/user.service';
import { findUserByEmail, updateUserResetToken, findUserByResetToken, updateUserPassword } from '@/repositories/user.repository';
import { createSession, deleteSession } from '@/lib/auth/session';
import { DEFAULT_LOGIN_REDIRECT, LOGIN_ROUTE } from '@/constants/routes';
import { sendPasswordResetEmail } from '@/lib/mail/send';
import type { 
  LoginActionState, 
  SignupActionState, 
  ForgotPasswordActionState, 
  ResetPasswordActionState 
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

  const user = await authenticateUser(email, password);

  if (!user) {
    return {
      message: 'Invalid email or password. Please try again.',
    };
  }

  await createSession(user.id, remember);

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

  const result = await registerUser(fullName, email, password);

  if ('error' in result) {
    return { message: result.error };
  }

  await createSession(result.id, false);

  redirect(DEFAULT_LOGIN_REDIRECT);
}

export async function logoutAction(): Promise<never> {
  await deleteSession();
  redirect(LOGIN_ROUTE);
}

/**
 * Action to handle requesting password reset
 */
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
  const user = await findUserByEmail(email);

  // For security, do not leak user existence. Return generic success message regardless of existence.
  if (!user) {
    return {
      successMessage: 'If that email is registered, we have sent a link to reset your password.',
    };
  }

  // Generate reset token and 1-hour expiration
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await updateUserResetToken(email, token, expiresAt);

  // Send email (falls back to console log if SMTP is not configured)
  const resetLink = `/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetLink);

  return {
    successMessage: 'If that email is registered, we have sent a link to reset your password.',
  };
}

/**
 * Action to handle updating password with reset token
 */
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
  const user = await findUserByResetToken(token);

  if (!user) {
    return {
      message: 'Invalid or expired password reset link.',
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUserPassword(user.id, passwordHash);

  redirect('/login?resetSuccess=true');
}
