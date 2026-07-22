import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import {
    AUTH_COOKIE_NAME,
    LOGIN_ROUTE,
    PUBLIC_ROUTES,
} from '@/constants/routes';

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET ?? '');

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

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    const cookieVal = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!cookieVal) {
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
        }
        return NextResponse.next();
    }

    let session: any = null;
    try {
        const { payload } = await jwtVerify(cookieVal, encodedKey, {
            algorithms: ['HS256'],
        });
        session = payload;
    } catch {
        // Session cookie has expired or signature is invalid
        if (!isPublicRoute) {
            const res = NextResponse.redirect(new URL(`${LOGIN_ROUTE}?expired=true`, request.url));
            res.cookies.delete(AUTH_COOKIE_NAME);
            return res;
        }
        return NextResponse.next();
    }

    const isAuthenticated = Boolean(session?.userId);

    if (!isAuthenticated) {
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
        }
        return NextResponse.next();
    }

    // Check if the backend access token is expired or close to it (10s buffer)
    const decoded = session.token ? decodeJwt(session.token) : null;
    const isAccessTokenExpired = decoded ? (Date.now() / 1000) >= (decoded.exp - 10) : true;

    if (isAccessTokenExpired && session.refreshToken) {
        try {
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: session.refreshToken }),
            });

            if (!refreshRes.ok) {
                throw new Error('Refresh failed');
            }

            const body = await refreshRes.json();
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = body.data;

            const updatedSession = {
                ...session,
                token: newAccessToken,
                refreshToken: newRefreshToken,
            };

            const expSeconds = Math.floor(new Date(session.expiresAt).getTime() / 1000);
            const newToken = await new SignJWT(updatedSession)
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(expSeconds)
                .sign(encodedKey);

            let response = NextResponse.next();
            if (isPublicRoute) {
                response = NextResponse.redirect(new URL('/', request.url));
            }

            response.cookies.set(AUTH_COOKIE_NAME, newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                expires: session.expiresAt ? new Date(session.expiresAt) : undefined,
                path: '/',
            });

            return response;
        } catch (error) {
            // Refresh token has expired or is invalid. Clear cookie and redirect to login.
            const response = NextResponse.redirect(new URL(`${LOGIN_ROUTE}?expired=true`, request.url));
            response.cookies.delete(AUTH_COOKIE_NAME);
            return response;
        }
    }

    if (isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
};
