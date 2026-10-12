import EmptyState from '@/components/EmptyState';

export default function ProfileNotFound() {
  return (
    <div className="container page">
      <EmptyState title="Profile not found" actionHref="/browse" actionLabel="Browse clothing">
        This member does not exist or the link is incorrect.
      </EmptyState>
    </div>
  );
}
