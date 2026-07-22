'use client';

import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { loginAction } from '@/actions/auth';
import type { LoginActionState } from '@/types/auth.types';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    LoginActionState,
    FormData
  >(loginAction, undefined);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('resetSuccess') === 'true';
  const expired = searchParams.get('expired') === 'true';

  // Show session expired toast if query parameter exists
  useEffect(() => {
    if (expired) {
      toast.warn('Your session has expired. Please log in again.');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [expired]);

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('pwt_remember_email');
    const savedPassword = localStorage.getItem('pwt_remember_password');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // Handle local storage saving/cleanup on submit
  const handleSubmit = () => {
    if (rememberMe) {
      localStorage.setItem('pwt_remember_email', email);
      localStorage.setItem('pwt_remember_password', password);
    } else {
      localStorage.removeItem('pwt_remember_email');
      localStorage.removeItem('pwt_remember_password');
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Global Success (e.g. from password reset) */}
      {resetSuccess && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800 shadow-sm"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
          <span className="font-medium">Password reset successfully! You can now sign in.</span>
        </div>
      )}

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

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
          Email Address
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="h-4 w-4" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isPending}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={state?.errors?.email ? 'email-error' : undefined}
            className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              state?.errors?.email
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
            }`}
          />
        </div>
        {state?.errors?.email && (
          <p id="email-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700 tracking-wide">
          Password
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isPending}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={state?.errors?.password ? 'password-error' : undefined}
            className={`block h-12 w-full rounded-xl border bg-slate-50/50 pl-10 pr-20 text-sm text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              state?.errors?.password
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-200 hover:border-slate-300/80 hover:bg-slate-50'
            }`}
          />
          {/* SHOW/HIDE toggle */}
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
          <p id="password-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 accent-indigo-600 cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-600">Remember me</span>
        </label>
        <a
          href="/forgot-password"
          className="text-sm font-semibold text-indigo-600 transition-all hover:text-indigo-800 hover:underline hover:underline-offset-4"
        >
          Forgot Password?
        </a>
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="login-submit-btn"
        disabled={isPending}
        aria-label="Sign in to your account"
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none cursor-pointer"
      >
        {isPending ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}
