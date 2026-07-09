import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AUTH_COOKIE_NAME, DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';
import { AuthPanel } from '@/components/auth/AuthPanel';

export const metadata: Metadata = {
  title: 'Reset Password — Project Work Tracker',
  description: 'Enter your new password to access your account.',
};

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await decrypt(token);

  if (session?.userId) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white">
      {/* ── Left Panel ── */}
      <AuthPanel />

      {/* ── Right — Form ── */}
      <section className="flex-1 overflow-y-auto bg-white flex flex-col justify-center">
        <div className="grid min-h-full place-items-center px-8 py-10 sm:px-12 lg:px-16">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
              <span className="text-xs font-black text-white tracking-tight">PWT</span>
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
              Project Work Tracker
            </span>
          </div>

          {/* Form card */}
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
                New Password
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                Create a strong, secure password for your account.
              </p>
            </div>

            <ResetPasswordForm />
          </div>
        </div>
      </section>
    </main>
  );
}
