import Link from 'next/link';
import DbErrorNotice from '@/components/DbErrorNotice';
import EmptyState from '@/components/EmptyState';
import InquiryList from '@/components/InquiryList';
import ListingActions from '@/components/ListingActions';
import SafeImage from '@/components/SafeImage';
import StatusBadge from '@/components/StatusBadge';
import { requireUserPage } from '@/lib/auth';
import { getDashboardData } from '@/lib/queries';
import { formatDate, formatPrice } from '@/lib/utilities';

export const metadata = { title: 'Your dashboard' };

function ListingTable({ items }) {
  return (
    <ul className="listing-list">
      {items.map((item) => (
        <li key={item.id} className="listing-row">
          <Link href={`/items/${item.id}`} className="listing-thumb" tabIndex={-1} aria-hidden="true">
            <SafeImage src={item.images[0]} alt="" label={item.category} />
          </Link>
          <div className="listing-main">
            <p className="listing-title"><Link href={`/items/${item.id}`}>{item.title}</Link></p>
            <p className="muted">{formatPrice(item.price)} · listed {formatDate(item.createdAt)}</p>
          </div>
          <StatusBadge status={item.status} />
          <ListingActions item={item} />
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const user = await requireUserPage('/dashboard');

  let data = null;
  try {
    data = await getDashboardData(user.id);
  } catch (error) {
    console.error('[dashboard] could not load data:', error.message);
  }

  return (
    <div className="container page">
      <header className="page-head page-head-row">
        <div>
          <h1>Welcome, {user.name.split(' ')[0]}</h1>
          <p className="muted">Manage your listings and keep track of your conversations.</p>
        </div>
        <div className="form-actions">
          <Link href="/account" className="btn btn-secondary">Edit profile</Link>
          <Link href="/history" className="btn btn-secondary">History</Link>
          <Link href="/sell" className="btn btn-primary">Sell an item</Link>
        </div>
      </header>

      {!data ? (
        <DbErrorNotice />
      ) : (
        <>
          <ul className="stat-grid" aria-label="Your numbers">
            <li><span className="stat-value">{data.stats.active}</span><span className="stat-label">Active listings</span></li>
            <li><span className="stat-value">{data.stats.reservedOrSold}</span><span className="stat-label">Reserved or sold</span></li>
            <li><span className="stat-value">{data.stats.pendingInquiries}</span><span className="stat-label">Inquiries awaiting your reply</span></li>
            <li><Link href="/favorites"><span className="stat-value">{data.stats.favorites}</span><span className="stat-label">Items you saved</span></Link></li>
            <li><span className="stat-value">{data.stats.favoritesReceived}</span><span className="stat-label">Times your items were saved</span></li>
          </ul>

          <section className="dash-section" aria-labelledby="active-heading">
            <h2 id="active-heading">Active listings</h2>
            {data.activeListings.length === 0 ? (
              <EmptyState title="You have no active listings" actionHref="/sell" actionLabel="List your first item">
                Items you list will appear here so you can edit, reserve or delete them.
              </EmptyState>
            ) : (
              <ListingTable items={data.activeListings} />
            )}
          </section>

          <section className="dash-section" aria-labelledby="closed-heading">
            <h2 id="closed-heading">Reserved and sold</h2>
            {data.closedListings.length === 0 ? (
              <p className="muted">Items you mark as reserved or sold will move here.</p>
            ) : (
              <ListingTable items={data.closedListings} />
            )}
          </section>

          <div className="dash-columns">
            <section className="dash-section" aria-labelledby="received-heading">
              <h2 id="received-heading">Inquiries about your items</h2>
              {data.received.length === 0 ? (
                <p className="muted">When someone messages you about a listing, it will show up here.</p>
              ) : (
                <InquiryList inquiries={data.received} />
              )}
            </section>
            <section className="dash-section" aria-labelledby="sent-heading">
              <h2 id="sent-heading">Inquiries you sent</h2>
              {data.sent.length === 0 ? (
                <p className="muted">
                  You have not contacted any sellers yet. <Link href="/browse">Find something you like</Link>.
                </p>
              ) : (
                <InquiryList inquiries={data.sent} />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
