import { ApiError } from '@/lib/errors';
import { handle, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { MAX_UPLOADS_PER_USER, MAX_UPLOAD_BYTES, detectImageType } from '@/lib/image-utils';
import { Image } from '@/models';

// POST /api/uploads  (multipart/form-data, field "file") - upload one photo (login required)
export const POST = handle(async (request) => {
  const user = await requireUser();

  if (!(request.headers.get('content-type') || '').includes('multipart/form-data')) {
    throw new ApiError(415, 'Photos must be sent as a file upload.');
  }
  if (Number(request.headers.get('content-length') || 0) > MAX_UPLOAD_BYTES + 100 * 1024) {
    throw new ApiError(413, 'That photo is too large. Photos can be up to 2 MB.');
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError(400, 'We could not read that upload. Please try again.');
  }
  const file = form.get('file');
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    throw new ApiError(400, 'No photo was received.');
  }
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, 'That photo is too large. Photos can be up to 2 MB.');

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = detectImageType(buffer); // checks the real bytes, not the file name
  if (!contentType) throw new ApiError(415, 'Only JPG, PNG or WebP photos are allowed.');

  await connectDB();
  if ((await Image.countDocuments({ owner: user.id })) >= MAX_UPLOADS_PER_USER) {
    throw new ApiError(429, 'You have reached the upload limit. Delete old listings to free space.');
  }

  const image = await Image.create({ owner: user.id, contentType, size: buffer.length, data: buffer });
  return ok({ id: String(image._id), url: `/api/images/${image._id}` }, 201);
});
