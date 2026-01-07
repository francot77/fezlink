import { getServerSession } from 'next-auth';

import { redirect } from 'next/navigation';
import DashboardPage from './page';
import { authOptions } from '@/lib/auth-options';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <DashboardPage />;
}
