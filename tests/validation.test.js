import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanText,
  isValidObjectId,
  parseBrowseQuery,
  validateImageUrl,
  validateInquiry,
  validateInquiryStatus,
  validateItem,
  validateLogin,
  validateRegister,
  validateReport,
} from '../lib/validation.js';

const goodItem = {
  title: 'Blue slim jeans',
  description: 'Comfortable jeans in great shape.',
  price: '1200',
  category: 'Jeans',
  size: 'W32',
  condition: 'Good',
  location: 'Dhaka',
  images: ['https://images.example.com/jeans.jpg'],
};

test('isValidObjectId accepts 24 hex characters only', () => {
  assert.equal(isValidObjectId('507f1f77bcf86cd799439011'), true);
  assert.equal(isValidObjectId('not-an-id'), false);
  assert.equal(isValidObjectId('507f1f77bcf86cd79943901'), false);
  assert.equal(isValidObjectId({ $ne: null }), false); // NoSQL-injection style input
  assert.equal(isValidObjectId(undefined), false);
});

test('cleanText trims and strips control characters', () => {
  assert.equal(cleanText('  hello\u0000 world \n'), 'hello  world');
  assert.equal(cleanText('line1\nline2', { multiline: true }), 'line1\nline2');
  assert.equal(cleanText(42), '');
});

test('validateRegister accepts a good registration and normalises the email', () => {
  const { values, errors } = validateRegister({ name: ' Ayesha Rahman ', email: 'AYESHA@Example.COM ', password: 'Secret123', confirmPassword: 'Secret123', location: 'Dhaka' });
  assert.deepEqual(errors, {});
  assert.equal(values.email, 'ayesha@example.com');
  assert.equal(values.name, 'Ayesha Rahman');
});

test('validateRegister reports each problem', () => {
  const { errors } = validateRegister({ name: 'A', email: 'nope', password: 'short', confirmPassword: 'different' });
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.password);
});

test('validateRegister requires a letter and a number, and matching passwords', () => {
  assert.ok(validateRegister({ name: 'Ab', email: 'a@b.co', password: 'onlyletters', confirmPassword: 'onlyletters' }).errors.password);
  assert.ok(validateRegister({ name: 'Ab', email: 'a@b.co', password: 'Passw0rd1', confirmPassword: 'Passw0rd2' }).errors.confirmPassword);
  assert.equal(validateRegister({ name: 'Ab', email: 'a@b.co', password: 'Passw0rd1', confirmPassword: '' }).errors.confirmPassword, 'Please confirm your password.');
});

test('validateRegister does not pass unknown fields through (mass assignment)', () => {
  const { values } = validateRegister({ name: 'Ab', email: 'a@b.co', password: 'Passw0rd1', confirmPassword: 'Passw0rd1', isAdmin: true, role: 'admin' });
  assert.equal('isAdmin' in values, false);
  assert.equal('role' in values, false);
});

test('validateLogin requires email and password', () => {
  assert.ok(validateLogin({}).errors.email);
  assert.ok(validateLogin({ email: 'a@b.co' }).errors.password);
  assert.deepEqual(validateLogin({ email: 'a@b.co', password: 'x' }).errors, {});
});

test('validateImageUrl allows public https links only', () => {
  assert.equal(validateImageUrl('https://images.unsplash.com/photo-1?w=800'), null);
  assert.ok(validateImageUrl('http://example.com/a.jpg'));
  assert.ok(validateImageUrl('javascript:alert(1)'));
  assert.ok(validateImageUrl('data:image/png;base64,AAAA'));
  assert.ok(validateImageUrl('https://localhost/a.jpg'));
  assert.ok(validateImageUrl('https://192.168.1.5/a.jpg'));
  assert.ok(validateImageUrl('https://user:pass@example.com/a.jpg'));
  assert.ok(validateImageUrl('not a url'));
  assert.ok(validateImageUrl(''));
});

test('validateItem accepts a valid listing and keeps only whitelisted fields', () => {
  const { values, errors } = validateItem({ ...goodItem, seller: 'someone-else', status: 'Sold', _id: 'x' });
  assert.deepEqual(errors, {});
  assert.equal(values.price, 1200);
  assert.equal('seller' in values, false);
  assert.equal('status' in values, false);
  assert.equal('_id' in values, false);
});

test('validateItem rejects bad prices', () => {
  for (const price of ['', '0', '-5', '12.5', 'abc', '99999999']) {
    assert.ok(validateItem({ ...goodItem, price }).errors.price, `price "${price}" should be rejected`);
  }
});

test('validateItem rejects unknown categories, sizes and conditions', () => {
  const { errors } = validateItem({ ...goodItem, category: 'Weapons', size: 'XXXL', condition: 'Mint' });
  assert.ok(errors.category && errors.size && errors.condition);
});

