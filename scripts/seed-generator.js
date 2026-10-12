// Deterministic generator for bulk demo data (same result every time you seed).
// It creates realistic Bangladeshi names, listings, favorites, inquiries and reports so every
// collection has 100+ records and the pagination, history and moderation pages look real.
import { REPORT_REASONS } from '../lib/constants.js';
import { DEMO_DOMAIN } from './seed-data.js';

export function makeRandom(seed = 20260101) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (random, list) => list[Math.floor(random() * list.length)];
const between = (random, min, max) => Math.floor(min + random() * (max - min + 1));
const roundTo = (value, step) => Math.max(step, Math.round(value / step) * step);
const DAY = 24 * 60 * 60 * 1000;

const FIRST_NAMES = ['Aarav', 'Abir', 'Adnan', 'Afsana', 'Ahnaf', 'Akib', 'Anika', 'Arif', 'Ashik', 'Atiya', 'Badhon', 'Bushra', 'Dipa', 'Eshita', 'Farhan', 'Farzana', 'Fatema', 'Habiba', 'Imran', 'Israt', 'Jannat', 'Jubayer', 'Kabir', 'Labiba', 'Mahin', 'Maliha', 'Mehjabin', 'Mizan', 'Mou', 'Nabila', 'Nafis', 'Naima', 'Nazmul', 'Nishat', 'Omar', 'Orpita', 'Priya', 'Rabeya', 'Rakib', 'Rashed', 'Riya', 'Rubel', 'Sabbir', 'Sadia', 'Sajid', 'Samira', 'Shafin', 'Sharmin', 'Sohan', 'Sumaiya', 'Tahmid', 'Tania', 'Tasnim', 'Towhid', 'Tuba', 'Wasim', 'Zarin', 'Zihad'];
const LAST_NAMES = ['Ahmed', 'Akter', 'Alam', 'Begum', 'Bhuiyan', 'Biswas', 'Chowdhury', 'Das', 'Dey', 'Haque', 'Hasan', 'Hossain', 'Islam', 'Karim', 'Khan', 'Khatun', 'Mahmud', 'Mia', 'Mondal', 'Rahman', 'Reza', 'Roy', 'Sarker', 'Sheikh', 'Siddique', 'Sultana', 'Talukder', 'Uddin'];
export const LOCATIONS = ['Dhanmondi, Dhaka', 'Gulshan, Dhaka', 'Uttara, Dhaka', 'Mirpur, Dhaka', 'Mohammadpur, Dhaka', 'Banani, Dhaka', 'Bashundhara, Dhaka', 'Motijheel, Dhaka', 'Chattogram', 'GEC Circle, Chattogram', 'Agrabad, Chattogram', 'Sylhet', 'Zindabazar, Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla', 'Gazipur', 'Narayanganj', "Cox's Bazar", 'Bogura', 'Jashore'];
const BIOS = ['I clear out my wardrobe every season.', 'Student at DU. Selling things I no longer wear.', 'Love thrifting and giving clothes a second life.', 'Honest descriptions, fair prices.', 'Moving house, so everything must go!', 'Fashion lover who hates waste.', 'Happy to meet near a metro station or a mall.', ''];

export function generateUsers(count, random) {
  const used = new Set();
  const users = [];
  for (let i = 0; users.length < count; i += 1) {
    const first = pick(random, FIRST_NAMES);
    const last = pick(random, LAST_NAMES);
    const email = `${first}.${last}${String(i + 1).padStart(3, '0')}${DEMO_DOMAIN}`.toLowerCase();
    if (used.has(email)) continue;
    used.add(email);
    users.push({ key: `u${String(users.length + 1).padStart(3, '0')}`, name: `${first} ${last}`, email, location: pick(random, LOCATIONS), bio: pick(random, BIOS), daysAgo: between(random, 160, 420) });
  }
  return users;
}

