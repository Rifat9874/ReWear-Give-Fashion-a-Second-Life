// Fills the database with DEMO data (sample users, listings, a favorite, an inquiry, a report).
//
//   npm run seed          add or refresh the demo data
//   npm run seed:remove   delete the demo data again (do this before real use)
//
// Only records belonging to the @rewear.demo accounts are touched; real users are never deleted.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { detectImageType } from '../lib/image-utils.js';
import { Favorite, Image, Inquiry, Item, Report, User } from '../models/index.js';
import { existsSync, readFileSync } from 'node:fs';
import { DEMO_DOMAIN, DEMO_ITEMS, DEMO_USERS } from './seed-data.js';
import { generateItems, generateRelations, generateUsers, makeRandom } from './seed-generator.js';

// Optional: scripts/my-images.json maps a listing title to your own photo links
// (see scripts/my-images.example.json). Used instead of the built-in links.
const overridePath = new URL('./my-images.json', import.meta.url);
const imageOverrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};

const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'Demo@12345';
const removeOnly = process.argv.includes('--remove');
const PHOTO_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed-photos');

// Loads your own photos from scripts/seed-photos/<category>/ (e.g. jeans, t-shirts, traditional-wear).
async function loadLocalPhotos(category) {
  const folder = path.join(PHOTO_DIR, category.toLowerCase().replace(/\s+/g, '-'));
  let names = [];
  try {
    names = (await readdir(folder)).sort();
  } catch {
    return []; // no folder for this category
  }
  const photos = [];
  for (const name of names) {
    const data = await readFile(path.join(folder, name));
    const contentType = detectImageType(data);
    if (contentType && data.length <= 2 * 1024 * 1024) photos.push({ data, contentType, name });
    else if (/\.(jpe?g|png|webp)$/i.test(name)) console.log(`  skipped ${category}/${name} (not a valid image, or larger than 2 MB)`);
  }
  return photos;
}

