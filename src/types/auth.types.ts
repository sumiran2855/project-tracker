/**
 * Shared TypeScript types and interfaces for authentication.
 * Keep types in one place to avoid duplication.
 */

/** JWT payload stored in the session cookie */
export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

/** Verified session data returned from the DAL */
export interface VerifiedSession {
  isAuth: true;
  userId: string;
}

/**
 * Shape returned by login/logout Server Actions via useActionState.
 * `errors` holds field-level validation errors from Zod.
 * `message` holds a general error message (e.g. invalid credentials).
 */
export type LoginActionState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

/** Safe user DTO — never include passwordHash in this type */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
}
