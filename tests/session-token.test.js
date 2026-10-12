import test from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import { ConfigError } from '../lib/errors.js';
import { createSessionToken, readSessionToken } from '../lib/session-token.js';

process.env.AUTH_SECRET = 'test-secret-that-is-at-least-32-characters-long';

test('a token round-trips to the same user id', async () => {
  const token = await createSessionToken('507f1f77bcf86cd799439011');
  assert.equal(await readSessionToken(token), '507f1f77bcf86cd799439011');
});

test('a tampered token is rejected', async () => {
  const token = await createSessionToken('507f1f77bcf86cd799439011');
  const tampered = token.slice(0, -4) + 'AAAA';
  assert.equal(await readSessionToken(tampered), null);
});

test('a token signed with a different secret is rejected', async () => {
  const forged = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('507f1f77bcf86cd799439011').setExpirationTime('1h').sign(new TextEncoder().encode('another-secret-another-secret-another-secret'));
  assert.equal(await readSessionToken(forged), null);
});

test('an expired token is rejected', async () => {
  const expired = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('507f1f77bcf86cd799439011').setIssuedAt(Math.floor(Date.now() / 1000) - 7200).setExpirationTime(Math.floor(Date.now() / 1000) - 3600).sign(new TextEncoder().encode(process.env.AUTH_SECRET));
  assert.equal(await readSessionToken(expired), null);
});

test('missing or garbage tokens are rejected', async () => {
  assert.equal(await readSessionToken(undefined), null);
  assert.equal(await readSessionToken('not.a.jwt'), null);
});

test('a weak or missing AUTH_SECRET is a configuration error', async () => {
  const original = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = 'short';
  await assert.rejects(() => createSessionToken('x'), ConfigError);
  process.env.AUTH_SECRET = original;
});
