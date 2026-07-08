'use client';

import { useActionState } from 'react';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LoginActionState } from '@/types/auth.types';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    LoginActionState,
    FormData
  >(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.message && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-describedby={
            state?.errors?.email ? 'email-error' : undefined
          }
          disabled={isPending}
          required
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-xs text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-describedby={
            state?.errors?.password ? 'password-error' : undefined
          }
          disabled={isPending}
          required
        />
        {state?.errors?.password && (
          <p id="password-error" className="text-xs text-destructive">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        aria-label="Sign in to your account"
      >
        {isPending ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
