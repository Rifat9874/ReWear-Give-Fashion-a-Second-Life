import mongoose from 'mongoose';
import { ApiError, ConfigError } from './errors.js';

// In development Next.js reloads files often. Without caching, every reload
// would open a NEW database connection. We keep one on the global object.
const cache = globalThis.__rewearMongoose || (globalThis.__rewearMongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new ConfigError('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.');

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      })
      .then((instance) => instance);
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // allow a retry on the next request
    console.error('[db] MongoDB connection failed:', error.message);
    throw new ApiError(503, 'The database is temporarily unavailable. Please try again in a moment.');
  }
  return cache.conn;
}
