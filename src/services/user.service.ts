import 'server-only';

import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '@/repositories/user.repository';
import type { SafeUser } from '@/types/auth.types';

export async function authenticateUser(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const user = await findUserByEmail(email);

  if (!user) {
    await bcrypt.compare(password, '$2b$10$invalidhashfortimingnormalization');
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string
): Promise<SafeUser | { error: string }> {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, name: fullName, passwordHash });

  return { id: user.id, email: user.email, name: user.name };
}
