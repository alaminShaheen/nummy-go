import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { orders } from '../schema/orders';
import type { CreateOrderRecordDto, UpdateOrderStatusDto, GetOrdersByTenantDto } from '../../models/dtos';

export async function createOrder(data: CreateOrderRecordDto) {
  const result = await getDb().insert(orders).values(data).returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

export async function getOrderById(id: string) {
  const rows = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0];
}

export async function getOrdersByTenant(tenantId: string, options: Partial<Pick<GetOrdersByTenantDto, 'status' | 'limit' | 'offset'>> = {}) {
  const { status, limit = 50, offset = 0 } = options;
  const where = status
    ? and(eq(orders.tenantId, tenantId), eq(orders.status, status))
    : eq(orders.tenantId, tenantId);

  return getDb().select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
}

export async function getOrdersByUser(userId: string) {
  return getDb().select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByCheckoutSession(checkoutSessionId: string) {
  return getDb().select().from(orders).where(eq(orders.checkoutSessionId, checkoutSessionId)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: string, status: UpdateOrderStatusDto['status']) {
  const result = await getDb()
    .update(orders)
    .set({
      status,
      updatedAt: Date.now(),
      ...(status === 'completed' ? { completedAt: Date.now() } : {}),
    })
    .where(eq(orders.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`Order ${id} not found`);
  return row;
}
