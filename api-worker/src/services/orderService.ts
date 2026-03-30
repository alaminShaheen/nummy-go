import { initDatabase, getDb } from '@nummygo/shared/db';
import {
  createOrder,
  createOrderItems,
  getOrdersByUser,
  getOrdersByTenant,
  updateOrderStatus,
  getMenuItemById,
} from '@nummygo/shared/db/queries';
import type { Order, WsMessage } from '@nummygo/shared/models/types';
import type {
  CreateOrderDto,
  UpdateOrderStatusDto,
  GetOrdersByTenantDto,
} from '@nummygo/shared/models/dtos';
import type { Env } from '../index';

// ── DB init ────────────────────────────────────────────────────────────────

function useDb(env: Env) {
  initDatabase(env.DB);
  return getDb();
}

// ── placeOrder ─────────────────────────────────────────────────────────────

export async function placeOrder(
  env: Env,
  userId: string,
  input: CreateOrderDto
): Promise<Order> {
  const db = useDb(env);

  // Look up each menu item to get its price
  const resolvedItems = await Promise.all(
    input.items.map(async (line) => {
      const menuItem = await getMenuItemById(db, line.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${line.menuItemId} not found`);
      return { ...line, unitPrice: menuItem.price };
    })
  );

  const totalAmount = resolvedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const orderId = crypto.randomUUID();

  const row = await createOrder(db, {
    id:                 orderId,
    userId,
    tenantId:           input.tenantId,
    totalAmount,
    specialInstruction: input.specialInstruction ?? null,
  });

  await createOrderItems(db, resolvedItems.map((item) => ({
    id:          crypto.randomUUID(),
    tenantId:    input.tenantId,
    orderId,
    menuItemId:  item.menuItemId,
    quantity:    item.quantity,
    totalPrice:  item.unitPrice * item.quantity,
  })));

  const order = rowToOrder(row);

  await broadcastToDO(env, input.tenantId, { type: 'ORDER_CREATED', order });

  return order;
}

// ── fetchUserOrders ────────────────────────────────────────────────────────

export async function fetchUserOrders(env: Env, userId: string): Promise<Order[]> {
  const db = useDb(env);
  const rows = await getOrdersByUser(db, userId);
  return rows.map(rowToOrder);
}

// ── fetchTenantOrders ──────────────────────────────────────────────────────

export async function fetchTenantOrders(env: Env, input: GetOrdersByTenantDto): Promise<Order[]> {
  const db = useDb(env);
  const rows = await getOrdersByTenant(db, input.tenantId, {
    status: input.status,
    limit:  input.limit,
    offset: input.offset,
  });
  return rows.map(rowToOrder);
}

// ── changeOrderStatus ──────────────────────────────────────────────────────

export async function changeOrderStatus(env: Env, input: UpdateOrderStatusDto): Promise<Order> {
  const db  = useDb(env);
  const row = await updateOrderStatus(db, input.orderId, input.status);
  const order = rowToOrder(row);

  await broadcastToDO(env, order.tenantId, { type: 'ORDER_UPDATED', order });

  return order;
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

async function broadcastToDO(env: Env, tenantId: string, message: WsMessage): Promise<void> {
  const doId   = env.TENANT_ORDER_DO.idFromName(tenantId);
  const doStub = env.TENANT_ORDER_DO.get(doId);

  await doStub.fetch('https://internal/broadcast', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ tenantId, message }),
  });
}
