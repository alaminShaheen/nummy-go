import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { orderItems } from '../schema/order-items';
import type * as schema from '../schema';

type DB = DrizzleD1Database<typeof schema>;

export async function createOrderItems(db: DB, data: (typeof orderItems.$inferInsert)[]) {
  if (data.length === 0) return [];
  return db.insert(orderItems).values(data).returning();
}

export async function getOrderItemsByOrder(db: DB, orderId: string) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrderItemsByTenant(db: DB, tenantId: string) {
  return db.select().from(orderItems).where(eq(orderItems.tenantId, tenantId));
}
