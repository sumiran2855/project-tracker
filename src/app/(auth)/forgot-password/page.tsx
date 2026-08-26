import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AUTH_COOKIE_NAME, DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { forgotPasswordMetadata } from '@/types/app.metadata';
import { Logo } from '@/components/ui/Logo';

export const metadata = forgotPasswordMetadata;

export default async function ForgotPasswordPage() {
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
          <Logo className="mb-8 lg:hidden" iconSize="h-9 w-9" textSize="text-xs" />

          {/* Form card */}
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
                Reset Password
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </main>
  );
}
