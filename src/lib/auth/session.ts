import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/types/auth.types';
import { AUTH_COOKIE_NAME } from '@/constants/routes';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is not set.');
}

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | undefined> {
  if (!token) return undefined;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });

    return payload as unknown as SessionPayload;
  } catch {
    return undefined;
  }
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
