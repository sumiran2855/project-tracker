import 'server-only';

import { prisma } from '@/lib/db/prisma';
import type { UserModel } from '@/generated/prisma/models';

type User = UserModel;

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<User> {
  return prisma.user.create({ data });
}

/** Set a password reset token and expiration for a user */
export async function updateUserResetToken(
  email: string,
  token: string,
  expiresAt: Date
): Promise<User> {
  return prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expiresAt,
    },
  });
}

/** Find a valid user with a reset token that has not expired */
export async function findUserByResetToken(token: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date(),
      },
    },
  });
}

/** Update the user's password and clear the reset token */
export async function updateUserPassword(
  userId: string,
  passwordHash: string
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });
}
