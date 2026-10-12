// Server-side helpers that connect listings and uploaded photos.
import { ApiError } from './errors.js';
import { internalImageIds } from './image-utils.js';
import { Image } from '../models/index.js';

// A listing may only use uploaded photos that belong to its seller.
export async function assertOwnedImages(urls, ownerId) {
  const ids = [...new Set(internalImageIds(urls))];
  if (ids.length === 0) return;
  const owned = await Image.countDocuments({ _id: { $in: ids }, owner: ownerId });
  if (owned !== ids.length) {
    throw new ApiError(422, 'One of the photos could not be used. Please upload it again.', {
      images: 'One of the photos could not be used. Please upload it again.',
    });
  }
}

// Remove uploaded photos that are no longer used by a listing.
export async function deleteInternalImages(urls) {
  const ids = internalImageIds(urls);
  if (ids.length) await Image.deleteMany({ _id: { $in: ids } });
}
