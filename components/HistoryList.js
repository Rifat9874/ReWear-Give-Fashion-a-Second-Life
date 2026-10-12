import Link from 'next/link';
import { formatDate } from '@/lib/utilities';
import SafeImage from './SafeImage';
import StatusBadge from './StatusBadge';

export default function HistoryList({ events }) {
  return (
    <ul className="history-list">
      {events.map((event) => (
        <li key={event.key} className="history-row">
          <div className="history-thumb">
            <SafeImage src={event.itemImage} alt="" label="" />
          </div>
          <div>
            <p className="history-text">
              {event.verb}{' '}
              {event.itemId ? <Link href={`/items/${event.itemId}`}>{event.itemTitle}</Link> : <span>{event.itemTitle || 'a listing'} (listing removed)</span>}
            </p>
            {event.message ? <p className="history-note">{event.message.length > 140 ? `${event.message.slice(0, 140)}…` : event.message}</p> : null}
          </div>
          <div className="history-meta">
            {event.status ? <StatusBadge status={event.status} /> : null}
            <time dateTime={event.date}>{formatDate(event.date)}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}
