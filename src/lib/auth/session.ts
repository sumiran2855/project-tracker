import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionPayload } from '@/types/auth.types';
import { AUTH_COOKIE_NAME } from '@/constants/routes';

function getEncodedKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set.');
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  const expSeconds = Math.floor(new Date(payload.expiresAt).getTime() / 1000);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expSeconds)
    .sign(getEncodedKey());
}

export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | undefined> {
  if (!token) return undefined;

  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ['HS256'],
    });

    return payload as unknown as SessionPayload;
  } catch {
    return undefined;
  }
}

export async function createSession(
  user: { id: string; email: string; name: string | null; role: string },
  accessToken?: string,
  refreshToken?: string,
  rememberMe = false
): Promise<void> {
  // If rememberMe is checked, session lasts 30 days. Otherwise, it lasts 1 day
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs);

  const token = await encrypt({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token: accessToken,
    refreshToken,
    expiresAt,
  });
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: rememberMe ? expiresAt : undefined, // Omit expires for session cookie (expires on close)
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// Decode JWT payload without verification
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      globalThis.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function getOrRefreshSession(): Promise<SessionPayload | undefined> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!cookieVal) return undefined;

  const session = await decrypt(cookieVal);
  if (!session || !session.token) return undefined;

  // Check if access token is expired or close to it (10s buffer)
  const decoded = decodeJwt(session.token);
  const isExpired = decoded ? (Date.now() / 1000) >= (decoded.exp - 10) : true;

  if (!isExpired) {
    return session;
  }

  // If access token is expired but we have a refresh token, rotate it
  if (session.refreshToken) {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (!res.ok) {
        throw new Error('Refresh call failed');
      }

      const body = await res.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = body.data;

      const updatedSession: SessionPayload = {
        ...session,
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };

      const newCookieToken = await encrypt(updatedSession);

      try {
        cookieStore.set(AUTH_COOKIE_NAME, newCookieToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: session.expiresAt ? new Date(session.expiresAt) : undefined,
          path: '/',
        });
      } catch (err) {
        // Setting cookie might fail in Server Components rendering, which is fine
      }

      return updatedSession;
    } catch (err) {
      // Clear session if refresh failed (session expired or invalid refresh token)
      try {
        cookieStore.delete(AUTH_COOKIE_NAME);
      } catch {
        // ignore
      }
      return undefined;
    }
  }

  return undefined;
}
