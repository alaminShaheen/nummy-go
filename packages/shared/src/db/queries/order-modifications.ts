import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { orderModifications } from '../schema/order-modifications';
import { orders } from '../schema/orders';
import type { CreateOrderModificationRecordDto } from '../../models/dtos';

/**
 * Inserts a new modification request row.
 * The caller is responsible for ensuring no other 'pending' row exists for this order.
 */
export async function createOrderModification(data: CreateOrderModificationRecordDto) {
  const result = await getDb()
    .insert(orderModifications)
    .values(data)
    .returning();
  const row = result[0];
  if (!row) throw new Error('Insert returned no rows');
  return row;
}

/** Returns all modification records for a given order, newest first. */
export async function getModificationsByOrderId(orderId: string) {
  return getDb()
    .select()
    .from(orderModifications)
    .where(eq(orderModifications.orderId, orderId))
    .orderBy(desc(orderModifications.createdAt));
}

/** Returns the single pending modification request for an order, if one exists. */
export async function getPendingModificationForOrder(orderId: string) {
  const rows = await getDb()
    .select()
    .from(orderModifications)
    .where(
      and(
        eq(orderModifications.orderId, orderId),
        eq(orderModifications.status, 'pending'),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Returns a modification record by its ID. */
export async function getModificationById(id: string) {
  const rows = await getDb()
    .select()
    .from(orderModifications)
    .where(eq(orderModifications.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Records the tenant's decision on a modification request.
 * Sets status, tenantNote, and reviewedAt.
 */
export async function updateModificationStatus(
  id: string,
  status: 'accepted' | 'rejected',
  tenantNote?: string,
) {
  const result = await getDb()
    .update(orderModifications)
    .set({
      status,
      tenantNote: tenantNote ?? null,
      reviewedAt: Date.now(),
    })
    .where(eq(orderModifications.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`OrderModification ${id} not found`);
  return row;
}
