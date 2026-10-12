import Link from 'next/link';
import BrowseFilters from '@/components/BrowseFilters';
import DbErrorNotice from '@/components/DbErrorNotice';
import EmptyState from '@/components/EmptyState';
import ItemGrid from '@/components/ItemGrid';
import Pagination from '@/components/Pagination';
import { getCurrentUser } from '@/lib/auth';
import { getFavoriteIds, searchItems } from '@/lib/items';
import { parseBrowseQuery } from '@/lib/validation';

export const metadata = { title: 'Browse clothing' };

export default async function BrowsePage({ searchParams }) {
  // In Next.js 16, searchParams is a Promise.
  const query = parseBrowseQuery(await searchParams);
  const hasFilters = Boolean(
    query.q || query.category || query.size || query.condition || query.location || query.minPrice !== null || query.maxPrice !== null
  );

  let result = null;
  let user = null;
  let favoriteIds = [];
  let failed = false;
  try {
    user = await getCurrentUser();
    [result, favoriteIds] = await Promise.all([searchItems(query), user ? getFavoriteIds(user.id) : []]);
  } catch (error) {
    console.error('[browse] could not load listings:', error.message);
    failed = true;
  }

  return (
    <div className="container page">
      <header className="page-head">
        <h1>{query.category || 'Browse clothing'}</h1>
        {result ? (
          <p className="muted" aria-live="polite">
            {result.total === 0 ? 'No items found' : `${result.total} item${result.total === 1 ? '' : 's'} found`}
            {query.q ? ` for “${query.q}”` : ''}
          </p>
        ) : null}
      </header>

      <div className="browse-layout">
        <BrowseFilters key={JSON.stringify({ ...query, page: 0 })} query={query} hasFilters={hasFilters} />
        <section aria-label="Results">
          {failed ? (
            <DbErrorNotice />
          ) : result.items.length === 0 ? (
            hasFilters ? (
              <EmptyState title="Nothing matches those filters" actionHref="/browse" actionLabel="Clear all filters">
                Try a different size or a wider price range, or search with fewer words.
              </EmptyState>
            ) : (
              <EmptyState title="No listings yet" actionHref="/sell" actionLabel="Sell an item">
                Nothing has been listed yet. Be the first!
              </EmptyState>
            )
          ) : (
            <>
              <ItemGrid items={result.items} isLoggedIn={Boolean(user)} currentUserId={user?.id} favoriteIds={favoriteIds} />
              <Pagination page={result.page} totalPages={result.totalPages} query={query} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
