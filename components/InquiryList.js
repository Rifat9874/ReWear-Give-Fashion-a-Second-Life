import Link from 'next/link';
import { formatDate } from '@/lib/utilities';
import InquiryActions from './InquiryActions';
import SafeImage from './SafeImage';
import StatusBadge from './StatusBadge';

export default function InquiryList({ inquiries }) {
  return (
    <ul className="inquiry-list">
      {inquiries.map((inquiry) => (
        <li key={inquiry.id} className="inquiry">
          <div className="inquiry-thumb">
            <SafeImage src={inquiry.item?.image} alt="" label="Removed" />
          </div>
          <div className="inquiry-body">
            <div className="inquiry-top">
              <p className="inquiry-title">
                {inquiry.item ? <Link href={`/items/${inquiry.itemId}`}>{inquiry.itemTitle}</Link> : <span>{inquiry.itemTitle} (listing removed)</span>}
              </p>
              <StatusBadge status={inquiry.status} />
            </div>
            <p className="muted">
              {inquiry.role === 'received' ? 'From' : 'To'} {inquiry.counterpart.name} on {formatDate(inquiry.createdAt)}
            </p>
            <p className="inquiry-message">{inquiry.message}</p>
            {inquiry.status === 'Accepted' && inquiry.counterpart.email ? (
              <p className="notice notice-success">
                Contact {inquiry.counterpart.name}: <a href={`mailto:${inquiry.counterpart.email}`}>{inquiry.counterpart.email}</a>
              </p>
            ) : null}
            <InquiryActions inquiry={inquiry} />
          </div>
        </li>
      ))}
    </ul>
  );
}
