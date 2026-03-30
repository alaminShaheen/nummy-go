import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { users } from '../schema/users';
import type * as schema from '../schema';

type DB = DrizzleD1Database<typeof schema>;

export async function getUserById(db: DB, id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByEmail(db: DB, email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

export async function getUserByPhone(db: DB, phoneNumber: string) {
  const rows = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
  return rows[0];
}
