import EmptyState from '@/components/EmptyState';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState title="We could not find that page" actionHref="/" actionLabel="Go to the home page" secondaryHref="/browse" secondaryLabel="Browse clothing">
        The link may be broken, or the page may have been moved or removed.
      </EmptyState>
    </div>
  );
}
