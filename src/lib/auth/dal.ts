import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
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
  let session: VerifiedSession;

  try {
    session = await verifySession();
  } catch {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    return user;
  } catch {
    return null;
  }
});
