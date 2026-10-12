// Helpers that give every API route the same shape:
//   success: { ok: true,  data: ... }
//   failure: { ok: false, error: { message, fields? } }
import { NextResponse } from 'next/server';
import { ApiError, ConfigError } from './errors.js';
import { isValidObjectId } from './validation.js';

export function ok(data, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(status, message, fields) {
  const error = fields && Object.keys(fields).length ? { message, fields } : { message };
  return NextResponse.json({ ok: false, error }, { status });
}

// Throw this when validation finds problems (HTTP 422 Unprocessable Content).
export function validationError(errors) {
  return new ApiError(422, 'Please fix the highlighted fields.', errors);
}

const MAX_BODY_BYTES = 100 * 1024;

export async function readJson(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) throw new ApiError(415, 'Requests must be sent as JSON.');
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) throw new ApiError(413, 'The request is too large.');

  let body;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, 'The request body must be valid JSON.');
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'The request body must be a JSON object.');
  }
  return body;
}

// Browsers always send an Origin header on cross-site POST requests.
// If it points to a different site, we refuse the request (CSRF defence in
// addition to SameSite cookies). Tools like curl send no Origin, so they pass.
function assertSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, 'Cross-site requests are not allowed.');
  }
  if (originHost !== host) throw new ApiError(403, 'Cross-site requests are not allowed.');
}

const DB_ERROR_NAMES = ['MongoNetworkError', 'MongoServerSelectionError', 'MongooseServerSelectionError', 'MongoNetworkTimeoutError'];

function toErrorResponse(error) {
  if (error instanceof ApiError) return fail(error.status, error.message, error.fields);
  if (error instanceof ConfigError) {
    console.error('[api] Configuration error:', error.message);
    return fail(500, 'The server is not configured correctly. Please contact the site owner.');
  }
  if (error?.code === 11000) return fail(409, 'That record already exists.');
  if (error?.name === 'CastError') return fail(400, 'One of the IDs in the request is invalid.');
  if (error?.name === 'ValidationError') return fail(422, 'Some of the information was not valid.');
  if (DB_ERROR_NAMES.includes(error?.name)) {
    console.error('[api] Database error:', error.message);
    return fail(503, 'The database is temporarily unavailable. Please try again in a moment.');
  }
  // Never send stack traces or internal messages to the browser.
  console.error('[api] Unexpected error:', error);
  return fail(500, 'Something went wrong on our side. Please try again.');
}

// Wrap every route handler with this: it adds the CSRF check and turns any
// thrown error into a clean JSON response.
export function handle(routeFunction) {
  return async function route(request, context) {
    try {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) assertSameOrigin(request);
      return await routeFunction(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

// Reads and validates an ID from the route URL, e.g. /api/items/[id].
// Invalid ids get a normal 404 instead of a database error.
export async function idParam(context, name = 'id') {
  const params = await context.params;
  const value = params?.[name];
  if (!isValidObjectId(value)) throw new ApiError(404, 'We could not find what you were looking for.');
  return value;
}
