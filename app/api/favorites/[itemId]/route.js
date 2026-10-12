import { handle, idParam, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Favorite } from '@/models';

// DELETE /api/favorites/:itemId - remove a saved item (only your own favorite can be removed)
export const DELETE = handle(async (request, context) => {
  const user = await requireUser();
  const itemId = await idParam(context, 'itemId');
  await connectDB();
  await Favorite.deleteOne({ user: user.id, item: itemId });
  return ok({ favorited: false });
});
