'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/client-api';
import { MenuIcon } from './Icons';
import { useToast } from './ToastProvider';

// Navigation links + mobile menu button + logout. Needs state, so it is a Client Component.
export default function NavMenu({ user }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const close = () => setOpen(false);
  const roleLabel = user?.isAdmin ? 'Admin' : user?.role === 'seller' ? 'Seller' : user?.role === 'member' ? 'Member' : 'Buyer';

  async function logout() {
    close();
    const result = await apiRequest('/api/auth/logout', { method: 'POST' });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('You have been logged out.');
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <button type="button" className="nav-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="site-nav" aria-label={open ? 'Close menu' : 'Open menu'}>
        <MenuIcon open={open} />
      </button>
      <nav id="site-nav" className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Main">
        <Link href="/browse" onClick={close}>Browse</Link>
        <Link href="/sell" onClick={close}>Sell</Link>
        {user ? (
          <>
            <Link href="/favorites" onClick={close}>Favorites</Link>
            <Link href="/dashboard" onClick={close}>Dashboard</Link>
            <Link href="/history" onClick={close}>History</Link>
            {user.isAdmin ? <Link href="/admin" onClick={close}>Admin</Link> : null}
            <Link href="/account" className="nav-user" onClick={close}>
              Hi, {user.name.split(' ')[0]} <span className="nav-user-role">({roleLabel})</span>
            </Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={close}>Log in</Link>
            <Link href="/register" className="btn btn-primary btn-sm" onClick={close}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </>
  );
}
