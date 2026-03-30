/**
 * packages/shared/src/schemas/index.ts
 *
 * Zod validation schemas for order operations.
 * Used by both the api-worker (server-side validation) and the
 * frontend (client-side form validation and type inference).
 *
 * Export pattern: schema + inferred TypeScript type together.
 */

import { z } from 'zod';

// ── Reusable primitives ────────────────────────────────────────────────────

/** UUID v4 format check. */
const uuidSchema = z.string().uuid({ message: 'Must be a valid UUID' });

/** A single ordered item. */
export const orderItemSchema = z.object({
  menuItemId: uuidSchema,
  name: z.string().min(1, 'Item name is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});
export type OrderItemInput = z.infer<typeof orderItemSchema>;

// ── Order status ───────────────────────────────────────────────────────────

export const orderStatusSchema = z.enum([
  'PENDING',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED',
]);

// ── createOrderSchema ──────────────────────────────────────────────────────

/**
 * Input shape for placing a new order.
 * Used in: customerRouter.placeOrder (api-worker)
 *          PlaceOrderForm (customer-web)
 */
export const createOrderSchema = z.object({
  tenantId:   uuidSchema,
  customerId: uuidSchema,
  items: z
    .array(orderItemSchema)
    .min(1, 'An order must have at least one item'),
  notes: z.string().max(500, 'Notes can be at most 500 characters').optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ── updateOrderSchema ──────────────────────────────────────────────────────

/**
 * Input shape for updating an order's status.
 * Used in: tenantRouter.updateOrderStatus (api-worker)
 *          OrderCard actions (tenant-web)
 */
export const updateOrderSchema = z.object({
  orderId: uuidSchema,
  status:  orderStatusSchema,
});
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// ── getOrdersSchema ────────────────────────────────────────────────────────

/** Query params for fetching customer orders. */
export const getOrdersSchema = z.object({
  customerId: uuidSchema,
});
export type GetOrdersInput = z.infer<typeof getOrdersSchema>;

/** Query params for fetching tenant dashboard orders. */
export const getDashboardOrdersSchema = z.object({
  tenantId: uuidSchema,
  /** Filter by status; omit to get all statuses. */
  status: orderStatusSchema.optional(),
  /** Pagination – page size (default 50). */
  limit:  z.number().int().min(1).max(100).default(50),
  /** Pagination – offset. */
  offset: z.number().int().min(0).default(0),
});
export type GetDashboardOrdersInput = z.infer<typeof getDashboardOrdersSchema>;
