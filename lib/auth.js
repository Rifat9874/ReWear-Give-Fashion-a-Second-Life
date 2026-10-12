// Server-only authentication helpers: cookie handling and "who is logged in?".
import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { connectDB } from './db.js';
import { ApiError } from './errors.js';
import { toCurrentUser } from './serializers.js';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  readSessionToken,
} from './session-token.js';
import { User } from '../models/index.js';

function cookieOptions(maxAge) {
  return {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // not sent on cross-site POST requests
    path: '/',
    maxAge,
  };
}

export async function setSessionCookie(userId) {
  const token = await createSessionToken(userId);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE_SECONDS));
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE, '', cookieOptions(0));
}

// Returns the logged-in user (or null). Wrapped in React's cache() so layout,
// page and components share one database lookup per request.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await readSessionToken(token);
  if (!userId || !/^[a-f\d]{24}$/i.test(userId)) return null;

  await connectDB();
  const user = await User.findById(userId).lean(); // passwordHash is select:false
  if (!user) return null;
  return toCurrentUser(user, process.env.ADMIN_EMAIL);
});

// --- For API route handlers: throw an error the API layer turns into JSON ---

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, 'Please log in to continue.');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) throw new ApiError(403, 'You do not have permission to do that.');
  return user;
}

// --- For pages (Server Components): redirect instead of returning JSON ---

export async function requireUserPage(nextPath = '/dashboard') {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdminPage() {
  const user = await requireUserPage('/admin');
  if (!user.isAdmin) notFound(); // pretend the page does not exist
  return user;
}
