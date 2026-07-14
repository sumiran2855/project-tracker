import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import type { SafeUser, VerifiedSession } from '@/types/auth.types';
import { AUTH_COOKIE_NAME, LOGIN_ROUTE } from '@/constants/routes';

export const verifySession = cache(async (): Promise<VerifiedSession> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const payload = await decrypt(token);

  if (!payload?.userId) {
    redirect(LOGIN_ROUTE);
  }

  return { isAuth: true, userId: payload.userId };
});

export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const payload = await decrypt(token);

    if (!payload?.userId) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
});

