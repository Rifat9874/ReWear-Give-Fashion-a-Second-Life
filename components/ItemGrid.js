import ItemCard from './ItemCard';

export default function ItemGrid({ items, isLoggedIn, currentUserId = '', favoriteIds = [], showFavorite = true }) {
  const saved = new Set(favoriteIds);
  return (
    <ul className="item-grid">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} isLoggedIn={isLoggedIn} isFavorite={saved.has(item.id)} showFavorite={showFavorite && item.sellerId !== currentUserId} />
        </li>
      ))}
    </ul>
  );
}
