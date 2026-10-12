import { redirect } from 'next/navigation';
import LoginSection from '@/components/LoginSection';
import { getCurrentUser } from '@/lib/auth';
import { DEMO_ACCOUNTS } from '@/lib/demo-accounts';
import { safeRedirectPath } from '@/lib/utilities';

export const metadata = { title: 'Log in' };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  if (user) redirect(safeRedirectPath(next, '/dashboard')); // already logged in

  // The demo cards (and the demo password) are only sent to the browser when DEMO_LOGIN=true.
  const demo = process.env.DEMO_LOGIN === 'true' ? { accounts: DEMO_ACCOUNTS, password: process.env.SEED_PASSWORD || 'Demo@12345' } : null;

  return (
    <div className="container page auth-page">
      <h1>Log in</h1>
      <p className="muted">Welcome back. Log in to save favorites, message sellers and manage your listings.</p>
      <LoginSection next={typeof next === 'string' ? next : ''} demo={demo} />
    </div>
  );
}
