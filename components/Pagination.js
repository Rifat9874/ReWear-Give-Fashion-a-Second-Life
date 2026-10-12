import Link from 'next/link';
import { buildQueryString } from '@/lib/utilities';

// Server-rendered page links. Each link keeps the current filters in the URL.
export default function Pagination({ page, totalPages, query, basePath = '/browse' }) {
  if (totalPages <= 1) return null;

  const href = (target) => {
    const { limit, ...filters } = query; // limit is not part of the public URL
    return `${basePath}${buildQueryString({ ...filters, sort: filters.sort === 'newest' ? '' : filters.sort, page: target === 1 ? '' : target })}`;
  };

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? <Link href={href(page - 1)} rel="prev" className="page-link">Previous</Link> : <span className="page-link is-disabled">Previous</span>}
      <ul>
        {pages.map((number) => (
          <li key={number}>
            <Link href={href(number)} className={`page-link ${number === page ? 'is-current' : ''}`} aria-current={number === page ? 'page' : undefined}>
              {number}
            </Link>
          </li>
        ))}
      </ul>
      {page < totalPages ? <Link href={href(page + 1)} rel="next" className="page-link">Next</Link> : <span className="page-link is-disabled">Next</span>}
    </nav>
  );
}
