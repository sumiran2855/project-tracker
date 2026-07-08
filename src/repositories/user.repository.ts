import 'server-only';

import { prisma } from '@/lib/db/prisma';
import type { UserModel } from '@/generated/prisma/models';

type User = UserModel;

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}
