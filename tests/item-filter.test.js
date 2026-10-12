import test from 'node:test';
import assert from 'node:assert/strict';
import { buildItemFilter, SORTS } from '../lib/item-filter.js';
import { parseBrowseQuery } from '../lib/validation.js';

test('never shows sold items in browse', () => {
  const filter = buildItemFilter(parseBrowseQuery({}));
  assert.deepEqual(filter.status, { $in: ['Available', 'Reserved'] });
});

test('applies exact filters and a price range', () => {
  const filter = buildItemFilter(parseBrowseQuery({ category: 'Jeans', size: 'W32', condition: 'Good', minPrice: '500', maxPrice: '1500' }));
  assert.equal(filter.category, 'Jeans');
  assert.equal(filter.size, 'W32');
  assert.equal(filter.condition, 'Good');
  assert.deepEqual(filter.price, { $gte: 500, $lte: 1500 });
});

test('a price of 0 is still applied as a minimum', () => {
  const filter = buildItemFilter(parseBrowseQuery({ minPrice: '0' }));
  assert.deepEqual(filter.price, { $gte: 0 });
});

test('every search word must match title, brand or description', () => {
  const filter = buildItemFilter(parseBrowseQuery({ q: 'blue jeans' }));
  assert.equal(filter.$and.length, 2);
  assert.equal(filter.$and[0].$or.length, 3);
});

test('search text is escaped so it cannot be used as a regex', () => {
  const filter = buildItemFilter(parseBrowseQuery({ q: '.*' }));
  const pattern = filter.$and[0].$or[0].title;
  assert.equal(pattern.test('anything at all'), false);
  assert.equal(pattern.test('has .* inside'), true);
});

test('sort options are defined for every allowed value', () => {
  assert.deepEqual(Object.keys(SORTS).sort(), ['newest', 'price-asc', 'price-desc']);
  assert.equal(SORTS['price-asc'].price, 1);
  assert.equal(SORTS['price-desc'].price, -1);
});
