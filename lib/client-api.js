// Browser-side helper for calling our own API. Always resolves to
// { ok, data } or { ok:false, error, fields, status } - it never throws.
export async function apiRequest(url, { method = 'GET', body } = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
    return await parse(response);
  } catch {
    return networkError();
  }
}

// Upload one photo (a File) as multipart/form-data. Resolves to { ok, data: { id, url } }.
export async function uploadImage(file) {
  try {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/uploads', { method: 'POST', body: form, credentials: 'same-origin' });
    return await parse(response);
  } catch {
    return networkError();
  }
}

async function parse(response) {
  let json = null;
  try {
    json = await response.json();
  } catch {
    // response had no JSON body
  }
  if (response.ok && json?.ok) return { ok: true, status: response.status, data: json.data };
  return {
    ok: false,
    status: response.status,
    error: json?.error?.message || 'Something went wrong. Please try again.',
    fields: json?.error?.fields || {},
  };
}

function networkError() {
  return { ok: false, status: 0, error: 'Could not reach the server. Check your connection and try again.', fields: {} };
}