async function removeDemoData() {
  const demoUsers = await User.find({ email: { $regex: `${DEMO_DOMAIN.replace('.', '\\.')}$` } }).select('_id');
  const ids = demoUsers.map((user) => user._id);
  if (ids.length === 0) return 0;

  const demoItems = await Item.find({ seller: { $in: ids } }).select('_id');
  const itemIds = demoItems.map((item) => item._id);

  await Promise.all([
    Favorite.deleteMany({ $or: [{ user: { $in: ids } }, { item: { $in: itemIds } }] }),
    Inquiry.deleteMany({ $or: [{ buyer: { $in: ids } }, { seller: { $in: ids } }] }),
    Report.deleteMany({ $or: [{ reporter: { $in: ids } }, { item: { $in: itemIds } }] }),
  ]);
  await Image.deleteMany({ owner: { $in: ids } });
  await Item.deleteMany({ seller: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
  return ids.length;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Create .env.local first (see .env.example).');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed demo data while NODE_ENV=production.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB.');

  const removed = await removeDemoData();
  if (removed) console.log(`Removed ${removed} existing demo account(s) and their data.`);
  if (removeOnly) {
    console.log('Demo data removed.');
    return;
  }

  await Promise.all([User.init(), Item.init(), Favorite.init(), Report.init(), Inquiry.init(), Image.init()]); // make sure indexes exist

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const random = makeRandom(); // fixed seed: the same demo data every time
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const users = {};
  for (const demo of DEMO_USERS) {
    users[demo.key] = await User.create({ name: demo.name, email: demo.email, role: demo.role || 'buyer', location: demo.location, passwordHash, createdAt: new Date(now - 430 * DAY), updatedAt: new Date(now - 430 * DAY) });
  }
  // Extra members so there are 100+ accounts in total.
  const extraUsers = generateUsers(Math.max(0, 100 - DEMO_USERS.length) + 4, random);
  const insertedUsers = await User.insertMany(
    extraUsers.map((u) => ({ name: u.name, email: u.email, role: 'buyer', location: u.location, bio: u.bio, passwordHash, createdAt: new Date(now - u.daysAgo * DAY), updatedAt: new Date(now - u.daysAgo * DAY) }))
  );
  extraUsers.forEach((u, index) => { users[u.key] = insertedUsers[index]; });

  // Photo priority: 1) scripts/my-images.json (by title), 2) your photos in scripts/seed-photos/<category>/
  // (reused across the items of that category), 3) the built-in sample links.
  const photoCache = {};
  const usedCount = {};
  async function imagesFor(entry) {
    if (imageOverrides[entry.title]?.length) return imageOverrides[entry.title];
    const photos = (photoCache[entry.category] ??= await loadLocalPhotos(entry.category));
    if (photos.length === 0) return entry.images;
    const n = (usedCount[entry.category] = (usedCount[entry.category] || 0) + 1);
    const photo = photos[(n - 1) % photos.length];
    const saved = await Image.create({ owner: users[entry.seller]._id, contentType: photo.contentType, size: photo.data.length, data: photo.data });
    return [`/api/images/${saved._id}`];
  }
  // Generated listings reuse the photos of their category (so every category looks populated).
  const imagePools = {};
  for (const entry of DEMO_ITEMS) (imagePools[entry.category] ??= []).push(...(imageOverrides[entry.title] || entry.images));
  const sellerKeys = [...DEMO_USERS.filter((u) => u.key !== 'admin' && u.key !== 'buyer').map((u) => u.key), ...extraUsers.map((u) => u.key)];
  const generatedItems = generateItems(130, random, sellerKeys, imagePools).filter((entry) => entry.images.length);
  const prepared = [];
  for (const entry of [...DEMO_ITEMS, ...generatedItems]) prepared.push({ ...entry, images: await imagesFor(entry) });
  const localCategories = Object.values(photoCache).filter((list) => list.length).length;
  if (localCategories) console.log(`Using your own photos from scripts/seed-photos/ for ${localCategories} categor${localCategories === 1 ? 'y' : 'ies'}.`);

  const items = await Item.insertMany(
    prepared.map(({ seller, daysAgo, ...rest }) => ({
      ...rest,
      seller: users[seller]._id,
      status: rest.status || 'Available',
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    }))
  );

  // Relationships between users and listings: favorites, inquiries and reports (100+ of each).
  const plainItems = items.map((item) => ({ id: String(item._id), seller: String(item.seller), status: item.status, createdAt: new Date(item.createdAt).getTime(), title: item.title }));
  const plainUsers = Object.values(users).map((user) => ({ id: String(user._id) }));
  const relations = generateRelations({
    users: plainUsers,
    items: plainItems,
    random,
    now,
    forced: {
      favoriteUsers: [String(users.buyer._id), String(users.ayesha._id), String(users.rafi._id)],
      inquiryBuyers: [String(users.buyer._id), String(users.nusrat._id)],
      inquirySellers: [String(users.ayesha._id), String(users.rafi._id), String(users.tanvir._id)],
    },
  });
  await Favorite.insertMany(relations.favorites);
  await Inquiry.insertMany(relations.inquiries);
  const ghostReports = relations.ghostReports(() => new mongoose.Types.ObjectId());
  await Report.insertMany([...relations.reports, ...ghostReports]);

  const counts = {
    users: await User.countDocuments({ email: { $regex: `${DEMO_DOMAIN.replace('.', '\\.')}$` } }),
    listings: items.length,
    favorites: relations.favorites.length,
    inquiries: relations.inquiries.length,
    reports: relations.reports.length + ghostReports.length,
  };
  console.log('Demo data created:', counts);
  const tooFew = Object.entries(counts).filter(([, value]) => value < 100);
  if (tooFew.length) throw new Error(`Fewer than 100 records for: ${tooFew.map(([name]) => name).join(', ')}`);

  console.log('\nDemo logins (local use only), password from SEED_PASSWORD, default "Demo@12345":');
  DEMO_USERS.forEach((user) => console.log(`  ${user.email}`));
  console.log(`  ...and ${Object.keys(users).length - DEMO_USERS.length} more members (name.surname###${DEMO_DOMAIN})`);
  console.log('\nTip: set DEMO_LOGIN=true in .env.local for one-click demo buttons on the login page.');
  console.log('\nTo use the admin page, set ADMIN_EMAIL=admin@rewear.demo in .env.local and restart the server.');
  console.log('Remove all demo data before real use with: npm run seed:remove');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
