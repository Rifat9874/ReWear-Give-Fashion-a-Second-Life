import Link from 'next/link';
import { HangerIcon } from './Icons';

export default function EmptyState({ title, children, actionHref, actionLabel, secondaryHref, secondaryLabel }) {
  return (
    <div className="empty-state">
      <HangerIcon size={44} />
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {actionHref || secondaryHref ? (
        <div className="empty-actions">
          {actionHref ? (
            <Link href={actionHref} className="btn btn-primary">
              {actionLabel}
            </Link>
          ) : null}
          {secondaryHref ? (
            <Link href={secondaryHref} className="btn btn-secondary">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
