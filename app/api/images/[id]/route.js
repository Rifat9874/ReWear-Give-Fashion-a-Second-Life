import { ApiError } from '@/lib/errors';
import { handle, idParam, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Image, Item, User } from '@/models';

// GET /api/images/:id - serve an uploaded photo (public: listings are public)
export const GET = handle(async (request, context) => {
  const id = await idParam(context);
  await connectDB();
  const image = await Image.findById(id).select('+data contentType').lean();
  if (!image) throw new ApiError(404, 'Photo not found.');

  // lean() may give a Buffer or a BSON Binary depending on the driver; handle both.
  const bytes = Buffer.isBuffer(image.data) ? image.data : Buffer.from(image.data.buffer);
  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': image.contentType,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable', // a photo never changes once uploaded
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
});

// DELETE /api/images/:id - remove an unused photo you uploaded
export const DELETE = handle(async (request, context) => {
  const user = await requireUser();
  const id = await idParam(context);
  await connectDB();
  const image = await Image.findById(id).select('owner').lean();
  if (!image || String(image.owner) !== user.id) throw new ApiError(404, 'Photo not found.');
  // Never delete a photo that a listing is still using.
  const path = `/api/images/${id}`;
  if ((await Item.exists({ images: path })) || (await User.exists({ profileImage: path }))) throw new ApiError(409, 'This photo is in use.');
  await Image.deleteOne({ _id: id });
  return ok({ deleted: true });
});
