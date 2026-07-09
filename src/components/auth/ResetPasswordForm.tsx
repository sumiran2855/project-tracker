'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPasswordAction } from '@/actions/auth';
import type { ResetPasswordActionState } from '@/types/auth.types';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordActionState,
    FormData
  >(resetPasswordAction, undefined);

  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const hasToken = token.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Global Error */}
      {state?.message && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-rose-800 shadow-sm animate-shake"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <span className="font-medium">{state.message}</span>
        </div>
      )}

      {/* Warning if token is missing */}
      {!hasToken && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-amber-800 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
          <span className="font-medium">
            Missing or invalid reset token. Please request a new link.
          </span>
        </div>
      )}

      <form action={formAction} className="space-y-4" noValidate>
        {/* Hidden token field */}
        <input type="hidden" name="token" value={token} />

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
            New Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="reset-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              disabled={isPending || !hasToken}
              required
              aria-describedby={state?.errors?.password ? 'reset-password-error' : undefined}
              className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-20 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                state?.errors?.password
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={!hasToken}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold tracking-wider text-indigo-600 transition-colors hover:text-indigo-800 focus-visible:outline-none disabled:opacity-40"
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          {state?.errors?.password && (
            <p id="reset-password-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              disabled={isPending || !hasToken}
              required
              aria-describedby={state?.errors?.confirmPassword ? 'confirm-password-error' : undefined}
              className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                state?.errors?.confirmPassword
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
              }`}
            />
          </div>
          {state?.errors?.confirmPassword && (
            <p id="confirm-password-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="reset-submit-btn"
          disabled={isPending || !hasToken}
          aria-label="Set new password"
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none cursor-pointer"
        >
          {isPending ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Updating password…
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="pt-2 text-center">
        <a
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Forgot Password</span>
        </a>
      </div>
    </div>
  );
}
