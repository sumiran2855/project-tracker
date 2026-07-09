import { z } from 'zod';

/** Zod schema for the login form */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/** Zod schema for the signup form */
export const SignupSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: 'Full name is required.' })
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(60, { message: 'Name must be 60 characters or fewer.' })
    .trim(),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters.' }),
});

export type SignupInput = z.infer<typeof SignupSchema>;

/** Zod schema for forgot password form */
export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

/** Zod schema for reset password form */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required.' }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Confirm password is required.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match.',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
