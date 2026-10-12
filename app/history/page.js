import Link from 'next/link';
import DbErrorNotice from '@/components/DbErrorNotice';
import EmptyState from '@/components/EmptyState';
import HistoryList from '@/components/HistoryList';
import Pagination from '@/components/Pagination';
import { requireUserPage } from '@/lib/auth';
import { HISTORY_TYPES, getHistory } from '@/lib/queries';

export const metadata = { title: 'Your history' };

const TABS = [
  ['all', 'Everything'],
  ['listing', 'My listings'],
  ['favorite', 'Saved'],
  ['sent', 'Inquiries sent'],
  ['received', 'Inquiries received'],
  ['report', 'Reports'],
];

export default async function HistoryPage({ searchParams }) {
  const user = await requireUserPage('/history');
  const params = await searchParams;
  const type = HISTORY_TYPES.includes(params.type) ? params.type : 'all';
  const page = Math.min(Math.max(parseInt(params.page, 10) || 1, 1), 10000);

  let history = null;
  try {
    history = await getHistory(user.id, { type, page });
  } catch (error) {
    console.error('[history] could not load:', error.message);
  }

  return (
    <div className="container page page-narrow">
      <header className="page-head">
        <h1>Your history</h1>
        <p className="muted">Everything you have done on ReWear, newest first. Only you can see this page.</p>
      </header>

      {!history ? (
        <DbErrorNotice />
      ) : (
        <>
          <nav className="tabs" aria-label="History type">
            {TABS.map(([value, label]) => (
              <Link key={value} href={value === 'all' ? '/history' : `/history?type=${value}`} className={value === type ? 'is-current' : ''} aria-current={value === type ? 'page' : undefined}>
                {label} <span className="tab-count">({history.counts[value]})</span>
              </Link>
            ))}
          </nav>

          {history.events.length === 0 ? (
            <EmptyState title="Nothing here yet" actionHref="/browse" actionLabel="Browse clothing" secondaryHref="/sell" secondaryLabel="Sell an item">
              Your listings, saved items, inquiries and reports will show up here.
            </EmptyState>
          ) : (
            <>
              <HistoryList events={history.events} />
              <Pagination page={history.page} totalPages={history.totalPages} query={{ type: type === 'all' ? '' : type }} basePath="/history" />
            </>
          )}
        </>
      )}
    </div>
  );
}
