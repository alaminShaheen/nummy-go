import { z } from 'zod';
import { orderStatusEnum } from '../enums';
import {ulidSchema, timestampSchema, priceSchema} from '../schemas';

// ── API-facing ─────────────────────────────────────────────────────────────

const orderLineSchema = z.object({
  menuItemId: ulidSchema,
  quantity:   z.number().int().min(1),
});

export const createOrderSchema = z.object({
  tenantId:           ulidSchema,
  userId:             ulidSchema,
  items:              z.array(orderLineSchema).min(1, 'An order must have at least one item'),
  specialInstruction: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: ulidSchema,
  status:  orderStatusEnum,
});

export const getOrdersByTenantSchema = z.object({
  tenantId: ulidSchema,
  status:   orderStatusEnum.optional(),
  limit:    z.number().int().min(1).max(100).default(50),
  offset:   z.number().int().min(0).default(0),
});

export const getOrdersByUserSchema = z.object({
  userId: ulidSchema,
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createOrderRecordSchema = z.object({
  id:                 ulidSchema,
  userId:             ulidSchema,
  tenantId:           ulidSchema,
  totalAmount:        priceSchema,
  specialInstruction: z.string().nullable().optional(),
  createdAt:          timestampSchema,
  updatedAt:          timestampSchema,
});

export const createOrderItemRecordSchema = z.object({
  id:         ulidSchema,
  orderId:    ulidSchema,
  tenantId:   ulidSchema,
  menuItemId: ulidSchema,
  quantity:   z.number().int().positive(),
  totalPrice: priceSchema,
  createdAt:  timestampSchema,
});

export type CreateOrderDto           = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto     = z.infer<typeof updateOrderStatusSchema>;
export type GetOrdersByTenantDto     = z.infer<typeof getOrdersByTenantSchema>;
export type GetOrdersByUserDto       = z.infer<typeof getOrdersByUserSchema>;
export type CreateOrderRecordDto     = z.infer<typeof createOrderRecordSchema>;
export type CreateOrderItemRecordDto = z.infer<typeof createOrderItemRecordSchema>;
