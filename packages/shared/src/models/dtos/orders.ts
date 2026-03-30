import { z } from 'zod';
import { orderStatusEnum } from '../enums';

const orderLineSchema = z.object({
  menuItemId: z.uuid(),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  tenantId: z.uuid(),
  items: z.array(orderLineSchema).min(1, 'An order must have at least one item'),
  specialInstruction: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.uuid(),
  status: orderStatusEnum,
});

export const getOrdersByTenantSchema = z.object({
  tenantId: z.uuid(),
  status: orderStatusEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const getOrdersByUserSchema = z.object({
  userId: z.uuid(),
});

export type CreateOrderDto         = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto   = z.infer<typeof updateOrderStatusSchema>;
export type GetOrdersByTenantDto   = z.infer<typeof getOrdersByTenantSchema>;
export type GetOrdersByUserDto     = z.infer<typeof getOrdersByUserSchema>;
