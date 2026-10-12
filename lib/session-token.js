// Creates and checks the signed session token stored in the cookie.
// Kept separate from next/headers so it can be unit tested on its own.
import { SignJWT, jwtVerify } from 'jose';
import { ConfigError } from './errors.js';

export const SESSION_COOKIE = 'rewear_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new ConfigError('AUTH_SECRET is missing or shorter than 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getKey());
}

// Returns the user id inside a valid token, or null when it is invalid/expired.
export async function readSessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch (error) {
    if (error instanceof ConfigError) throw error;
    return null;
  }
}
