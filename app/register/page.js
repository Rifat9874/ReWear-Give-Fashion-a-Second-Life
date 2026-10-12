import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';
import { safeRedirectPath } from '@/lib/utilities';

export const metadata = { title: 'Create an account' };

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  if (user) redirect(safeRedirectPath(next, '/dashboard'));

  return (
    <div className="container page auth-page">
      <h1>Create your account</h1>
      <p className="muted">It is free. You only need an account to save favorites, contact sellers and list items.</p>
      <AuthForm mode="register" next={typeof next === 'string' ? next : ''} />
    </div>
  );
}
