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
