// Builds the MongoDB filter and sort for the browse page.
// Pure function (no database access) so it can be unit tested.
import { escapeRegex } from './utilities.js';

export const BROWSABLE_STATUSES = ['Available', 'Reserved'];

export const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  'price-asc': { price: 1, createdAt: -1, _id: -1 },
  'price-desc': { price: -1, createdAt: -1, _id: -1 },
};

export function buildItemFilter(query) {
  const filter = { status: { $in: BROWSABLE_STATUSES } };

  // Every word must appear in the title, brand or description ("blue jeans" finds "Blue slim-fit jeans").
  const words = (query.q || '').split(/\s+/).filter(Boolean).slice(0, 5);
  if (words.length) {
    filter.$and = words.map((word) => {
      const pattern = new RegExp(escapeRegex(word), 'i'); // escaped, so users cannot inject regex
      return { $or: [{ title: pattern }, { brand: pattern }, { description: pattern }] };
    });
  }

  if (query.category) filter.category = query.category;
  if (query.size) filter.size = query.size;
  if (query.condition) filter.condition = query.condition;
  if (query.location) filter.location = new RegExp(escapeRegex(query.location), 'i');

  if (query.minPrice !== null && query.minPrice !== undefined) filter.price = { ...filter.price, $gte: query.minPrice };
  if (query.maxPrice !== null && query.maxPrice !== undefined) filter.price = { ...filter.price, $lte: query.maxPrice };

  return filter;
}
