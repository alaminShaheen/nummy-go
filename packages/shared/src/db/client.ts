import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>>;

export function initDatabase(bindingDb: D1Database) {
  db = drizzle(bindingDb, { schema });
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase(env.DB) first.');
  }
  return db;
}
