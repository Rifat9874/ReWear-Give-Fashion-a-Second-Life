import Link from 'next/link';
import PasswordForm from '@/components/PasswordForm';
import ProfileForm from '@/components/ProfileForm';
import { requireUserPage } from '@/lib/auth';

export const metadata = { title: 'Your account' };

export default async function AccountPage() {
  const user = await requireUserPage('/account');
  return (
    <div className="container page page-narrow">
      <header className="page-head page-head-row">
        <div>
          <h1>Your account</h1>
          <p className="muted">Edit how other members see you and keep your login secure.</p>
        </div>
        <div className="form-actions">
          <Link href={`/profile/${user.id}`} className="btn btn-secondary btn-sm">View public profile</Link>
          <Link href="/history" className="btn btn-secondary btn-sm">My history</Link>
        </div>
      </header>

      <section className="panel" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Profile</h2>
        <ProfileForm user={user} />
      </section>

      <section className="panel" aria-labelledby="password-heading">
        <h2 id="password-heading">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
