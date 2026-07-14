import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/dal';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UserProvider } from '@/contexts/UserContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <UserProvider initialUser={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </UserProvider>
  );
}
