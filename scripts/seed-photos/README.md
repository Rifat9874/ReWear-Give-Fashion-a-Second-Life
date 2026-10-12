# Your own sample photos (optional)

Put real photos here and `npm run seed` will use them instead of the sample links.
Photos are **reused** across the items in a category, so 2-3 good photos per category are enough.

Create one folder per category, named exactly like this, and drop JPG, PNG or WebP files in (max 2 MB each):

```
scripts/seed-photos/
  t-shirts/         photo1.jpg  photo2.jpg
  shirts/
  jeans/
  dresses/
  jackets/
  sneakers/
  bags/
  traditional-wear/
```

Categories with no folder (or an empty one) keep the sample image links.
Good seed photos look like real pre-loved listings: the item on a bed, a hanger or a plain floor, natural light, taken with a phone.
Then run `npm run seed` again (it replaces the demo data).
