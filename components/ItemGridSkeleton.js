export default function ItemGridSkeleton({ count = 8 }) {
  return (
    <ul className="item-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="card skeleton-card">
          <div className="skeleton skeleton-media" />
          <div className="card-body">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        </li>
      ))}
    </ul>
  );
}
