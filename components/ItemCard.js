import Link from 'next/link';
import { formatPrice, timeAgo } from '@/lib/utilities';
import FavoriteButton from './FavoriteButton';
import { PinIcon } from './Icons';
import SafeImage from './SafeImage';

// One listing as a "swing tag" card. Server component; only the heart and image are client-side.
export default function ItemCard({ item, isLoggedIn = false, isFavorite = false, showFavorite = true }) {
  const unavailable = item.status !== 'Available';
  return (
    <article className="card">
      <Link href={`/items/${item.id}`} className="card-media" aria-label={`${item.title}, ${formatPrice(item.price)}`} tabIndex={-1}>
        <SafeImage src={item.images[0]} alt="" className="card-img" label={item.category} />
        <span className="price-tag">{formatPrice(item.price)}</span>
        {unavailable ? <span className="card-status">{item.status}</span> : null}
      </Link>
      {showFavorite ? (
        <div className="card-fav">
          <FavoriteButton itemId={item.id} initialFavorited={isFavorite} isLoggedIn={isLoggedIn} />
        </div>
      ) : null}
      <div className="card-body">
        <h3 className="card-title">
          <Link href={`/items/${item.id}`}>{item.title}</Link>
        </h3>
        <div className="chips">
          <span className="chip">{item.size}</span>
          <span className="chip chip-soft">{item.condition}</span>
        </div>
        <p className="card-location">
          <PinIcon /> {item.location}
        </p>
        <p className="card-time">Listed {timeAgo(item.createdAt)}</p>
      </div>
    </article>
  );
}
