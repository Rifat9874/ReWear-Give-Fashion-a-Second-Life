import ItemGridSkeleton from '@/components/ItemGridSkeleton';

export default function BrowseLoading() {
  return (
    <div className="container page" role="status" aria-label="Loading listings">
      <header className="page-head">
        <div className="skeleton skeleton-title" />
      </header>
      <div className="browse-layout">
        <div className="skeleton skeleton-filters" />
        <ItemGridSkeleton count={8} />
      </div>
    </div>
  );
}
