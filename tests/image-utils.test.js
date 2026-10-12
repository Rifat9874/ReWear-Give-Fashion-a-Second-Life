import test from 'node:test';
import assert from 'node:assert/strict';
import { detectImageType, internalImageId, internalImageIds, isInternalImageUrl } from '../lib/image-utils.js';
import { validateImageUrl } from '../lib/validation.js';

const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const jpeg = Buffer.from('ffd8ffe000104a46494600010100', 'hex');
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);

test('detectImageType recognises JPG, PNG and WebP by their real bytes', () => {
  assert.equal(detectImageType(png), 'image/png');
  assert.equal(detectImageType(jpeg), 'image/jpeg');
  assert.equal(detectImageType(webp), 'image/webp');
});

test('detectImageType rejects SVG, HTML, text and tiny files', () => {
  assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null);
  assert.equal(detectImageType(Buffer.from('<html><script>alert(1)</script></html>')), null);
  assert.equal(detectImageType(Buffer.from('just some text pretending to be a photo.png')), null);
  assert.equal(detectImageType(Buffer.from([1, 2, 3])), null);
  assert.equal(detectImageType(null), null);
});

test('internal image URLs are matched strictly', () => {
  const id = '507f1f77bcf86cd799439011';
  assert.equal(isInternalImageUrl(`/api/images/${id}`), true);
  assert.equal(internalImageId(`/api/images/${id}`), id);
  assert.equal(isInternalImageUrl(`/api/images/${id}/../../etc`), false);
  assert.equal(isInternalImageUrl('/api/images/short'), false);
  assert.equal(isInternalImageUrl(`//evil.com/api/images/${id}`), false);
  assert.deepEqual(internalImageIds([`/api/images/${id}`, 'https://x.example.com/a.jpg']), [id]);
});

test('validateImageUrl accepts uploaded photos and still rejects unsafe links', () => {
  assert.equal(validateImageUrl('/api/images/507f1f77bcf86cd799439011'), null);
  assert.ok(validateImageUrl('/api/images/not-an-id'));
  assert.ok(validateImageUrl('/some/other/path.jpg'));
});
