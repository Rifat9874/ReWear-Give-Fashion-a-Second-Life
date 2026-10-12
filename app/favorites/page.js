import DbErrorNotice from '@/components/DbErrorNotice';
import EmptyState from '@/components/EmptyState';
import ItemGrid from '@/components/ItemGrid';
import { requireUserPage } from '@/lib/auth';
import { getFavoriteItems } from '@/lib/queries';

export const metadata = { title: 'Your favorites' };

export default async function FavoritesPage() {
  const user = await requireUserPage('/favorites');
  let items = null;
  try {
    items = await getFavoriteItems(user.id); // also removes favorites whose listing was deleted
  } catch (error) {
    console.error('[favorites] could not load:', error.message);
  }

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Your favorites</h1>
        <p className="muted">Items you saved. Sold or reserved items stay here until you remove them.</p>
      </header>
      {items === null ? (
        <DbErrorNotice />
      ) : items.length === 0 ? (
        <EmptyState title="No favorites yet" actionHref="/browse" actionLabel="Browse clothing">
          Tap the heart on any listing to save it here.
        </EmptyState>
      ) : (
        <ItemGrid items={items} isLoggedIn favoriteIds={items.map((item) => item.id)} />
      )}
    </div>
  );
}
