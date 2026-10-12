// Server-side data for the dashboard, favorites page and admin page.
import { connectDB } from './db.js';
import { toInquiry, toItem, toReport } from './serializers.js';
import { Favorite, Inquiry, Item, Report } from '../models/index.js';

export const HISTORY_TYPES = ['all', 'listing', 'favorite', 'sent', 'received', 'report'];
const HISTORY_PAGE_SIZE = 15;
const HISTORY_CAP = 150; // newest 150 of each kind are merged (keeps the page fast)

const INQUIRY_ITEM_FIELDS = 'title images status price';

export async function getDashboardData(userId) {
  await connectDB();
  const [items, favoriteCount, receivedDocs, sentDocs] = await Promise.all([
    Item.find({ seller: userId }).sort({ createdAt: -1, _id: -1 }).lean(),
    Favorite.countDocuments({ user: userId }),
    Inquiry.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('item', INQUIRY_ITEM_FIELDS)
      .lean(),
    Inquiry.find({ buyer: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('item', INQUIRY_ITEM_FIELDS)
      .lean(),
  ]);

  const listings = items.map(toItem);
  const favoritesReceived = items.length
    ? await Favorite.countDocuments({ item: { $in: items.map((item) => item._id) } })
    : 0;
  const received = receivedDocs.map((doc) => toInquiry(doc, userId));
  const sent = sentDocs.map((doc) => toInquiry(doc, userId));

  // All totals are calculated from real database records.
  return {
    activeListings: listings.filter((item) => item.status === 'Available'),
    closedListings: listings.filter((item) => item.status !== 'Available'),
    favoriteCount,
    received,
    sent,
    stats: {
      active: listings.filter((item) => item.status === 'Available').length,
      reservedOrSold: listings.filter((item) => item.status !== 'Available').length,
      favorites: favoriteCount,
      favoritesReceived,
      pendingInquiries: received.filter((inquiry) => inquiry.status === 'Pending').length,
    },
  };
}

export async function getFavoriteItems(userId) {
  await connectDB();
  const rows = await Favorite.find({ user: userId }).sort({ createdAt: -1 }).populate('item').lean();

  // A favorite whose listing was deleted is cleaned up quietly.
  const orphanIds = rows.filter((row) => !row.item).map((row) => row._id);
  if (orphanIds.length) await Favorite.deleteMany({ _id: { $in: orphanIds } });

  return rows.filter((row) => row.item).map((row) => toItem(row.item));
}

export async function getAdminReports(status = 'Open') {
  await connectDB();
  const filter = status === 'All' ? {} : { status };
  const docs = await Report.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('reporter', 'name')
    .populate('item', INQUIRY_ITEM_FIELDS)
    .lean();
  return docs.map(toReport);
}

export async function getReportCounts() {
  await connectDB();
  const rows = await Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const counts = { Open: 0, Dismissed: 0, Actioned: 0 };
  rows.forEach((row) => {
    counts[row._id] = row.count;
  });
  return counts;
}

// A single timeline of everything the user did on ReWear: listings, favorites,
// inquiries (sent and received) and reports. Counts are exact; the list shows the newest events.
export async function getHistory(userId, { type = 'all', page = 1 } = {}) {
  await connectDB();
  const want = (kind) => type === 'all' || type === kind;
  const itemFields = 'title images status';
  const empty = Promise.resolve([]);

  const [listings, favorites, sent, received, reports, counts] = await Promise.all([
    want('listing') ? Item.find({ seller: userId }).sort({ createdAt: -1 }).limit(HISTORY_CAP).select(`${itemFields} createdAt`).lean() : empty,
    want('favorite') ? Favorite.find({ user: userId }).sort({ createdAt: -1 }).limit(HISTORY_CAP).populate('item', itemFields).lean() : empty,
    want('sent') ? Inquiry.find({ buyer: userId }).sort({ createdAt: -1 }).limit(HISTORY_CAP).populate('seller', 'name').populate('item', itemFields).lean() : empty,
    want('received') ? Inquiry.find({ seller: userId }).sort({ createdAt: -1 }).limit(HISTORY_CAP).populate('buyer', 'name').populate('item', itemFields).lean() : empty,
    want('report') ? Report.find({ reporter: userId }).sort({ createdAt: -1 }).limit(HISTORY_CAP).populate('item', itemFields).lean() : empty,
    Promise.all([
      Item.countDocuments({ seller: userId }),
      Favorite.countDocuments({ user: userId }),
      Inquiry.countDocuments({ buyer: userId }),
      Inquiry.countDocuments({ seller: userId }),
      Report.countDocuments({ reporter: userId }),
    ]),
  ]);

  const summary = (item) => (item && item.title ? { itemId: String(item._id), itemTitle: item.title, itemImage: item.images?.[0] || '', itemStatus: item.status } : { itemId: '', itemTitle: '', itemImage: '', itemStatus: '' });
  const events = [
    ...listings.map((row) => ({ key: `l${row._id}`, type: 'listing', date: row.createdAt, verb: 'You listed', ...summary(row), status: row.status })),
    ...favorites.map((row) => ({ key: `f${row._id}`, type: 'favorite', date: row.createdAt, verb: 'You saved', ...summary(row.item), status: '' })),
    ...sent.map((row) => ({ key: `s${row._id}`, type: 'sent', date: row.createdAt, verb: `You asked ${row.seller?.name || 'a former member'} about`, ...summary(row.item), itemTitle: row.item?.title || row.itemTitle, status: row.status, message: row.message })),
    ...received.map((row) => ({ key: `r${row._id}`, type: 'received', date: row.createdAt, verb: `${row.buyer?.name || 'A former member'} asked about your`, ...summary(row.item), itemTitle: row.item?.title || row.itemTitle, status: row.status, message: row.message })),
    ...reports.map((row) => ({ key: `p${row._id}`, type: 'report', date: row.createdAt, verb: 'You reported', ...summary(row.item), itemTitle: row.item?.title || row.itemTitle, status: row.status, message: row.reason })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.max(1, Math.ceil(events.length / HISTORY_PAGE_SIZE));
  const current = Math.min(Math.max(page, 1), totalPages);
  const slice = events.slice((current - 1) * HISTORY_PAGE_SIZE, current * HISTORY_PAGE_SIZE).map((event) => ({ ...event, date: new Date(event.date).toISOString() }));

  return {
    events: slice,
    page: current,
    totalPages,
    totalShown: events.length,
    counts: { listing: counts[0], favorite: counts[1], sent: counts[2], received: counts[3], report: counts[4], all: counts.reduce((a, b) => a + b, 0) },
  };
}
