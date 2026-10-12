import Link from 'next/link';
import { notFound } from 'next/navigation';
import Avatar from '@/components/Avatar';
import ContactSeller from '@/components/ContactSeller';
import FavoriteButton from '@/components/FavoriteButton';
import ImageGallery from '@/components/ImageGallery';
import { PinIcon } from '@/components/Icons';
import ReportButton from '@/components/ReportButton';
import StatusBadge from '@/components/StatusBadge';
import { getCurrentUser } from '@/lib/auth';
import { getFavoriteIds, getItemById } from '@/lib/items';
import { formatDate, formatPrice } from '@/lib/utilities';
import { isValidObjectId } from '@/lib/validation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const item = await getItemById(id);
    if (item) return { title: item.title, description: item.description.slice(0, 150) };
  } catch {
    // fall through to the default title
  }
  return { title: 'Listing' };
}

export default async function ItemPage({ params }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  const item = await getItemById(id); // a database error here shows the error page
  if (!item) notFound();

  let user = null;
  let isFavorite = false;
  try {
    user = await getCurrentUser();
    if (user) isFavorite = (await getFavoriteIds(user.id)).includes(item.id);
  } catch {
    user = null;
  }

  const isOwner = Boolean(user) && user.id === item.sellerId;
  const contactMode = isOwner ? 'owner' : item.status !== 'Available' ? 'unavailable' : user ? 'ok' : 'guest';
  const details = [
    ['Category', item.category],
    ['Size', item.size],
    ['Condition', item.condition],
    ['Brand', item.brand],
    ['Color', item.color],
    ['Measurements', item.measurements],
  ].filter(([, value]) => value);

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/browse">Browse</Link>
        <Link href={`/browse?category=${encodeURIComponent(item.category)}`}>{item.category}</Link>
      </nav>

      {item.status === 'Sold' ? (
        <div className="notice notice-info" role="status">
          <strong>This item has been sold.</strong>
          <p>It is no longer available. <Link href={`/browse?category=${encodeURIComponent(item.category)}`}>See similar {item.category.toLowerCase()}</Link>.</p>
        </div>
      ) : item.status === 'Reserved' ? (
        <div className="notice notice-info" role="status">
          <strong>This item is reserved.</strong>
          <p>The seller is holding it for someone. Check back later or look at similar listings.</p>
        </div>
      ) : null}

      <div className="item-layout">
        <ImageGallery images={item.images} title={item.title} category={item.category} />

        <div className="item-info">
          <div className="item-heading">
            <h1>{item.title}</h1>
            <StatusBadge status={item.status} />
          </div>
          <p className="item-price">{formatPrice(item.price)}</p>
          <p className="card-location"><PinIcon /> {item.location}</p>

          <dl className="spec-list">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>Listed</dt>
              <dd>{formatDate(item.createdAt)}</dd>
            </div>
          </dl>

          <div className="item-description">
            <h2>Description</h2>
            <p>{item.description}</p>
          </div>

          <div className="item-actions">
            <ContactSeller itemId={item.id} itemTitle={item.title} mode={contactMode} nextPath={`/items/${item.id}`} />
            {!isOwner ? (
              <div className="item-actions-row">
                <FavoriteButton itemId={item.id} initialFavorited={isFavorite} isLoggedIn={Boolean(user)} variant="button" />
              </div>
            ) : (
              <div className="item-actions-row">
                <Link href={`/items/${item.id}/edit`} className="btn btn-secondary">Edit listing</Link>
                <Link href="/dashboard" className="btn btn-secondary">Open dashboard</Link>
              </div>
            )}
          </div>

          {item.seller ? (
            <aside className="seller-card" aria-label="Seller">
              <Avatar user={item.seller} />
              <div>
                <p className="seller-name">
                  <Link href={`/profile/${item.seller.id}`}>{item.seller.name}</Link>
                </p>
                {item.seller.location ? <p className="muted">{item.seller.location}</p> : null}
                <p className="muted">Member since {formatDate(item.seller.createdAt)}</p>
              </div>
            </aside>
          ) : null}

          <p className="safety-note">
            ReWear does not verify sellers or guarantee items. Meet in a public place and inspect the item before you pay.{' '}
            <Link href="/guidelines">Read the safety guidelines</Link>.
          </p>
          {!isOwner ? <ReportButton itemId={item.id} isLoggedIn={Boolean(user)} /> : null}
        </div>
      </div>
    </div>
  );
}
