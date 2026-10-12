import { handle, ok, readJson, validationError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { assertOwnedImages } from '@/lib/images';
import { searchItems } from '@/lib/items';
import { toItem } from '@/lib/serializers';
import { parseBrowseQuery, validateItem } from '@/lib/validation';
import { Item } from '@/models';

// GET /api/items?q=&category=&size=&condition=&minPrice=&maxPrice=&location=&sort=&page=
export const GET = handle(async (request) => {
  const query = parseBrowseQuery(request.nextUrl.searchParams);
  return ok(await searchItems(query));
});

// POST /api/items - create a listing (login required)
export const POST = handle(async (request) => {
  const user = await requireUser();
  const { values, errors } = validateItem(await readJson(request));
  if (Object.keys(errors).length) throw validationError(errors);

  await connectDB();
  await assertOwnedImages(values.images, user.id);
  // The seller always comes from the session, never from the request body.
  const item = await Item.create({ ...values, seller: user.id, status: 'Available' });
  return ok({ item: toItem(item.toObject()) }, 201);
});
