import { handle, ok } from '@/lib/api';
import { clearSessionCookie } from '@/lib/auth';

// POST /api/auth/logout - remove the session cookie.
export const POST = handle(async () => {
  await clearSessionCookie();
  return ok({ loggedOut: true });
});
