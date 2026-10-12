// Convert Mongoose documents into plain objects that are safe to send to the
// browser: ids become strings, dates become ISO strings, private fields are dropped.

export function idOf(value) {
  if (!value) return '';
  return String(value._id ?? value);
}

function iso(date) {
  return date ? new Date(date).toISOString() : null;
}

// What anyone may see about a user.
export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: idOf(user),
    name: user.name || 'Former member',
    location: user.location || '',
    profileImage: user.profileImage || '',
    bio: user.bio || '',
    createdAt: iso(user.createdAt),
  };
}

// What a logged-in user may see about themselves (never the password hash).
export function toCurrentUser(user, adminEmail) {
  const email = user.email || '';
  return {
    ...toPublicUser(user),
    email,
    isAdmin: Boolean(adminEmail) && email.toLowerCase() === adminEmail.trim().toLowerCase(),
  };
}

export function toItem(item) {
  const sellerIsPopulated = item.seller && typeof item.seller === 'object' && item.seller.name !== undefined;
  return {
    id: idOf(item),
    title: item.title,
    description: item.description,
    price: item.price,
    category: item.category,
    size: item.size,
    condition: item.condition,
    brand: item.brand || '',
    color: item.color || '',
    measurements: item.measurements || '',
    images: item.images || [],
    location: item.location,
    status: item.status,
    sellerId: idOf(item.seller),
    seller: sellerIsPopulated ? toPublicUser(item.seller) : null,
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.updatedAt),
  };
}

function itemSummary(item) {
  if (!item || typeof item !== 'object' || !item.title) return null;
  return { id: idOf(item), title: item.title, image: item.images?.[0] || '', status: item.status, price: item.price };
}

// An inquiry as seen by one specific person (the viewer).
// The other person's email is only revealed once the seller has ACCEPTED.
export function toInquiry(inquiry, viewerId) {
  const viewerIsSeller = idOf(inquiry.seller) === String(viewerId);
  const other = viewerIsSeller ? inquiry.buyer : inquiry.seller;
  const summary = itemSummary(inquiry.item);
  return {
    id: idOf(inquiry),
    role: viewerIsSeller ? 'received' : 'sent',
    itemId: idOf(inquiry.item),
    itemTitle: summary?.title || inquiry.itemTitle,
    item: summary,
    message: inquiry.message,
    status: inquiry.status,
    createdAt: iso(inquiry.createdAt),
    updatedAt: iso(inquiry.updatedAt),
    counterpart: {
      id: idOf(other),
      name: other?.name || 'Former member',
      email: inquiry.status === 'Accepted' ? other?.email || '' : '',
    },
  };
}

export function toReport(report) {
  return {
    id: idOf(report),
    itemId: idOf(report.item),
    itemTitle: report.itemTitle,
    item: itemSummary(report.item),
    reason: report.reason,
    details: report.details || '',
    status: report.status,
    createdAt: iso(report.createdAt),
    reporter: report.reporter?.name ? { id: idOf(report.reporter), name: report.reporter.name } : null,
  };
}
