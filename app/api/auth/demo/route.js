import { ApiError } from '@/lib/errors';
import { handle, ok, readJson } from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { toCurrentUser } from '@/lib/serializers';
import { User } from '@/models';

const DEMO_ACCOUNTS = {
  admin: 'admin@rewear.demo',
  seller: 'ayesha@rewear.demo',
  buyer: 'buyer@rewear.demo',
  member: 'rafi@rewear.demo',
};

// POST /api/auth/demo { account: "admin" | "seller" | "buyer" | "member" }
// One-click demo login. It only exists when DEMO_LOGIN=true is set (local demos).
// Without that variable this route behaves as if it does not exist.
export const POST = handle(async (request) => {
  if (process.env.DEMO_LOGIN !== 'true') throw new ApiError(404, 'We could not find what you were looking for.');
  const { account } = await readJson(request);
  const email = DEMO_ACCOUNTS[account];
  if (!email) throw new ApiError(400, 'Choose admin, seller, buyer or member.');

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user) throw new ApiError(404, 'The demo accounts do not exist yet. Run "npm run seed" first.');

  await setSessionCookie(user._id);
  return ok({ user: toCurrentUser(user, process.env.ADMIN_EMAIL) });
});
