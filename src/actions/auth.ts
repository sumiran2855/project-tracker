'use server';

import { redirect } from 'next/navigation';
import { LoginSchema, SignupSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/validations/auth.validation';
import { createSession, deleteSession } from '@/lib/auth/session';
import { DEFAULT_LOGIN_REDIRECT, LOGIN_ROUTE } from '@/constants/routes';
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

  // Seed user check
  if (email === 'dev@projecttracker.local' && password !== 'password123') {
    return {
      message: 'Invalid email or password. Please try again.',
    };
  }

  // Generate mock user data
  const user = {
    id: email === 'dev@projecttracker.local' ? 'dev-user-id' : String(Date.now()),
    email,
    name: email === 'dev@projecttracker.local' ? 'Dev User' : email.split('@')[0],
    role: email === 'dev@projecttracker.local' ? 'Admin' : 'Employee',
  };

  await createSession(user, remember);

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

  const { fullName, email } = validatedFields.data;

  // Immediately log in the signed-up user in mock mode
  const user = {
    id: String(Date.now()),
    email,
    name: fullName,
    role: 'Employee',
  };

  await createSession(user, false);

  redirect(DEFAULT_LOGIN_REDIRECT);
}

export async function logoutAction(): Promise<never> {
  await deleteSession();
  redirect(LOGIN_ROUTE);
}

/**
 * Action to handle requesting password reset (Mock mode)
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

  // Generate reset token and 1-hour expiration for local developer visibility
  const token = crypto.randomUUID();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullLink = `${appUrl}/reset-password?token=${token}`;

  console.log(`\n🔑 [PASSWORD RESET LINK for ${email}]: ${fullLink}\n`);

  return {
    successMessage: 'If that email is registered, we have sent a link to reset your password.',
  };
}

/**
 * Action to handle updating password with reset token (Mock mode)
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

  redirect('/login?resetSuccess=true');
}

export async function updateUserRoleAction(role: string): Promise<{ success: boolean; error?: string }> {
  const { getCurrentUser } = await import('@/lib/auth/dal');

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }
    
    // Re-create the session cookie with the updated role
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: role,
    }, false);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update user role session' };
  }
}
