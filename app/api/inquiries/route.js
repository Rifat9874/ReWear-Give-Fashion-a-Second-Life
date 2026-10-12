import { ApiError } from '@/lib/errors';
import { handle, ok, readJson, validationError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { toInquiry } from '@/lib/serializers';
import { validateInquiry } from '@/lib/validation';
import { Inquiry, Item } from '@/models';

const POPULATE = [
  { path: 'buyer', select: 'name email' },
  { path: 'seller', select: 'name email' },
  { path: 'item', select: 'title images status price' },
];

// GET /api/inquiries - inquiries I sent and inquiries I received
export const GET = handle(async () => {
  const user = await requireUser();
  await connectDB();
  const [sent, received] = await Promise.all([
    Inquiry.find({ buyer: user.id }).sort({ createdAt: -1 }).limit(50).populate(POPULATE).lean(),
    Inquiry.find({ seller: user.id }).sort({ createdAt: -1 }).limit(50).populate(POPULATE).lean(),
  ]);
  return ok({
    sent: sent.map((doc) => toInquiry(doc, user.id)),
    received: received.map((doc) => toInquiry(doc, user.id)),
  });
});

// POST /api/inquiries  { itemId, message } - ask a seller about a listing
export const POST = handle(async (request) => {
  const user = await requireUser();
  const { values, errors } = validateInquiry(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  const item = await Item.findById(values.itemId).select('title seller status').lean();
  if (!item) throw new ApiError(404, 'This listing no longer exists.');
  if (String(item.seller) === user.id) throw new ApiError(400, 'You cannot send an inquiry about your own listing.');
  if (item.status !== 'Available') throw new ApiError(409, 'This item is no longer available.');

  const alreadyAsked = await Inquiry.exists({ item: item._id, buyer: user.id, status: 'Pending' });
  if (alreadyAsked) throw new ApiError(409, 'You already have a pending inquiry for this item. Wait for the seller to reply.');

  const inquiry = await Inquiry.create({
    item: item._id,
    itemTitle: item.title,
    buyer: user.id, // from the session, never from the request body
    seller: item.seller,
    message: values.message,
  });
  return ok({ inquiry: { id: String(inquiry._id), status: inquiry.status } }, 201);
});
