import type { Metadata } from 'next';
import { verifySession } from '@/lib/auth/dal';

export const metadata: Metadata = {
  title: 'Dashboard — Project Tracker',
  description: 'Your Project Tracker dashboard.',
};

export default async function DashboardPage() {
  await verifySession();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome to Project Tracker
      </h1>
    </main>
  );
}
