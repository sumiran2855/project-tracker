import { redirect } from 'next/navigation';
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

/**
 * Root page — immediately redirects to the dashboard.
 * The proxy (proxy.ts) handles the unauthenticated redirect to /login
 * before this page is ever rendered.
 */
export default function RootPage() {
  redirect(DEFAULT_LOGIN_REDIRECT);
}
