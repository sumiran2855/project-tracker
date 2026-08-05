import { createSession } from '@/lib/auth/session';
import { ERROR_CODES } from '@/constants/errorCodes';
import type { SafeUser } from '@/types/auth.types';

// Helper function to get valid session and token
export async function getValidSession() {
  const { getSession } = await import('@/lib/auth/dal');
  const session = await getSession();
  if (!session?.token) {
    throw new Error(ERROR_CODES.UNAUTHORIZED);
  }
  return {
    ...session,
    token: session.token as string,
  };
}

// Helper function to handle session update after authenticated API calls
export async function updateLocalSession(user: SafeUser, token: string, refreshToken: string | undefined) {
  await createSession(user, token, refreshToken as string, false);
}
