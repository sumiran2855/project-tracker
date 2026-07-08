import 'server-only';

import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/repositories/user.repository';
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
