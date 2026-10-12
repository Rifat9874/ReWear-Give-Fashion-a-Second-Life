import EmptyState from '@/components/EmptyState';

export const metadata = { title: 'Listing not found' };

export default function ItemNotFound() {
  return (
    <div className="container page">
      <EmptyState title="This listing is not available" actionHref="/browse" actionLabel="Browse clothing" secondaryHref="/" secondaryLabel="Go home">
        It may have been removed by the seller or a moderator, or the link may be incorrect.
      </EmptyState>
    </div>
  );
}
