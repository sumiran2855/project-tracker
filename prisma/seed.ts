import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/project_tracker?schema=public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_USER = {
  email: 'dev@projecttracker.local',
  password: 'password123',
  name: 'Dev User',
};

async function main() {
  const passwordHash = await bcrypt.hash(SEED_USER.password, 12);

  const user = await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      role: 'Admin',
    },
    create: {
      email: SEED_USER.email,
      passwordHash,
      name: SEED_USER.name,
      role: 'Admin',
    },
  });

  console.log('✅ Seed complete. Test user created/found:');
  console.log(`   ID:    ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name:  ${user.name}`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
