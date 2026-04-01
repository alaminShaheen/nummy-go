import { ulid } from 'ulidx';
import { initDatabase } from '@nummygo/shared/db';
import {
  createOrder,
  createOrderItems,
  getOrdersByUser,
  getOrdersByTenant,
  updateOrderStatus,
  getMenuItemById,
} from '@nummygo/shared/db/queries';
import type { Order } from '@nummygo/shared/models/types';
import type {
  CreateOrderDto,
  UpdateOrderStatusDto,
  GetOrdersByTenantDto,
  CreateOrderRecordDto,
  CreateOrderItemRecordDto,
} from '@nummygo/shared/models/dtos';
import type { Env } from '../index';

// ── DB init ────────────────────────────────────────────────────────────────

function initDb(env: Env) {
  initDatabase(env.DB);
}

// ── placeOrder ─────────────────────────────────────────────────────────────

export async function placeOrder(
  env: Env,
  userId: string,
  input: CreateOrderDto
): Promise<Order> {
  initDb(env);

  const resolvedItems = await Promise.all(
    input.items.map(async (line) => {
      const menuItem = await getMenuItemById(line.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
      return { ...line, unitPrice: menuItem.price };
    })
  );

  const totalAmount = resolvedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const orderId = ulid();
  const now = new Date().toISOString();

  const orderRecord: CreateOrderRecordDto = {
    id:                 orderId,
    userId,
    tenantId:           input.tenantId,
    totalAmount,
    specialInstruction: input.specialInstruction ?? null,
    createdAt:          now,
    updatedAt:          now,
  };

  const row = await createOrder(orderRecord);

  const orderItemRecords: CreateOrderItemRecordDto[] = resolvedItems.map((item) => ({
    id:         ulid(),
    tenantId:   input.tenantId,
    orderId,
    menuItemId: item.menuItemId,
    quantity:   item.quantity,
    totalPrice: item.unitPrice * item.quantity,
    createdAt:  now,
  }));

  await createOrderItems(orderItemRecords);

  return rowToOrder(row);
}

// ── fetchUserOrders ────────────────────────────────────────────────────────

export async function fetchUserOrders(env: Env, userId: string): Promise<Order[]> {
  initDb(env);
  const rows = await getOrdersByUser(userId);
  return rows.map(rowToOrder);
}

// ── fetchTenantOrders ──────────────────────────────────────────────────────

export async function fetchTenantOrders(env: Env, input: GetOrdersByTenantDto): Promise<Order[]> {
  initDb(env);
  const rows = await getOrdersByTenant(input.tenantId, {
    status: input.status,
    limit:  input.limit,
    offset: input.offset,
  });
  return rows.map(rowToOrder);
}

// ── changeOrderStatus ──────────────────────────────────────────────────────

export async function changeOrderStatus(env: Env, input: UpdateOrderStatusDto): Promise<Order> {
  initDb(env);
  const row = await updateOrderStatus(input.orderId, input.status);
  return rowToOrder(row);
}

// ── helpers ────────────────────────────────────────────────────────────────

function rowToOrder(row: typeof import('@nummygo/shared/db/schema').orders.$inferSelect): Order {
  return {
    id:                 row.id,
    userId:             row.userId,
    tenantId:           row.tenantId,
    status:             row.status,
    totalAmount:        row.totalAmount,
    specialInstruction: row.specialInstruction ?? null,
    createdAt:          row.createdAt,
    updatedAt:          row.updatedAt ?? null,
    completedAt:        row.completedAt ?? null,
  };
}
