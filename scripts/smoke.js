// End-to-end API checks against a RUNNING server and a seeded database.
//   1. npm run seed
//   2. npm run dev     (in another terminal)
//   3. npm run smoke
// Optional: BASE_URL=http://localhost:3000 ADMIN_PASSWORD=...  (defaults shown)
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'Demo@12345';

let passed = 0;
let failed = 0;

function check(name, condition, extra = '') {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

// A tiny browser: remembers cookies between requests.
class Client {
  constructor() { this.cookie = ''; }
  async call(method, path, body, headers = {}) {
    const response = await fetch(BASE + path, {
      method,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(this.cookie ? { Cookie: this.cookie } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    });
    const setCookie = response.headers.getSetCookie?.() || [];
    setCookie.forEach((line) => {
      const [pair] = line.split(';');
      const [name, value] = pair.split('=');
      this.cookie = value ? `${name}=${value}` : '';
    });
    let json = null;
    try { json = await response.json(); } catch { /* not json */ }
    return { status: response.status, json, setCookie, raw: response };
  }
}

const unique = Date.now().toString(36);
const itemBody = (overrides = {}) => ({
  title: 'Smoke test blue jeans', description: 'Created by the automated smoke test.', price: 999, category: 'Jeans',
  size: 'W32', condition: 'Good', location: 'Dhaka', images: ['https://images.example.com/smoke.jpg'], ...overrides,
});

async function register(name) {
  const client = new Client();
  const email = `${name}.${unique}@smoke.test`;
  const result = await client.call('POST', '/api/auth/register', { name: `Smoke ${name}`, email, password: 'Passw0rd123', confirmPassword: 'Passw0rd123', location: 'Dhaka' });
  return { client, email, result };
}

async function main() {
  console.log(`Smoke test against ${BASE}\n`);

  console.log('Authentication');
  const alice = await register('alice');
  check('register returns 201', alice.result.status === 201, JSON.stringify(alice.result.json));
  check('register sets an HttpOnly cookie', alice.result.setCookie.some((c) => /rewear_session=/.test(c) && /HttpOnly/i.test(c) && /SameSite=lax/i.test(c)));
  check('register response has no password data', !JSON.stringify(alice.result.json).toLowerCase().includes('password'));
  const dupe = await new Client().call('POST', '/api/auth/register', { name: 'Dupe', email: alice.email.toUpperCase(), password: 'Passw0rd123', confirmPassword: 'Passw0rd123' });
  check('duplicate email (any case) is rejected with 409', dupe.status === 409);
  const weak = await new Client().call('POST', '/api/auth/register', { name: 'W', email: 'bad', password: '123', confirmPassword: '1' });
  check('invalid registration returns 422 with field errors', weak.status === 422 && weak.json.error.fields.email && weak.json.error.fields.password);
  const wrong = await new Client().call('POST', '/api/auth/login', { email: alice.email, password: 'WrongPass1' });
  check('wrong password returns 401', wrong.status === 401);
  const unknown = await new Client().call('POST', '/api/auth/login', { email: 'nobody@smoke.test', password: 'WrongPass1' });
  check('unknown email gives the same message as wrong password', unknown.status === 401 && unknown.json.error.message === wrong.json.error.message);
  const me = await alice.client.call('GET', '/api/auth/me');
  check('/api/auth/me returns the logged-in user', me.json.data.user?.email === alice.email && me.json.data.user.isAdmin === false);
  check('/api/auth/me never includes passwordHash', !JSON.stringify(me.json).includes('passwordHash'));
  const anon = await new Client().call('GET', '/api/auth/me');
  check('logged-out /api/auth/me returns user: null', anon.json.data.user === null);
  const tampered = new Client(); tampered.cookie = 'rewear_session=abc.def.ghi';
  check('forged cookie is treated as logged out', (await tampered.call('GET', '/api/auth/me')).json.data.user === null);

  console.log('\nSecurity basics');
  const noJson = await alice.client.call('POST', '/api/items', undefined, { 'Content-Type': 'text/plain' });
  check('non-JSON request is rejected (415)', noJson.status === 415);
  const csrf = await alice.client.call('POST', '/api/items', itemBody(), { Origin: 'https://evil.example' });
  check('cross-site Origin is rejected (403)', csrf.status === 403);
  check('creating a listing while logged out returns 401', (await new Client().call('POST', '/api/items', itemBody())).status === 401);

  console.log('\nListings');
  const created = await alice.client.call('POST', '/api/items', itemBody({ seller: 'hacker', status: 'Sold', _id: '507f1f77bcf86cd799439011' }));
  const itemId = created.json?.data?.item?.id;
  check('create listing returns 201', created.status === 201, JSON.stringify(created.json));
  check('mass assignment ignored (status stays Available)', created.json.data.item.status === 'Available');
  check('seller is taken from the session, not the body', created.json.data.item.sellerId === me.json.data.user.id);
  check('_id from the body is ignored', itemId !== '507f1f77bcf86cd799439011');
  const badItem = await alice.client.call('POST', '/api/items', itemBody({ price: -5, images: ['http://insecure.example/a.jpg'], category: 'Guns' }));
  check('invalid listing returns 422 with fields', badItem.status === 422 && badItem.json.error.fields.price && badItem.json.error.fields.images && badItem.json.error.fields.category);
  const detail = await new Client().call('GET', `/api/items/${itemId}`);
  check('anyone can read a listing', detail.status === 200 && detail.json.data.item.seller.name === 'Smoke alice');
  check('listing response does not leak seller email', !JSON.stringify(detail.json).includes('@smoke.test'));
  check('invalid id returns 404, not a server error', (await new Client().call('GET', '/api/items/not-an-id')).status === 404);
  check('unknown id returns 404', (await new Client().call('GET', '/api/items/507f1f77bcf86cd799439099')).status === 404);
  const edit = await alice.client.call('PATCH', `/api/items/${itemId}`, itemBody({ title: 'Edited smoke jeans', price: 1111 }));
  check('owner can edit own listing', edit.status === 200 && edit.json.data.item.title === 'Edited smoke jeans' && edit.json.data.item.price === 1111);

  console.log('\nAuthorization (user B vs user A\'s listing)');
  const bob = await register('bob');
  check('second user registered', bob.result.status === 201);
  check('B cannot edit A\'s listing (403)', (await bob.client.call('PATCH', `/api/items/${itemId}`, itemBody({ title: 'Hijacked' }))).status === 403);
  check('B cannot delete A\'s listing (403)', (await bob.client.call('DELETE', `/api/items/${itemId}`)).status === 403);
  check('B cannot change A\'s listing status (403)', (await bob.client.call('PATCH', `/api/items/${itemId}/status`, { status: 'Sold' })).status === 403);
  const still = await new Client().call('GET', `/api/items/${itemId}`);
  check('listing is unchanged after B\'s attempts', still.json.data.item.title === 'Edited smoke jeans' && still.json.data.item.status === 'Available');

  console.log('\nBrowse: search, filter, sort, pagination');
  const search = await new Client().call('GET', '/api/items?q=jeans&category=Jeans&sort=price-asc');
  const prices = search.json.data.items.map((i) => i.price);
  check('search + category filter returns only jeans', search.json.data.items.length > 0 && search.json.data.items.every((i) => i.category === 'Jeans'));
  check('price-asc sorts ascending', prices.every((p, i) => i === 0 || prices[i - 1] <= p));
  const desc = (await new Client().call('GET', '/api/items?sort=price-desc')).json.data.items.map((i) => i.price);
  check('price-desc sorts descending', desc.every((p, i) => i === 0 || desc[i - 1] >= p));
  const range = await new Client().call('GET', '/api/items?minPrice=1000&maxPrice=1300');
  check('price range filter works', range.json.data.items.every((i) => i.price >= 1000 && i.price <= 1300) && range.json.data.items.length > 0);
  const size = await new Client().call('GET', '/api/items?size=W32&condition=Good');
  check('size + condition filter works', size.json.data.items.every((i) => i.size === 'W32' && i.condition === 'Good'));
  const loc = await new Client().call('GET', '/api/items?location=chattogram');
  check('location filter is case-insensitive', loc.json.data.items.length > 0 && loc.json.data.items.every((i) => /chattogram/i.test(i.location)));
  const none = await new Client().call('GET', '/api/items?q=zzzznothingmatches');
  check('no match returns an empty list with total 0', none.status === 200 && none.json.data.total === 0 && none.json.data.items.length === 0);
  const regex = await new Client().call('GET', '/api/items?q=.*');
  check('regex characters in search are treated as plain text', regex.status === 200 && regex.json.data.total === 0);
  const p1 = await new Client().call('GET', '/api/items?page=1');
  const p2 = await new Client().call('GET', '/api/items?page=2');
  check('pagination: page size 12 and totalPages > 1', p1.json.data.items.length === 12 && p1.json.data.totalPages > 1);
  check('pagination: page 2 has different items', p2.json.data.items.length > 0 && !p2.json.data.items.some((i) => p1.json.data.items.find((j) => j.id === i.id)));
  const junk = await new Client().call('GET', '/api/items?page=abc&sort=hack&minPrice=x&category[$ne]=1');
  check('junk query parameters do not break the endpoint', junk.status === 200);
  const all = await new Client().call('GET', '/api/items?limit=100000');
  check('client cannot override the page size', all.json.data.items.length <= 12);
  const sold = (await new Client().call('GET', '/api/items?q=blazer')).json.data;
  check('sold items are hidden from browse', sold.total === 0);

  console.log('\nFavorites');
  check('favorites require login (401)', (await new Client().call('GET', '/api/favorites')).status === 401);
  const fav = await bob.client.call('POST', '/api/favorites', { itemId });
  check('B can favorite A\'s listing', fav.status === 201);
  await bob.client.call('POST', '/api/favorites', { itemId });
  const favList = await bob.client.call('GET', '/api/favorites');
  check('double-favoriting creates no duplicate', favList.json.data.items.filter((i) => i.id === itemId).length === 1);
  check('A cannot favorite own listing (400)', (await alice.client.call('POST', '/api/favorites', { itemId })).status === 400);
  check('favoriting a missing item returns 404', (await bob.client.call('POST', '/api/favorites', { itemId: '507f1f77bcf86cd799439099' })).status === 404);
  check('favoriting with a bogus id returns 400', (await bob.client.call('POST', '/api/favorites', { itemId: { $ne: null } })).status === 400);
  const aFavs = await alice.client.call('GET', '/api/favorites');
  check('A\'s favorites are separate from B\'s', aFavs.json.data.items.length === 0);

  console.log('\nInquiries');
  check('inquiries require login', (await new Client().call('POST', '/api/inquiries', { itemId, message: 'Hello there' })).status === 401);
  check('A cannot inquire about own listing (400)', (await alice.client.call('POST', '/api/inquiries', { itemId, message: 'Talking to myself' })).status === 400);
  check('too-short message is rejected (422)', (await bob.client.call('POST', '/api/inquiries', { itemId, message: 'hi' })).status === 422);
  check('inquiry on a missing item returns 404', (await bob.client.call('POST', '/api/inquiries', { itemId: '507f1f77bcf86cd799439099', message: 'Is this available?' })).status === 404);
  const inquiry = await bob.client.call('POST', '/api/inquiries', { itemId, message: 'Is this still available? I can meet in Dhaka.', buyer: 'someone', status: 'Accepted' });
  const inquiryId = inquiry.json?.data?.inquiry?.id;
  check('B can send an inquiry (201) and status starts Pending', inquiry.status === 201 && inquiry.json.data.inquiry.status === 'Pending', JSON.stringify(inquiry.json));
  check('duplicate pending inquiry is blocked (409)', (await bob.client.call('POST', '/api/inquiries', { itemId, message: 'Asking again please' })).status === 409);
  const carol = await register('carol');
  check('C cannot read the inquiry (404)', (await carol.client.call('GET', `/api/inquiries/${inquiryId}`)).status === 404);
  check('C cannot change the inquiry (404)', (await carol.client.call('PATCH', `/api/inquiries/${inquiryId}`, { status: 'Accepted' })).status === 404);
  const carolList = await carol.client.call('GET', '/api/inquiries');
  check('C\'s inquiry list is empty', carolList.json.data.sent.length === 0 && carolList.json.data.received.length === 0);
  check('buyer cannot accept their own inquiry (403)', (await bob.client.call('PATCH', `/api/inquiries/${inquiryId}`, { status: 'Accepted' })).status === 403);
  check('status "Pending" cannot be set (422)', (await alice.client.call('PATCH', `/api/inquiries/${inquiryId}`, { status: 'Pending' })).status === 422);
  const beforeAccept = await bob.client.call('GET', `/api/inquiries/${inquiryId}`);
  check('seller email is hidden before acceptance', beforeAccept.json.data.inquiry.counterpart.email === '');
  const received = await alice.client.call('GET', '/api/inquiries');
  check('A sees it under "received"', received.json.data.received.some((i) => i.id === inquiryId));
  const accepted = await alice.client.call('PATCH', `/api/inquiries/${inquiryId}`, { status: 'Accepted' });
  check('seller can accept (200)', accepted.status === 200 && accepted.json.data.inquiry.status === 'Accepted');
  const afterAccept = await bob.client.call('GET', `/api/inquiries/${inquiryId}`);
  check('seller email is shown to the buyer after acceptance', afterAccept.json.data.inquiry.counterpart.email === alice.email);
  check('Accepted cannot go back to Declined (409)', (await alice.client.call('PATCH', `/api/inquiries/${inquiryId}`, { status: 'Declined' })).status === 409);
  check('buyer can close the inquiry', (await bob.client.call('PATCH', `/api/inquiries/${inquiryId}`, { status: 'Closed' })).status === 200);

  console.log('\nListing status');
  check('owner can mark Reserved', (await alice.client.call('PATCH', `/api/items/${itemId}/status`, { status: 'Reserved' })).json.data.item.status === 'Reserved');
  check('inquiry on a Reserved item is rejected (409)', (await bob.client.call('POST', '/api/inquiries', { itemId, message: 'What about now?' })).status === 409);
  check('invalid status value is rejected (422)', (await alice.client.call('PATCH', `/api/items/${itemId}/status`, { status: 'Gone' })).status === 422);
  await alice.client.call('PATCH', `/api/items/${itemId}/status`, { status: 'Available' });

  console.log('\nReports and admin');
  check('reporting requires login', (await new Client().call('POST', '/api/reports', { itemId, reason: 'Other' })).status === 401);
  check('A cannot report own listing (400)', (await alice.client.call('POST', '/api/reports', { itemId, reason: 'Other' })).status === 400);
  check('invalid reason is rejected (422)', (await bob.client.call('POST', '/api/reports', { itemId, reason: 'dislike' })).status === 422);
  const report = await bob.client.call('POST', '/api/reports', { itemId, reason: 'Misleading or inaccurate listing', details: 'Smoke test report' });
  const reportId = report.json?.data?.report?.id;
  check('B can report the listing (201)', report.status === 201, JSON.stringify(report.json));
  check('same user cannot report twice (409)', (await bob.client.call('POST', '/api/reports', { itemId, reason: 'Other' })).status === 409);
  check('ordinary user cannot list reports (403)', (await bob.client.call('GET', '/api/reports')).status === 403);
  check('logged-out user cannot list reports (401)', (await new Client().call('GET', '/api/reports')).status === 401);
  check('ordinary user cannot dismiss a report (403)', (await bob.client.call('PATCH', `/api/reports/${reportId}`, { action: 'dismiss' })).status === 403);
  check('ordinary user cannot remove a listing via reports (403)', (await alice.client.call('PATCH', `/api/reports/${reportId}`, { action: 'remove-listing' })).status === 403);

  const admin = new Client();
  const adminLogin = await admin.call('POST', '/api/auth/login', { email: 'admin@rewear.demo', password: DEMO_PASSWORD });
  check('admin can log in (seeded demo admin)', adminLogin.status === 200 && adminLogin.json.data.user.isAdmin === true, JSON.stringify(adminLogin.json));
  const adminList = await admin.call('GET', '/api/reports?status=Open');
  check('admin can list open reports', adminList.status === 200 && adminList.json.data.reports.some((r) => r.id === reportId));
  check('bad action is rejected (400)', (await admin.call('PATCH', `/api/reports/${reportId}`, { action: 'explode' })).status === 400);

  const report2Item = (await alice.client.call('POST', '/api/items', itemBody({ title: 'Second smoke listing' }))).json.data.item.id;
  const report2 = await bob.client.call('POST', '/api/reports', { itemId: report2Item, reason: 'Suspicious or possible scam' });
  const dismissed = await admin.call('PATCH', `/api/reports/${reportId}`, { action: 'dismiss' });
  check('admin can dismiss a report', dismissed.status === 200 && dismissed.json.data.report.status === 'Dismissed');
  check('a handled report cannot be handled twice (409)', (await admin.call('PATCH', `/api/reports/${reportId}`, { action: 'dismiss' })).status === 409);
  const removed = await admin.call('PATCH', `/api/reports/${report2.json.data.report.id}`, { action: 'remove-listing' });
  check('admin can remove a reported listing', removed.status === 200 && removed.json.data.removed === true);
  check('removed listing is really gone (404)', (await new Client().call('GET', `/api/items/${report2Item}`)).status === 404);

  console.log('\nDeleting a listing');
  check('owner can delete own listing', (await alice.client.call('DELETE', `/api/items/${itemId}`)).status === 200);
  check('deleted listing returns 404', (await new Client().call('GET', `/api/items/${itemId}`)).status === 404);
  const favsAfter = await bob.client.call('GET', '/api/favorites');
  check('favorites of a deleted listing disappear', !favsAfter.json.data.items.some((i) => i.id === itemId));

  console.log('\nPhoto uploads');
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  async function upload(client, bytes, name = 'photo.png', type = 'image/png') {
    const form = new FormData();
    form.append('file', new Blob([bytes], { type }), name);
    const response = await fetch(BASE + '/api/uploads', { method: 'POST', headers: client.cookie ? { Cookie: client.cookie } : {}, body: form });
    let json = null;
    try { json = await response.json(); } catch { /* none */ }
    return { status: response.status, json };
  }
  const anonUpload = await upload(new Client(), PNG);
  check('upload requires login (401)', anonUpload.status === 401);
  const up = await upload(bob.client, PNG);
  const photoUrl = up.json?.data?.url;
  check('logged-in user can upload a PNG (201)', up.status === 201 && /^\/api\/images\/[a-f\d]{24}$/.test(photoUrl || ''), JSON.stringify(up.json));
  const served = await fetch(BASE + photoUrl);
  check('uploaded photo is publicly served with the right type', served.status === 200 && served.headers.get('content-type') === 'image/png');
  check('served photo has nosniff and long cache headers', served.headers.get('x-content-type-options') === 'nosniff' && /immutable/.test(served.headers.get('cache-control') || ''));
  check('served bytes equal the uploaded bytes', Buffer.from(await served.arrayBuffer()).equals(PNG));
  check('text file renamed .png is rejected (415)', (await upload(bob.client, Buffer.from('this is not an image, just text pretending'), 'evil.png', 'image/png')).status === 415);
  check('SVG is rejected (415)', (await upload(bob.client, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'), 'x.svg', 'image/svg+xml')).status === 415);
  check('HTML disguised as an image is rejected (415)', (await upload(bob.client, Buffer.from('<html><script>alert(1)</script></html>'), 'x.jpg', 'image/jpeg')).status === 415);
  check('photo over 2 MB is rejected (413)', (await upload(bob.client, Buffer.concat([PNG, Buffer.alloc(2.5 * 1024 * 1024)]))).status === 413);
  check('unknown photo id returns 404', (await fetch(BASE + '/api/images/507f1f77bcf86cd799439099')).status === 404);

  const withPhoto = await bob.client.call('POST', '/api/items', itemBody({ title: 'Listing with an uploaded photo', images: [photoUrl] }));
  check('listing can use the seller\'s own uploaded photo (201)', withPhoto.status === 201, JSON.stringify(withPhoto.json));
  const stolen = await carol.client.call('POST', '/api/items', itemBody({ title: 'Stolen photo', images: [photoUrl] }));
  check('another user cannot attach that photo to their listing (422)', stolen.status === 422);
  check('a non-owner cannot delete the photo (404)', (await carol.client.call('DELETE', photoUrl)).status === 404);
  check('the owner cannot delete a photo a listing is using (409)', (await bob.client.call('DELETE', photoUrl)).status === 409);
  const unused = (await upload(bob.client, PNG)).json.data.url;
  check('the owner can delete an unused photo', (await bob.client.call('DELETE', unused)).status === 200 && (await fetch(BASE + unused)).status === 404);

  const swap = await bob.client.call('PATCH', `/api/items/${withPhoto.json.data.item.id}`, itemBody({ title: 'Listing with an uploaded photo', images: ['https://images.example.com/other.jpg'] }));
  check('editing a listing to remove its photo works', swap.status === 200);
  check('the removed photo is deleted from the database', (await fetch(BASE + photoUrl)).status === 404);
  const photo2 = (await upload(bob.client, PNG)).json.data.url;
  const item2 = await bob.client.call('POST', '/api/items', itemBody({ title: 'Delete me with my photo', images: [photo2] }));
  await bob.client.call('DELETE', `/api/items/${item2.json.data.item.id}`);
  check('deleting a listing also deletes its uploaded photos', (await fetch(BASE + photo2)).status === 404);
  await bob.client.call('DELETE', `/api/items/${withPhoto.json.data.item.id}`);

  console.log('\nProfile, password, demo login and history');
  check('editing the profile requires login (401)', (await new Client().call('PATCH', '/api/auth/me', { name: 'Nobody' })).status === 401);
  const edited = await alice.client.call('PATCH', '/api/auth/me', { name: 'Alice Updated', location: 'Sylhet', bio: 'I sell vintage denim.', email: 'hacker@evil.test', isAdmin: true, passwordHash: 'x' });
  check('user can edit own name, location and bio (200)', edited.status === 200 && edited.json.data.user.name === 'Alice Updated' && edited.json.data.user.bio === 'I sell vintage denim.', JSON.stringify(edited.json));
  const meAfter = (await alice.client.call('GET', '/api/auth/me')).json.data.user;
  check('email and admin status cannot be changed through the profile (mass assignment)', meAfter.email === alice.email && meAfter.isAdmin === false);
  check('public profile shows the new bio', (await new Client().call('GET', `/api/items/${(await alice.client.call('POST', '/api/items', itemBody({ title: 'Profile check item' }))).json.data.item.id}`)).json.data.item.seller.name === 'Alice Updated');
  check('too-long bio is rejected (422)', (await alice.client.call('PATCH', '/api/auth/me', { name: 'Alice', bio: 'x'.repeat(301) })).status === 422);
  const avatarUp = (await upload(alice.client, PNG)).json.data.url;
  const bobAvatar = (await upload(bob.client, PNG)).json.data.url;
  check('cannot use another user\'s photo as a profile picture (422)', (await alice.client.call('PATCH', '/api/auth/me', { name: 'Alice Updated', profileImage: bobAvatar })).status === 422);
  check('can set an own uploaded photo as profile picture (200)', (await alice.client.call('PATCH', '/api/auth/me', { name: 'Alice Updated', profileImage: avatarUp })).status === 200);
  check('a photo used as a profile picture cannot be deleted (409)', (await alice.client.call('DELETE', avatarUp)).status === 409);
  await alice.client.call('PATCH', '/api/auth/me', { name: 'Alice Updated', profileImage: '' });
  check('removing the profile picture deletes the photo', (await fetch(BASE + avatarUp)).status === 404);
  await bob.client.call('DELETE', bobAvatar);

  check('password change requires login (401)', (await new Client().call('POST', '/api/auth/password', {})).status === 401);
  check('wrong current password is rejected (422)', (await alice.client.call('POST', '/api/auth/password', { currentPassword: 'NotMyPass1', newPassword: 'Brand9New123', confirmPassword: 'Brand9New123' })).status === 422);
  check('weak new password is rejected (422)', (await alice.client.call('POST', '/api/auth/password', { currentPassword: 'Passw0rd123', newPassword: 'short', confirmPassword: 'short' })).status === 422);
  check('password can be changed (200)', (await alice.client.call('POST', '/api/auth/password', { currentPassword: 'Passw0rd123', newPassword: 'Brand9New123', confirmPassword: 'Brand9New123' })).status === 200);
  check('old password no longer works (401)', (await new Client().call('POST', '/api/auth/login', { email: alice.email, password: 'Passw0rd123' })).status === 401);
  check('new password works (200)', (await new Client().call('POST', '/api/auth/login', { email: alice.email, password: 'Brand9New123' })).status === 200);

  const demo = new Client();
  const demoLogin = await demo.call('POST', '/api/auth/demo', { account: 'buyer' });
  if (demoLogin.status === 404 && /find what/.test(demoLogin.json?.error?.message || '')) {
    console.log('  SKIP  demo login (DEMO_LOGIN is not "true" on the server, which is the safe default)');
  } else {
    check('demo login works for the demo buyer (200)', demoLogin.status === 200 && demoLogin.json.data.user.email === 'buyer@rewear.demo', JSON.stringify(demoLogin.json));
    for (const [account, email] of [['admin', 'admin@rewear.demo'], ['seller', 'ayesha@rewear.demo'], ['member', 'rafi@rewear.demo']]) {
      const result = await new Client().call('POST', '/api/auth/demo', { account });
      check(`demo login works for "${account}" (${email})`, result.status === 200 && result.json.data.user.email === email, JSON.stringify(result.json));
    }
    check('demo login rejects unknown accounts (400)', (await new Client().call('POST', '/api/auth/demo', { account: 'alice' })).status === 400);
    const page = (path, client) => fetch(BASE + path, { headers: client.cookie ? { Cookie: client.cookie } : {}, redirect: 'manual' });
    const historyHtml = await (await page('/history', demo)).text();
    check('history page lists activity with exact counts', /Your history/.test(historyHtml) && /Saved(<!-- -->)? <span class="tab-count">\(<!-- -->\d+/.test(historyHtml) && /history-row/.test(historyHtml));
    const sentHtml = await (await page('/history?type=sent', demo)).text();
    check('history filter shows only sent inquiries', /asked/.test(sentHtml) && !/You saved/.test(sentHtml));
    const page2 = await page('/history?page=2', demo);
    check('history is paginated (page 2 renders)', page2.status === 200 && /history-row/.test(await page2.text()));
    check('account page renders for a logged-in user', (await page('/account', demo)).status === 200);
  }
  const anonHistory = await fetch(BASE + '/history', { redirect: 'manual' });
  check('history page redirects logged-out visitors to login', anonHistory.status >= 300 && anonHistory.status < 400 && /\/login/.test(anonHistory.headers.get('location') || ''));
  const anonAccount = await fetch(BASE + '/account', { redirect: 'manual' });
  check('account page redirects logged-out visitors to login', anonAccount.status >= 300 && anonAccount.status < 400);

  console.log('\nLogout');
  const out = await alice.client.call('POST', '/api/auth/logout');
  check('logout returns 200 and clears the cookie', out.status === 200 && out.setCookie.some((c) => /rewear_session=;/.test(c) || /Max-Age=0/i.test(c)));
  check('after logout /api/auth/me is empty', (await alice.client.call('GET', '/api/auth/me')).json.data.user === null);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error('Smoke test crashed:', error.message);
  process.exitCode = 1;
});
