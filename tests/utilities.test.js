import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQueryString, escapeRegex, formatDate, formatPrice, initials, safeRedirectPath } from '../lib/utilities.js';

test('formatPrice shows taka with thousands separators', () => {
  assert.equal(formatPrice(350), '৳350');
  assert.equal(formatPrice(1200), '৳1,200');
});

test('formatDate is stable (UTC) and handles bad input', () => {
  assert.equal(formatDate('2026-10-09T10:00:00.000Z'), '9 Oct 2026');
  assert.equal(formatDate('garbage'), '');
  assert.equal(formatDate(null), '');
});

test('escapeRegex neutralises regex characters', () => {
  assert.equal(escapeRegex('a.b*c(d)'), 'a\\.b\\*c\\(d\\)');
  assert.equal(new RegExp(escapeRegex('.*')).test('abc'), false);
});

test('initials', () => {
  assert.equal(initials('Ayesha Rahman'), 'AR');
  assert.equal(initials('Madonna'), 'M');
  assert.equal(initials(''), '?');
});

test('safeRedirectPath blocks open redirects', () => {
  assert.equal(safeRedirectPath('/sell'), '/sell');
  assert.equal(safeRedirectPath('https://evil.com'), '/dashboard');
  assert.equal(safeRedirectPath('//evil.com'), '/dashboard');
  assert.equal(safeRedirectPath('/\\evil.com'), '/dashboard');
  assert.equal(safeRedirectPath('/api/auth/logout'), '/dashboard');
  assert.equal(safeRedirectPath(undefined, '/browse'), '/browse');
});

test('buildQueryString skips empty values', () => {
  assert.equal(buildQueryString({ q: 'jeans', page: '', size: null }), '?q=jeans');
  assert.equal(buildQueryString({}), '');
});
