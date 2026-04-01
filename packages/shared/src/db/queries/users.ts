import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { users } from '../schema';
import type { UserRole } from '../../models';

export async function getUserById(id: string) {
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByEmail(email: string) {
  const rows = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

export async function getUserByPhone(phoneNumber: string) {
  const rows = await getDb().select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
  return rows[0];
}

export async function updateUserRole(id: string, role: UserRole) {
  const result = await getDb()
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}