const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Olive', 'Beige', 'Maroon', 'Sky blue', 'Mustard', 'Green', 'Brown', 'Cream', 'Red', 'Pink', 'Charcoal'];
const CATALOG = {
  'T-Shirts': { titles: ['Cotton crew-neck tee', 'Printed graphic t-shirt', 'Striped polo t-shirt', 'Oversized plain tee', 'V-neck basic t-shirt', 'Dry-fit sports t-shirt', 'Henley button tee'], brands: ['Uniqlo', 'H&M', 'Zara', 'Aarong', 'Yellow', 'Westecs', 'Nike', 'Adidas', 'Cats Eye', ''], sizes: ['S', 'M', 'L', 'XL', 'XXL'], price: [180, 700], measure: (r) => `Chest ${between(r, 34, 46)} in, length ${between(r, 25, 30)} in` },
  Shirts: { titles: ['Formal slim-fit shirt', 'Checked casual shirt', 'Linen summer shirt', 'Oxford button-down shirt', 'Denim shirt', 'Printed half-sleeve shirt', 'Flannel shirt'], brands: ['Arong', 'Zara', "Levi's", 'Ecstasy', 'Cats Eye', 'Westecs', 'Marks & Spencer', 'Tommy Hilfiger', ''], sizes: ['S', 'M', 'L', 'XL', 'XXL'], price: [350, 1200], measure: (r) => `Chest ${between(r, 36, 46)} in, sleeve ${between(r, 23, 26)} in` },
  Jeans: { titles: ['Slim-fit jeans', 'Straight-leg jeans', 'High-waist jeans', 'Distressed skinny jeans', 'Relaxed-fit jeans', 'Cargo denim pants', 'Bootcut jeans'], brands: ["Levi's", 'Wrangler', 'Pull&Bear', 'Mango', 'Zara', 'Lee', 'Flying Machine', ''], sizes: ['W28', 'W30', 'W32', 'W34', 'W36', 'W38'], price: [500, 1800], measure: (r) => `Waist ${between(r, 28, 38)} in, inseam ${between(r, 28, 32)} in` },
  Dresses: { titles: ['Floral midi dress', 'Party dress', 'Wrap dress', 'Cotton summer dress', 'Maxi dress', 'Bodycon dress', 'A-line kurti dress'], brands: ['Zara', 'H&M', 'Forever 21', 'Mango', 'Aarong', 'Yellow', ''], sizes: ['XS', 'S', 'M', 'L', 'XL'], price: [600, 3200], measure: (r) => `Bust ${between(r, 32, 40)} in, length ${between(r, 36, 52)} in` },
  Jackets: { titles: ['Denim jacket', 'Bomber jacket', 'Hooded windcheater', 'Puffer jacket', 'Corduroy jacket', 'Faux-leather jacket', 'Winter parka'], brands: ['Wrangler', 'Uniqlo', 'Bershka', 'North Face', 'Zara', 'H&M', 'Columbia', ''], sizes: ['S', 'M', 'L', 'XL'], price: [900, 4500], measure: (r) => `Chest ${between(r, 36, 46)} in, length ${between(r, 22, 30)} in` },
  Sneakers: { titles: ['Running sneakers', 'Canvas sneakers', 'White leather sneakers', 'High-top sneakers', 'Casual slip-ons', 'Training shoes', 'Retro sneakers'], brands: ['Nike', 'Adidas', 'Puma', 'Converse', 'Vans', 'Bata', 'Apex', 'Reebok', ''], sizes: ['EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'], price: [800, 4200], measure: (r) => `Insole ${between(r, 24, 29)} cm` },
  Bags: { titles: ['Leather tote bag', 'Laptop backpack', 'Crossbody bag', 'Canvas shoulder bag', 'Mini handbag', 'Travel duffel bag', 'Sling bag'], brands: ['Aarong', 'Wildcraft', 'Charles & Keith', 'Fossil', 'Skybags', 'American Tourister', 'Hidesign', ''], sizes: ['Free Size'], price: [500, 3200], measure: (r) => `${between(r, 20, 45)} x ${between(r, 14, 32)} x ${between(r, 7, 16)} cm` },
  'Traditional Wear': { titles: ['Cotton salwar kameez set', 'Embroidered panjabi', 'Silk saree', 'Printed three-piece', 'Block-print kurta', 'Jamdani saree', 'Festive sherwani'], brands: ['Aarong', 'Yellow', 'Ecstasy', 'Anjans', 'Kay Kraft', 'Rang Bangladesh', ''], sizes: ['S', 'M', 'L', 'XL', 'Free Size'], price: [900, 7500], measure: (r) => `Length ${between(r, 36, 46)} in` },
};
const CONDITIONS = ['Like New', 'Like New', 'Excellent', 'Excellent', 'Excellent', 'Good', 'Good', 'Good', 'Fair'];
const OPENINGS = { 'Like New': ['Worn once or twice.', 'Practically new, bought but hardly used.'], Excellent: ['Looked after carefully.', 'Worn a few times, no visible wear.'], Good: ['Regularly worn but still in good shape.', 'Some light wear, nothing major.'], Fair: ['Well-loved with visible wear.', 'Priced low because of its age and wear.'] };
const DETAILS = ['Washed and ready to wear.', 'From a smoke-free, pet-free home.', 'No stains, holes or missing buttons.', 'Colour is true to the photos.', 'Comfortable fabric that lasts.', 'Bought from a shopping mall in Dhaka.', 'Selling because it no longer fits me.', 'Goes with almost everything in my wardrobe.'];
const CLOSINGS = ['Happy to share more photos on request.', 'Message me to arrange a meet-up.', 'Price is slightly negotiable for a quick sale.', 'Can meet at a public place nearby.'];

