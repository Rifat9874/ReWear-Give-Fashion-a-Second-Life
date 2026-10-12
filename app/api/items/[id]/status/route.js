import { ApiError } from '@/lib/errors';
import { handle, idParam, ok, readJson, validationError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { toItem } from '@/lib/serializers';
import { validateStatus } from '@/lib/validation';
import { Inquiry, Item } from '@/models';

// PATCH /api/items/:id/status - mark your listing Available, Reserved or Sold
export const PATCH = handle(async (request, context) => {
  const user = await requireUser();
  const id = await idParam(context);
  const { values, errors } = validateStatus(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  const item = await Item.findById(id);
  if (!item) throw new ApiError(404, 'This listing no longer exists.');
  if (String(item.seller) !== user.id) throw new ApiError(403, 'You can only change your own listings.');

  item.status = values.status;
  await item.save();
  // Once an item is sold, requests that are still waiting no longer make sense.
  if (values.status === 'Sold') await Inquiry.updateMany({ item: item._id, status: 'Pending' }, { $set: { status: 'Closed' } });

  return ok({ item: toItem(item.toObject()) });
});
