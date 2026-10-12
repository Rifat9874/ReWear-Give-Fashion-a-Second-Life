import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import ItemGrid from '@/components/ItemGrid';
import { getCurrentUser } from '@/lib/auth';
import { getFavoriteIds, getSellerProfile } from '@/lib/items';
import { formatDate } from '@/lib/utilities';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const profile = await getSellerProfile(id);
    if (profile) return { title: `${profile.seller.name} on ReWear` };
  } catch {
    // default title below
  }
  return { title: 'Seller profile' };
}

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const profile = await getSellerProfile(id);
  if (!profile) notFound();

  let user = null;
  let favoriteIds = [];
  try {
    user = await getCurrentUser();
    if (user) favoriteIds = await getFavoriteIds(user.id);
  } catch {
    user = null;
  }

  const { seller, items, activeCount } = profile;
  return (
    <div className="container page">
      <header className="profile-head">
        <Avatar user={seller} large />
        <div>
          <h1>{seller.name}</h1>
          {seller.location ? <p className="muted">{seller.location}</p> : null}
          {seller.bio ? <p className="profile-bio">{seller.bio}</p> : null}
          <p className="muted">Member since {formatDate(seller.createdAt)}</p>
          <p><strong>{activeCount}</strong> active listing{activeCount === 1 ? '' : 's'}</p>
        </div>
      </header>

      <h2 className="section-title">Active listings</h2>
      {items.length === 0 ? (
        <EmptyState title="No active listings" actionHref="/browse" actionLabel="Browse other items">
          {seller.name} does not have anything listed right now.
        </EmptyState>
      ) : (
        <ItemGrid items={items} isLoggedIn={Boolean(user)} currentUserId={user?.id} favoriteIds={favoriteIds} />
      )}
    </div>
  );
}