export function generateItems(count, random, sellerKeys, imagePools) {
  const categories = Object.keys(CATALOG);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const category = categories[i % categories.length]; // spread evenly across all 8 categories
    const spec = CATALOG[category];
    const base = pick(random, spec.titles);
    const color = pick(random, COLORS);
    const condition = pick(random, CONDITIONS);
    const roll = random();
    const pool = imagePools[category] || [];
    const images = pool.length ? [pool[Math.floor(random() * pool.length)]] : [];
    if (pool.length > 1 && random() < 0.35) {
      const second = pool[Math.floor(random() * pool.length)];
      if (!images.includes(second)) images.push(second);
    }
    items.push({
      seller: pick(random, sellerKeys),
      title: random() < 0.7 ? `${color} ${base.charAt(0).toLowerCase()}${base.slice(1)}` : base,
      category,
      size: pick(random, spec.sizes),
      condition,
      price: roundTo(between(random, spec.price[0], spec.price[1]), 50),
      brand: pick(random, spec.brands),
      color,
      measurements: random() < 0.55 ? spec.measure(random) : '',
      location: pick(random, LOCATIONS),
      description: `${pick(random, OPENINGS[condition])} ${pick(random, DETAILS)} ${pick(random, CLOSINGS)}`,
      images,
      daysAgo: between(random, 1, 140),
      status: roll < 0.84 ? 'Available' : roll < 0.92 ? 'Reserved' : 'Sold',
    });
  }
  return items;
}

const QUESTIONS = ['Hi! Is this still available?', 'Hello, could you share a few more photos?', 'Is the price negotiable?', 'Can we meet near Dhanmondi this weekend?', 'Does it have any stains or flaws I should know about?', 'Hi, I am interested. What are the exact measurements?', 'Would you take a little less if I pick it up today?', 'Is the brand original? Do you have the tag?', 'Can you hold it for me until Friday?', 'Hello! Where exactly can we meet? I am in Uttara.'];
const REPORT_DETAILS = ['The photos look copied from another website.', 'The price seems too good to be true.', 'Description does not match the pictures.', 'Seller asked me to pay in advance.', 'This looks like a fake brand label.', '', '', ''];
const GHOST_TITLES = ['Designer handbag (replica?)', 'iPhone case bundle', 'Brand new sneakers 90% off', 'Wedding lehenga', 'Fake branded watch', 'Branded polo wholesale', 'Suspicious gift card listing'];

