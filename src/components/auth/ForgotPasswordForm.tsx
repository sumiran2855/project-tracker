'use client';

import { useActionState } from 'react';
import { forgotPasswordAction } from '@/actions/auth';
import type { ForgotPasswordActionState } from '@/types/auth.types';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordActionState,
    FormData
  >(forgotPasswordAction, undefined);

  return (
    <div className="space-y-4">
      {/* Global Success */}
      {state?.successMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800 shadow-sm animate-fade-in"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
          <span className="font-medium">{state.successMessage}</span>
        </div>
      )}

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

      <form action={formAction} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="forgot-email" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isPending}
              required
              aria-describedby={state?.errors?.email ? 'forgot-email-error' : undefined}
              className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                state?.errors?.email
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
              }`}
            />
          </div>
          {state?.errors?.email && (
            <p id="forgot-email-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {state.errors.email[0]}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="forgot-submit-btn"
          disabled={isPending}
          aria-label="Request password reset"
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none cursor-pointer"
        >
          {isPending ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Sending reset link…
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="pt-2 text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </a>
      </div>
    </div>
  );
}
