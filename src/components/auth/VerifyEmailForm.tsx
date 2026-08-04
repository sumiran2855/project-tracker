'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { verifyEmailAction, resendVerificationAction } from '@/actions/auth';
import type { VerifyEmailActionState } from '@/types/auth.types';
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const isRegistered = searchParams.get('registered') === 'true';
  const isUnverified = searchParams.get('unverified') === 'true' || searchParams.get('unverify') === 'true';

  const [state, formAction, isPending] = useActionState<
    VerifyEmailActionState,
    FormData
  >(verifyEmailAction, undefined);

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [hasRequestedOnce, setHasRequestedOnce] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize email state if URL parameter changes
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Handle resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleCodeChange = (val: string, index: number) => {
    const cleanVal = val.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = cleanVal.slice(-1);
    setCode(newCode);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasteData[i] || '';
    }
    setCode(newCode);

    const nextFocusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (cooldown > 0) return;

    setIsResending(true);
    const result = await resendVerificationAction(email);
    setIsResending(false);

    if (result.success) {
      toast.success(result.message);
      setCooldown(60); // 60 seconds cooldown
      setHasRequestedOnce(true);
    } else {
      toast.error(result.message);
      // If the backend returns a 429 rate limit with cooldown, set cooldown
      if (result.message.includes('wait')) {
        const match = result.message.match(/\d+/);
        const seconds = match ? parseInt(match[0], 10) : 60;
        setCooldown(seconds);
      }
    }
  };

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {/* Registration Success Banner */}
      {isRegistered && !state?.message && !state?.successMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800 shadow-sm"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
          <span className="font-medium">
            Registration successful! We have sent a 6-digit verification code to your email.
          </span>
        </div>
      )}

      {/* Unverified Warning Banner */}
      {isUnverified && !state?.message && !state?.successMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-amber-800 shadow-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
          <span className="font-medium">
            Your email address has not been verified. Please verify your email before logging in.
          </span>
        </div>
      )}

      {/* Global Error message */}
      {state?.message && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-rose-800 shadow-sm animate-shake"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <span className="font-medium">{state.message}</span>
        </div>
      )}

      {/* Email Address (disabled/read-only) */}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isPending || isResending}
            required
            className="block h-12 w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
          />
        </div>
      </div>

      {/* Verification Code */}
      <div className="space-y-2">
        <label htmlFor="code-0" className="block text-[13px] font-semibold text-slate-700 tracking-wide text-center">
          6-Digit Verification Code
        </label>
        <div className="flex justify-between gap-2.5 max-w-xs mx-auto">
          {Array(6).fill(0).map((_, i) => (
            <input
              key={i}
              id={`code-${i}`}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              value={code[i]}
              ref={(el) => { inputRefs.current[i] = el; }}
              onChange={(e) => handleCodeChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              disabled={isPending}
              className={`block w-12 h-12 text-center text-xl font-extrabold text-slate-800 border rounded-xl bg-slate-50/50 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                state?.errors?.code
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300/80'
              }`}
            />
          ))}
        </div>
        <input type="hidden" name="code" value={code.join('')} />
        {state?.errors?.code && (
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600 mt-2">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {state.errors.code[0]}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-2 space-y-3">
        {/* Verify Submit Button */}
        <button
          type="submit"
          id="verify-submit-btn"
          disabled={isPending || code.join('').length !== 6}
          aria-label="Verify email address"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none cursor-pointer"
        >
          {isPending ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Verifying Code…
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend Verification Code Button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending || isResending || cooldown > 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
        >
          {isResending ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin text-slate-400" />
              {hasRequestedOnce ? 'Resending…' : 'Sending…'}
            </>
          ) : cooldown > 0 ? (
            `Resend Code (${cooldown}s)`
          ) : hasRequestedOnce ? (
            'Resend Code'
          ) : (
            'Send Code'
          )}
        </button>
      </div>
    </form>
  );
}
