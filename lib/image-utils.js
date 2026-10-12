// Pure helpers for uploaded images (no database access, easy to unit test).

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB after the browser has shrunk the photo
export const MAX_UPLOADS_PER_USER = 100;

const INTERNAL_PATTERN = /^\/api\/images\/([a-f\d]{24})$/i;

// Look at the first bytes of the file ("magic bytes") instead of trusting the file name or
// the Content-Type the browser claims. Returns the real type, or null if it is not an allowed image.
export function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export function isInternalImageUrl(url) {
  return typeof url === 'string' && INTERNAL_PATTERN.test(url);
}

export function internalImageId(url) {
  const match = typeof url === 'string' ? url.match(INTERNAL_PATTERN) : null;
  return match ? match[1] : null;
}

export function internalImageIds(urls = []) {
  return urls.map(internalImageId).filter(Boolean);
}
