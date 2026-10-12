'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Catches unexpected errors in any page so visitors see a friendly message, not a stack trace.
export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container page">
      <div className="empty-state" role="alert">
        <h2>Something went wrong</h2>
        <p>We could not load this page. This is usually temporary. If it keeps happening, the database connection may be down.</p>
        <div className="empty-actions">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button>
          <Link href="/" className="btn btn-secondary">Go home</Link>
        </div>
      </div>
    </div>
  );
}
