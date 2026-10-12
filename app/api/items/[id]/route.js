import { ApiError } from '@/lib/errors';
import { handle, idParam, ok, readJson, validationError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { assertOwnedImages, deleteInternalImages } from '@/lib/images';
import { deleteItemCascade, getItemById } from '@/lib/items';
import { toItem } from '@/lib/serializers';
import { validateItem } from '@/lib/validation';
import { Item } from '@/models';

// Loads a listing and makes sure the logged-in user owns it.
async function findOwnedItem(id, user) {
  await connectDB();
  const item = await Item.findById(id);
  if (!item) throw new ApiError(404, 'This listing no longer exists.');
  if (String(item.seller) !== user.id) throw new ApiError(403, 'You can only change your own listings.');
  return item;
}

// GET /api/items/:id
export const GET = handle(async (request, context) => {
  const id = await idParam(context);
  const item = await getItemById(id);
  if (!item) throw new ApiError(404, 'This listing no longer exists.');
  return ok({ item });
});

// PATCH /api/items/:id - edit your own listing
export const PATCH = handle(async (request, context) => {
  const user = await requireUser();
  const id = await idParam(context);
  const item = await findOwnedItem(id, user);

  const { values, errors } = validateItem(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await assertOwnedImages(values.images, user.id);
  const previousImages = [...item.images];

  // Only whitelisted fields from validateItem() can be changed (no mass assignment).
  Object.assign(item, values);
  await item.save();
  // Photos the seller removed during the edit are deleted from the database.
  await deleteInternalImages(previousImages.filter((url) => !values.images.includes(url)));
  return ok({ item: toItem(item.toObject()) });
});

// DELETE /api/items/:id - delete your own listing
export const DELETE = handle(async (request, context) => {
  const user = await requireUser();
  const id = await idParam(context);
  const item = await findOwnedItem(id, user);
  await deleteItemCascade(item._id);
  return ok({ deleted: true });
});
