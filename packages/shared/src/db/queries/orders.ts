import { eq, and, desc, inArray } from 'drizzle-orm';
import { getDb } from '../client';
import { orders } from '../schema/orders';
import { orderItems } from '../schema/order-items';
import { menuItems } from '../schema/menu-items';
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

export async function updateOrderStatus(
  id: string,
  status: UpdateOrderStatusDto['status'],
  rejectionReason?: string,
) {
  const result = await getDb()
    .update(orders)
    .set({
      status,
      updatedAt: Date.now(),
      ...(status === 'completed' ? { completedAt: Date.now() } : {}),
      ...(status === 'cancelled' && rejectionReason ? { rejectionReason } : {}),
    })
    .where(eq(orders.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`Order ${id} not found`);
  return row;
}

export async function updateOrderModificationStatus(
  id: string,
  modificationStatus: 'pending' | 'accepted' | 'rejected' | null,
) {
  const result = await getDb()
    .update(orders)
    .set({ modificationStatus, updatedAt: Date.now() })
    .where(eq(orders.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`Order ${id} not found`);
  return row;
}

export async function updateOrderDelay(
  id: string,
  delayMinutes: number,
  delayMessage: string | null
) {
  const result = await getDb()
    .update(orders)
    .set({ delayMinutes, delayMessage, updatedAt: Date.now() })
    .where(eq(orders.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`Order ${id} not found`);
  return row;
}

export async function updateOrderAfterModification(
  id: string,
  data: {
    totalAmount: number;
    specialInstruction: string | null;
    modificationStatus: 'accepted' | 'rejected' | null;
  },
) {
  const result = await getDb()
    .update(orders)
    .set({ ...data, updatedAt: Date.now() })
    .where(eq(orders.id, id))
    .returning();
  const row = result[0];
  if (!row) throw new Error(`Order ${id} not found`);
  return row;
}

/**
 * Returns an order with its line items enriched with menu item name, price and
 * imageUrl. Used by the modification-mode UX so the customer's cart can be
 * pre-populated when they land on the vendor menu page.
 */
export async function getOrderWithItems(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const lines = await getDb()
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  if (lines.length === 0) return { order, items: [] };

  const menuItemIds = lines.map((l) => l.menuItemId).filter((id): id is string => id !== null);
  const menuRows = menuItemIds.length > 0
    ? await getDb()
        .select({ id: menuItems.id, name: menuItems.name, price: menuItems.price, imageUrl: menuItems.imageUrl })
        .from(menuItems)
        .where(inArray(menuItems.id, menuItemIds))
    : [];

  const menuMap = new Map(menuRows.map((m) => [m.id, m]));

  const enriched = lines.map((line) => {
    const mi = line.menuItemId ? menuMap.get(line.menuItemId) : undefined;
    return {
      menuItemId: line.menuItemId,
      name: mi?.name ?? 'Deleted Item',
      /** Already in dollars (output layer) */
      price: mi ? parseFloat((mi.price / 100).toFixed(2)) : 0,
      imageUrl: mi?.imageUrl ?? null,
      quantity: line.quantity,
    };
  });

  return { order, items: enriched };
}