test('validateItem checks the image list', () => {
  assert.ok(validateItem({ ...goodItem, images: [] }).errors.images);
  assert.ok(validateItem({ ...goodItem, images: ['http://insecure.example.com/a.jpg'] }).errors.images);
  assert.ok(validateItem({ ...goodItem, images: Array(6).fill('https://a.example.com/x.jpg').map((u, i) => `${u}?${i}`) }).errors.images);
  assert.ok(validateItem({ ...goodItem, images: 'https://a.example.com/x.jpg' }).errors.images);
});

test('validateItem enforces text length limits', () => {
  assert.ok(validateItem({ ...goodItem, title: 'x'.repeat(101) }).errors.title);
  assert.ok(validateItem({ ...goodItem, description: 'short' }).errors.description);
});

test('validateInquiry checks id and message', () => {
  assert.ok(validateInquiry({ itemId: 'bad', message: 'Hello there' }).errors.itemId);
  assert.ok(validateInquiry({ itemId: '507f1f77bcf86cd799439011', message: 'hi' }).errors.message);
  assert.deepEqual(validateInquiry({ itemId: '507f1f77bcf86cd799439011', message: 'Is it available?' }).errors, {});
});

test('validateInquiryStatus does not allow setting Pending or unknown values', () => {
  assert.ok(validateInquiryStatus({ status: 'Pending' }).errors.status);
  assert.ok(validateInquiryStatus({ status: 'Hacked' }).errors.status);
  assert.deepEqual(validateInquiryStatus({ status: 'Accepted' }).errors, {});
});

test('validateReport requires a known reason', () => {
  assert.ok(validateReport({ itemId: '507f1f77bcf86cd799439011', reason: 'because' }).errors.reason);
  assert.deepEqual(validateReport({ itemId: '507f1f77bcf86cd799439011', reason: 'Other' }).errors, {});
});

test('parseBrowseQuery ignores invalid values instead of failing', () => {
  const query = parseBrowseQuery(new URLSearchParams('category=Nope&size=Huge&condition=Mint&sort=random&page=-3&minPrice=abc&maxPrice=1e9x'));
  assert.equal(query.category, '');
  assert.equal(query.size, '');
  assert.equal(query.condition, '');
  assert.equal(query.sort, 'newest');
  assert.equal(query.page, 1);
  assert.equal(query.minPrice, null);
  assert.equal(query.maxPrice, null);
});

test('parseBrowseQuery reads valid filters and swaps reversed prices', () => {
  const query = parseBrowseQuery({ q: ' blue jeans ', category: 'Jeans', size: 'W32', condition: 'Good', minPrice: '2000', maxPrice: '500', sort: 'price-asc', page: '3', location: 'Dhaka' });
  assert.equal(query.q, 'blue jeans');
  assert.equal(query.category, 'Jeans');
  assert.equal(query.minPrice, 500);
  assert.equal(query.maxPrice, 2000);
  assert.equal(query.sort, 'price-asc');
  assert.equal(query.page, 3);
  assert.equal(query.location, 'Dhaka');
});

import { validatePasswordChange, validateProfile } from '../lib/validation.js';

test('validateProfile accepts a good profile and ignores email/role fields', () => {
  const { values, errors } = validateProfile({ name: ' Ayesha Rahman ', location: 'Dhaka', bio: 'I love vintage denim.', email: 'x@y.z', isAdmin: true });
  assert.deepEqual(errors, {});
  assert.equal('email' in values, false);
  assert.equal('isAdmin' in values, false);
});

test('validateProfile checks lengths and the photo link', () => {
  assert.ok(validateProfile({ name: 'A' }).errors.name);
  assert.ok(validateProfile({ name: 'Ab', bio: 'x'.repeat(301) }).errors.bio);
  assert.ok(validateProfile({ name: 'Ab', profileImage: 'http://insecure.example.com/a.jpg' }).errors.profileImage);
  assert.deepEqual(validateProfile({ name: 'Ab', profileImage: '/api/images/507f1f77bcf86cd799439011' }).errors, {});
  assert.deepEqual(validateProfile({ name: 'Ab', profileImage: '' }).errors, {});
});

test('validatePasswordChange enforces the password rules', () => {
  assert.ok(validatePasswordChange({}).errors.currentPassword);
  assert.ok(validatePasswordChange({ currentPassword: 'Old12345', newPassword: 'short', confirmPassword: 'short' }).errors.newPassword);
  assert.ok(validatePasswordChange({ currentPassword: 'Old12345', newPassword: 'Old12345', confirmPassword: 'Old12345' }).errors.newPassword);
  assert.ok(validatePasswordChange({ currentPassword: 'Old12345', newPassword: 'New12345', confirmPassword: 'New99999' }).errors.confirmPassword);
  assert.deepEqual(validatePasswordChange({ currentPassword: 'Old12345', newPassword: 'New12345', confirmPassword: 'New12345' }).errors, {});
});
