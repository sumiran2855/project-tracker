/**
 * Shared TypeScript types and interfaces for authentication.
 * Keep types in one place to avoid duplication.
 */

/** JWT payload stored in the session cookie */
export interface SessionPayload {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  token?: string;
  refreshToken?: string;
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

export interface NotificationPrefs {
  emailTasks: boolean;
  emailDueDates: boolean;
  emailDigests: boolean;
  pushMentions: boolean;
  pushStatusChanges: boolean;
  soundAlerts: boolean;
}

export interface WorkspacePrefs {
  defaultView: string;
  theme: 'light' | 'dark' | 'system';
  weekStart: 'Sunday' | 'Monday';
  accentTint: string;
}

/** Safe user DTO — never include passwordHash in this type */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  readNotifications?: string[];
  deletedNotifications?: string[];
  skills?: string[];
  location?: string;
  department?: string;
  lastLogin?: string;
  createdAt?: string;
  collaborators?: { name: string; initials: string; bg: string; role: string }[];
  notificationPrefs?: NotificationPrefs;
  workspacePrefs?: WorkspacePrefs;
}

/**
 * Shape returned by signup Server Action via useActionState.
 */
export type SignupActionState =
  | {
    errors?: {
      fullName?: string[];
      email?: string[];
      password?: string[];
    };
    message?: string;
  }
  | undefined;

/** Shape returned by forgot password Server Action via useActionState */
export type ForgotPasswordActionState =
  | {
    errors?: {
      email?: string[];
    };
    message?: string;
    successMessage?: string;
    resetLink?: string; // For mock reset email delivery
  }
  | undefined;

/** Shape returned by reset password Server Action via useActionState */
export type ResetPasswordActionState =
  | {
    errors?: {
      password?: string[];
      confirmPassword?: string[];
      token?: string[];
    };
    message?: string;
    successMessage?: string;
  }
  | undefined;
