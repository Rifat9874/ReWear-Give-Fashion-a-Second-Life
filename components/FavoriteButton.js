'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/client-api';
import { HeartIcon } from './Icons';
import { useToast } from './ToastProvider';

// variant "icon" = small round button on cards, "button" = labelled button on the item page.
export default function FavoriteButton({ itemId, initialFavorited = false, isLoggedIn, variant = 'icon' }) {
  const router = useRouter();
  const toast = useToast();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      const here = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(here)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !favorited;
    setFavorited(next); // update the heart straight away...
    const result = next
      ? await apiRequest('/api/favorites', { method: 'POST', body: { itemId } })
      : await apiRequest(`/api/favorites/${itemId}`, { method: 'DELETE' });
    setBusy(false);

    if (!result.ok) {
      setFavorited(!next); // ...and undo it if the server said no
      toast.error(result.error);
      return;
    }
    toast.success(next ? 'Saved to your favorites.' : 'Removed from your favorites.');
    router.refresh(); // keeps the favorites page in sync
  }

  const label = favorited ? 'Remove from favorites' : 'Save to favorites';
  if (variant === 'button') {
    return (
      <button type="button" className={`btn btn-secondary ${favorited ? 'is-active' : ''}`} onClick={toggle} aria-pressed={favorited} disabled={busy}>
        <HeartIcon filled={favorited} />
        {favorited ? 'Saved' : 'Save'}
      </button>
    );
  }
  return (
    <button type="button" className={`fav-btn ${favorited ? 'is-active' : ''}`} onClick={toggle} aria-pressed={favorited} aria-label={label} title={label} disabled={busy}>
      <HeartIcon filled={favorited} />
    </button>
  );
}
