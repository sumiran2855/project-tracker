import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/dal';
import { getDefaultViewRoute } from '@/lib/utils';

/**
 * Root page — immediately redirects to user's preferred entry view.
 * Unauthenticated users are redirected to /login by proxy.ts.
 */
export default async function RootPage() {
  const user = await getCurrentUser();
  const redirectRoute = getDefaultViewRoute(user?.workspacePrefs?.defaultView);
  redirect(redirectRoute);
}
