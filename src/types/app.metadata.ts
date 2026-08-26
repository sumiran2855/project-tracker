import type { Metadata } from 'next';

export const rootMetadata: Metadata = {
  title: 'Project Tracker',
  description:
    'A personal project management tool to track projects, tasks, bugs, work progress, and time spent.',
  icons: {
    icon: '/p1.png',
  },
};

export const dashboardMetadata: Metadata = {
  title: 'Dashboard — Project Tracker',
  description: 'Your Project Tracker dashboard.',
};

export const loginMetadata: Metadata = {
  title: 'Sign In — Project Tracker',
  description: 'Sign in to your Project Tracker account.',
};

export const signupMetadata: Metadata = {
  title: 'Create Account — Project Tracker',
  description: 'Create your Project Tracker account.',
};

export const forgotPasswordMetadata: Metadata = {
  title: 'Forgot Password — Project Tracker',
  description: 'Request a password reset link for your account.',
};

export const resetPasswordMetadata: Metadata = {
  title: 'Reset Password — Project Tracker',
  description: 'Enter your new password to access your account.',
};

export const verifyEmailMetadata: Metadata = {
  title: 'Verify Email — Project Tracker',
  description: 'Verify your email address using the one-time verification code.',
};
