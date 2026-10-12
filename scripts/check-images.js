// Checks that every image link in the seed data still works.
//   npm run check:images
import { existsSync, readFileSync } from 'node:fs';
import { DEMO_ITEMS } from './seed-data.js';

const overridePath = new URL('./my-images.json', import.meta.url);
const overrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};

const urls = [...new Set(DEMO_ITEMS.flatMap((item) => overrides[item.title]?.length ? overrides[item.title] : item.images))];
let broken = 0;

for (const url of urls) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    const type = response.headers.get('content-type') || '';
    const good = response.ok && type.startsWith('image/');
    if (!good) broken += 1;
    console.log(`${good ? 'OK    ' : 'BROKEN'} ${response.status} ${url}`);
  } catch (error) {
    broken += 1;
    console.log(`BROKEN ERR ${url} (${error.message})`);
  }
}

console.log(`\n${urls.length - broken} of ${urls.length} links work.`);
if (broken) {
  console.log('Replace broken links in scripts/seed-data.js with working HTTPS image links, then run npm run seed again.');
  process.exitCode = 1;
}
