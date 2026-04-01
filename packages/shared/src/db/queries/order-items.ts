import { eq } from 'drizzle-orm';
import { getDb } from '../client';
import { orderItems } from '../schema/order-items';
import type { CreateOrderItemRecordDto } from '../../models/dtos';

export async function createOrderItems(data: CreateOrderItemRecordDto[]) {
  if (data.length === 0) return [];
  return getDb().insert(orderItems).values(data).returning();
}

export async function getOrderItemsByOrder(orderId: string) {
  return getDb().select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrderItemsByTenant(tenantId: string) {
  return getDb().select().from(orderItems).where(eq(orderItems.tenantId, tenantId));
}
