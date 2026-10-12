// Server-side data functions for listings. Used by Server Components AND API routes,
// so the browse page and GET /api/items always behave the same way.
import { connectDB } from './db.js';
import { BROWSABLE_STATUSES, SORTS, buildItemFilter } from './item-filter.js';
import { isValidObjectId } from './validation.js';
import { toItem, toPublicUser } from './serializers.js';
import { CATEGORIES } from './constants.js';
import { deleteInternalImages } from './images.js';
import { Favorite, Inquiry, Item, Report, User } from '../models/index.js';

export async function searchItems(query) {
  await connectDB();
  const filter = buildItemFilter(query);
  const total = await Item.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);

  const docs = await Item.find(filter)
    .sort(SORTS[query.sort] || SORTS.newest)
    .skip((page - 1) * query.limit)
    .limit(query.limit)
    .lean();

  return { items: docs.map(toItem), total, page, totalPages, pageSize: query.limit };
}

export async function getRecentItems(limit = 8) {
  await connectDB();
  const docs = await Item.find({ status: 'Available' }).sort({ createdAt: -1, _id: -1 }).limit(limit).lean();
  return docs.map(toItem);
}

// Real counts per category (only listings that are still available).
export async function getCategoryCounts() {
  await connectDB();
  const rows = await Item.aggregate([
    { $match: { status: 'Available' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  return CATEGORIES.map((name) => ({ name, count: counts[name] || 0 }));
}

export async function getItemById(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Item.findById(id).populate('seller', 'name location profileImage createdAt').lean();
  return doc ? toItem(doc) : null;
}

export async function getSellerProfile(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const user = await User.findById(id).lean(); // passwordHash never selected
  if (!user) return null;
  const docs = await Item.find({ seller: id, status: 'Available' }).sort({ createdAt: -1, _id: -1 }).limit(48).lean();
  return { seller: toPublicUser(user), items: docs.map(toItem), activeCount: docs.length };
}

export async function getFavoriteIds(userId) {
  if (!userId) return [];
  await connectDB();
  const rows = await Favorite.find({ user: userId }).select('item').lean();
  return rows.map((row) => String(row.item));
}

// Deleting a listing also tidies up everything that points at it.
export async function deleteItemCascade(itemId) {
  const item = await Item.findById(itemId).select('images').lean();
  await Item.deleteOne({ _id: itemId });
  if (item) await deleteInternalImages(item.images);
  await Promise.all([
    Favorite.deleteMany({ item: itemId }),
    Inquiry.updateMany({ item: itemId, status: 'Pending' }, { $set: { status: 'Closed' } }),
    Report.updateMany({ item: itemId, status: 'Open' }, { $set: { status: 'Actioned' } }),
  ]);
}

export { BROWSABLE_STATUSES };
