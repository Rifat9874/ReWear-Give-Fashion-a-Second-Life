import { ApiError } from '@/lib/errors';
import { handle, ok, readJson } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { isValidObjectId } from '@/lib/validation';
import { getFavoriteItems } from '@/lib/queries';
import { Favorite, Item } from '@/models';

// GET /api/favorites - items the current user has saved
export const GET = handle(async () => {
  const user = await requireUser();
  const items = await getFavoriteItems(user.id);
  return ok({ items });
});

// POST /api/favorites  { itemId } - save an item (safe to repeat)
export const POST = handle(async (request) => {
  const user = await requireUser();
  const { itemId } = await readJson(request);
  if (!isValidObjectId(itemId)) throw new ApiError(400, 'That listing could not be found.');

  await connectDB();
  const item = await Item.findById(itemId).select('seller').lean();
  if (!item) throw new ApiError(404, 'This listing no longer exists.');
  if (String(item.seller) === user.id) throw new ApiError(400, 'You cannot save your own listing.');

  // upsert + the unique index = no duplicate favorites, even with double clicks
  await Favorite.updateOne({ user: user.id, item: itemId }, { $setOnInsert: { user: user.id, item: itemId } }, { upsert: true });
  return ok({ favorited: true }, 201);
});
