'use server';

import { redirect } from 'next/navigation';
import { LoginSchema } from '@/validations/auth.validation';
import { authenticateUser } from '@/services/user.service';
import { createSession, deleteSession } from '@/lib/auth/session';
import { DEFAULT_LOGIN_REDIRECT, LOGIN_ROUTE } from '@/constants/routes';
import type { LoginActionState } from '@/types/auth.types';

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

  const user = await authenticateUser(email, password);

  if (!user) {
    return {
      message: 'Invalid email or password. Please try again.',
    };
  }

  await createSession(user.id);

  redirect(DEFAULT_LOGIN_REDIRECT);
}

export async function logoutAction(): Promise<never> {
  await deleteSession();
  redirect(LOGIN_ROUTE);
}
