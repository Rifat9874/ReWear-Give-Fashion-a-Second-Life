import Link from 'next/link';
import { connection } from 'next/server';
import DbErrorNotice from '@/components/DbErrorNotice';
import EmptyState from '@/components/EmptyState';
import { HangerIcon } from '@/components/Icons';
import ItemGrid from '@/components/ItemGrid';
import SafeImage from '@/components/SafeImage';
import { getCurrentUser } from '@/lib/auth';
import { getCategoryCounts, getFavoriteIds, getRecentItems } from '@/lib/items';
import { formatPrice } from '@/lib/utilities';
import { CATEGORIES } from '@/lib/constants';

async function loadHomeData() {
  await connection(); // render per request (outside the try/catch below)
  try {
    const user = await getCurrentUser();
    const [recent, categories, favoriteIds] = await Promise.all([
      getRecentItems(8),
      getCategoryCounts(),
      user ? getFavoriteIds(user.id) : [],
    ]);
    return { user, recent, categories, favoriteIds, failed: false };
  } catch (error) {
    console.error('[home] could not load data:', error.message);
    return {
      user: null,
      recent: [],
      categories: CATEGORIES.map((name) => ({ name, count: 0 })),
      favoriteIds: [],
      failed: true,
    };
  }
}

export default async function HomePage() {
  const { user, recent, categories, favoriteIds, failed } = await loadHomeData();
  const heroItems = recent.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Give Your Clothes a Second Life.</h1>
            <p className="lead">
              Affordable, pre-loved fashion from people across Bangladesh. List what you no longer wear, find what you will,
              and arrange the swap directly with the seller.
            </p>
            <div className="hero-actions">
              <Link href="/browse" className="btn btn-primary btn-lg">Explore Clothing</Link>
              <Link href="/sell" className="btn btn-secondary btn-lg">Sell an Item</Link>
            </div>
          </div>

          {heroItems.length > 0 ? (
            <ul className="hero-strip" aria-label="Recently listed items">
              {heroItems.map((item) => (
                <li key={item.id}>
                  <Link href={`/items/${item.id}`} className="hero-photo" aria-label={`${item.title}, ${formatPrice(item.price)}`}>
                    <SafeImage src={item.images[0]} alt="" label={item.category} />
                    <span className="price-tag">{formatPrice(item.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="hero-illustration" aria-hidden="true">
              <HangerIcon size={96} />
              <HangerIcon size={64} />
              <HangerIcon size={80} />
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="categories-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="categories-heading">Shop by category</h2>
          </div>
          <ul className="category-grid">
            {categories.map((category) => (
              <li key={category.name}>
                <Link href={`/browse?category=${encodeURIComponent(category.name)}`} className="category-tile">
                  <span className="category-name">{category.name}</span>
                  {category.count > 0 ? <span className="category-count">{category.count} available</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="recent-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="recent-heading">Just listed</h2>
            {recent.length > 0 ? <Link href="/browse" className="link-arrow">View all listings</Link> : null}
          </div>
          {failed ? (
            <DbErrorNotice />
          ) : recent.length === 0 ? (
            <EmptyState title="No listings yet" actionHref="/sell" actionLabel="List the first item" secondaryHref="/guidelines" secondaryLabel="Read the guidelines">
              Be the first to list something. Run <code>npm run seed</code> to fill the site with sample items while developing.
            </EmptyState>
          ) : (
            <ItemGrid items={recent} isLoggedIn={Boolean(user)} currentUserId={user?.id} favoriteIds={favoriteIds} />
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="how-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="how-heading">How ReWear works</h2>
          </div>
          <ol className="steps">
            <li>
              <h3>List what you no longer wear</h3>
              <p>Add photos, a fair price in taka, the size and the honest condition. It takes a couple of minutes.</p>
            </li>
            <li>
              <h3>Find something you will wear</h3>
              <p>Search and filter by size, condition, price and location to see only what fits you and your budget.</p>
            </li>
            <li>
              <h3>Message the seller and meet up</h3>
              <p>Send an inquiry through ReWear. Once the seller accepts, you can arrange the exchange between yourselves.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="impact" aria-labelledby="impact-heading">
        <div className="container impact-inner">
          <h2 id="impact-heading">The most sustainable garment is the one that already exists.</h2>
          <p>
            Every piece that finds a second owner is one less piece bought new. Choosing pre-loved stretches the life of clothes that
            are still good, keeps them out of the bin, and keeps more money in your pocket.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="join-heading">
        <div className="container cta-panel">
          <div>
            <h2 id="join-heading">{user ? 'Got something to pass on?' : 'Join ReWear'}</h2>
            <p>
              {user
                ? 'List an item in a couple of minutes and let someone else enjoy it.'
                : 'Create a free account to save favorites, message sellers and list your own clothes.'}
            </p>
          </div>
          <Link href={user ? '/sell' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Sell an Item' : 'Create a free account'}
          </Link>
        </div>
      </section>
    </>
  );
}
