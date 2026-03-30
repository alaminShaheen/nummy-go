import { eq, and, desc } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { orders } from '../schema/orders';
import type { OrderStatus } from '../../models/enums';
import type * as schema from '../schema';

type DB = DrizzleD1Database<typeof schema>;

export async function createOrder(db: DB, data: typeof orders.$inferInsert) {
  const result = await db.insert(orders).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

export async function getOrderById(db: DB, id: string) {
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0];
}

export async function getOrdersByTenant(
  db: DB,
  tenantId: string,
  options: { status?: OrderStatus; limit?: number; offset?: number } = {}
) {
  const { status, limit = 50, offset = 0 } = options;
  const where = status
    ? and(eq(orders.tenantId, tenantId), eq(orders.status, status))
    : eq(orders.tenantId, tenantId);

  return db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
}

export async function getOrdersByUser(db: DB, userId: string) {
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(db: DB, id: string, status: OrderStatus) {
  const result = await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
    })
    .where(eq(orders.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`Order ${id} not found`);
  return row;
}
