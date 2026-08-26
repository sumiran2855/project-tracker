import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import { SignupForm } from '@/components/auth/SignupForm';
import { AUTH_COOKIE_NAME, DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { signupMetadata } from '@/types/app.metadata';
import { Logo } from '@/components/ui/Logo';

export const metadata = signupMetadata;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await decrypt(token);

  if (session?.userId) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }

  const resolvedParams = await searchParams;
  const inviteToken = typeof resolvedParams.inviteToken === 'string' ? resolvedParams.inviteToken : undefined;

  return (
    <main className="flex h-screen overflow-hidden bg-white">
      {/* ── Left Panel ── */}
      <AuthPanel />

      {/* ── Right — Signup Form ── */}
      <section className="flex-1 overflow-y-auto bg-white flex flex-col justify-center">
        <div className="grid min-h-full place-items-center px-8 py-10 sm:px-12 lg:px-16">
          {/* Mobile logo */}
          <Logo className="mb-8 lg:hidden" iconSize="h-9 w-9" textSize="text-xs" />

          {/* Form card */}
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
                Create account
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                Join Project Tracker and start shipping faster with your team.
              </p>
            </div>

            <SignupForm inviteToken={inviteToken} isClientInvite={!!inviteToken} />

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-bold text-indigo-600 transition-all hover:text-indigo-800 hover:underline hover:underline-offset-4"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
