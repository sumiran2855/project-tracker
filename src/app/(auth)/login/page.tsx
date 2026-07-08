import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import { LoginForm } from '@/components/auth/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AUTH_COOKIE_NAME, DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Sign In — Project Tracker',
  description: 'Sign in to your Project Tracker account.',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await decrypt(token);

  if (session?.userId) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access Project Tracker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