// Build favorites, inquiries and reports that reference real users and items.
// users: [{id, key}]   items: [{id, seller (user id string), status, createdAt (ms), title}]
export function generateRelations({ users, items, random, now, forced }) {
  const visible = items.filter((item) => item.status !== 'Sold');
  const byId = new Map(items.map((item) => [item.id, item]));
  const ago = (ms) => new Date(now - ms);

  // --- favorites (>= 250, unique per user+item, never your own listing)
  const favSeen = new Set();
  const favorites = [];
  const addFavorite = (userId, item) => {
    const key = `${userId}:${item.id}`;
    if (favSeen.has(key) || item.seller === userId) return false;
    favSeen.add(key);
    const created = item.createdAt + random() * (now - item.createdAt);
    favorites.push({ user: userId, item: item.id, createdAt: new Date(created) });
    return true;
  };
  forced.favoriteUsers.forEach((userId) => {
    let added = 0;
    for (let tries = 0; added < 14 && tries < 200; tries += 1) if (addFavorite(userId, pick(random, visible))) added += 1;
  });
  for (let tries = 0; favorites.length < 260 && tries < 5000; tries += 1) addFavorite(pick(random, users).id, pick(random, visible));

  // --- inquiries (>= 150)
  const inquiries = [];
  const pendingSeen = new Set();
  const statusFor = (item) => {
    if (item.status === 'Sold') return pick(random, ['Closed', 'Closed', 'Accepted', 'Declined']);
    const roll = random();
    return roll < 0.38 ? 'Pending' : roll < 0.62 ? 'Accepted' : roll < 0.78 ? 'Declined' : 'Closed';
  };
  const addInquiry = (buyerId, item) => {
    if (item.seller === buyerId) return false;
    let status = statusFor(item);
    if (status === 'Pending' && item.status !== 'Available') status = 'Accepted';
    if (status === 'Pending') {
      const key = `${item.id}:${buyerId}`;
      if (pendingSeen.has(key)) return false;
      pendingSeen.add(key);
    }
    const created = item.createdAt + random() * (now - item.createdAt) * 0.9;
    inquiries.push({
      item: item.id,
      itemTitle: item.title,
      buyer: buyerId,
      seller: item.seller,
      message: pick(random, QUESTIONS),
      status,
      createdAt: new Date(created),
      updatedAt: new Date(status === 'Pending' ? created : Math.min(now, created + (1 + random() * 48) * 3600 * 1000)),
    });
    return true;
  };
  forced.inquiryBuyers.forEach((buyerId) => {
    let added = 0;
    for (let tries = 0; added < 8 && tries < 200; tries += 1) if (addInquiry(buyerId, pick(random, items))) added += 1;
  });
  forced.inquirySellers.forEach((sellerId) => {
    const theirs = items.filter((item) => item.seller === sellerId);
    let added = 0;
    for (let tries = 0; theirs.length && added < 10 && tries < 300; tries += 1) if (addInquiry(pick(random, users).id, pick(random, theirs))) added += 1;
  });
  for (let tries = 0; inquiries.length < 160 && tries < 5000; tries += 1) addInquiry(pick(random, users).id, pick(random, items));

  // --- reports (>= 120): open, dismissed, and "actioned" ones whose listing was already removed
  const reports = [];
  const repSeen = new Set();
  const reasonFor = () => pick(random, REPORT_REASONS);
  for (let tries = 0; reports.length < 80 && tries < 5000; tries += 1) {
    const item = pick(random, visible);
    const reporter = pick(random, users).id;
    const key = `${item.id}:${reporter}`;
    if (item.seller === reporter || repSeen.has(key)) continue;
    repSeen.add(key);
    const created = item.createdAt + random() * (now - item.createdAt);
    const open = random() < 0.62;
    reports.push({ item: item.id, itemTitle: item.title, reporter, reason: reasonFor(), details: pick(random, REPORT_DETAILS), status: open ? 'Open' : 'Dismissed', createdAt: new Date(created), updatedAt: new Date(open ? created : Math.min(now, created + 86400000)) });
  }
  return { favorites, inquiries, reports, ghostReports: (makeId) => {
    const extra = [];
    for (let i = 0; i < 45; i += 1) {
      const created = now - between(random, 2, 120) * DAY;
      extra.push({ item: makeId(), itemTitle: pick(random, GHOST_TITLES), reporter: pick(random, users).id, reason: reasonFor(), details: pick(random, REPORT_DETAILS), status: 'Actioned', createdAt: new Date(created), updatedAt: new Date(created + 86400000) });
    }
    // keep (item, reporter) unique: each ghost uses a fresh item id, so duplicates are impossible
    return extra;
  }, byId };
}
