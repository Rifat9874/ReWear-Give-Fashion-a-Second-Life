// Browser-only: shrink a photo before uploading it.
// Phone photos are often 4-8 MB; resizing to ~1400px keeps them sharp but small (usually 150-400 KB),
// which makes uploads fast and keeps the free database tier from filling up.
const MAX_SIDE = 1400;
const MAX_BYTES = 1.8 * 1024 * 1024;

function toBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export async function prepareImage(file, maxSide = MAX_SIDE) {
  if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" is not an image.`);

  let bitmap;
  try {
    bitmap = await createImageBitmap(file); // also applies the phone's rotation (EXIF)
  } catch {
    throw new Error(`We could not read "${file.name}". Please use a JPG, PNG or WebP photo.`);
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff'; // transparent PNGs get a white background in JPEG
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let quality = 0.82;
  let blob = await toBlob(canvas, quality);
  while (blob && blob.size > MAX_BYTES && quality > 0.4) {
    quality -= 0.12;
    blob = await toBlob(canvas, quality);
  }
  if (!blob || blob.size > MAX_BYTES) throw new Error(`"${file.name}" is too large to upload. Try a smaller photo.`);
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
}
