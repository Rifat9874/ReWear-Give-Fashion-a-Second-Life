// Small error classes so route handlers can say "respond with this status".

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields; // optional { fieldName: 'message' } for form errors
  }
}

// Used when the server itself is misconfigured (missing env variables).
// The real reason is logged on the server; users only see a generic message.
export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}
