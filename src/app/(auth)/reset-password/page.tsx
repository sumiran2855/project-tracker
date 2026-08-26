import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth/session';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AUTH_COOKIE_NAME, DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';
import { AuthPanel } from '@/components/auth/AuthPanel';
import { resetPasswordMetadata } from '@/types/app.metadata';
import { Logo } from '@/components/ui/Logo';

export const metadata = resetPasswordMetadata;

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
          <Logo className="mb-8 lg:hidden" iconSize="h-9 w-9" textSize="text-xs" />

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
