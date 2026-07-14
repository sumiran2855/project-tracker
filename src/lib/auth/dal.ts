import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import type { SafeUser, VerifiedSession } from '@/types/auth.types';
import { AUTH_COOKIE_NAME, LOGIN_ROUTE } from '@/constants/routes';
import { apiClient } from '@/lib/api/apiClient';

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return decrypt(token);
});

export const verifySession = cache(async (): Promise<VerifiedSession> => {
  const payload = await getSession();

  if (!payload?.userId) {
    redirect(LOGIN_ROUTE);
  }

  return { isAuth: true, userId: payload.userId };
});

export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  try {
    const payload = await getSession();

    if (!payload?.userId || !payload.token) {
      return null;
    }

    const res = await apiClient.get<{ success: boolean; data: { user: SafeUser } }>(
      'auth/me',
      { token: payload.token }
    );

    return res.data.user;
  } catch {
    return null;
  }
});

