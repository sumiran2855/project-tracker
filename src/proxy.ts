import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import {
    AUTH_COOKIE_NAME,
    DEFAULT_LOGIN_REDIRECT,
    LOGIN_ROUTE,
    PUBLIC_ROUTES,
} from '@/constants/routes';

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET ?? '');

async function getSessionFromCookie(
    request: NextRequest
): Promise<{ userId: string } | null> {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ['HS256'],
        });
        return { userId: payload.userId as string };
    } catch {
        return null;
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    const session = await getSessionFromCookie(request);
    const isAuthenticated = Boolean(session?.userId);

    if (!isAuthenticated && !isPublicRoute) {
        const loginUrl = new URL(LOGIN_ROUTE, request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && isPublicRoute) {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
};
