'use client';

import { useActionState, useState } from 'react';
import { signupAction } from '@/actions/auth';
import type { SignupActionState } from '@/types/auth.types';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<
    SignupActionState,
    FormData
  >(signupAction, undefined);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {/* Global error */}
      {state?.message && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-rose-800 shadow-sm animate-shake"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <span className="font-medium">{state.message}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
          Full Name
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <User className="h-4 w-4" />
          </span>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            disabled={isPending}
            required
            aria-describedby={state?.errors?.fullName ? 'name-error' : undefined}
            className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              state?.errors?.fullName
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
            }`}
          />
        </div>
        {state?.errors?.fullName && (
          <p id="name-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {state.errors.fullName[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
          Email Address
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="h-4 w-4" />
          </span>
          <input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isPending}
            required
            aria-describedby={state?.errors?.email ? 'signup-email-error' : undefined}
            className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              state?.errors?.email
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
            }`}
          />
        </div>
        {state?.errors?.email && (
          <p id="signup-email-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="signup-password" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <input
            id="signup-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            disabled={isPending}
            required
            aria-describedby={state?.errors?.password ? 'signup-password-error' : undefined}
            className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-20 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              state?.errors?.password
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold tracking-wider text-indigo-600 transition-colors hover:text-indigo-800 focus-visible:outline-none"
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>
        {state?.errors?.password && (
          <p id="signup-password-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="signup-submit-btn"
        disabled={isPending}
        aria-label="Create your account"
        className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none cursor-pointer"
      >
        {isPending ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            Creating account…
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}
