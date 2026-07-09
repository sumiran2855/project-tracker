/**
 * Centralized route constants.
 * Import from here to avoid magic strings throughout the codebase.
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

/** Routes that do not require authentication */
export const PUBLIC_ROUTES: string[] = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

/** Where to send unauthenticated users */
export const LOGIN_ROUTE = ROUTES.login;

/** Where to send users after a successful login */
export const DEFAULT_LOGIN_REDIRECT = ROUTES.dashboard;

/** The name of the session cookie */
export const AUTH_COOKIE_NAME = 'session';
