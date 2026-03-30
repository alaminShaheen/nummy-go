import { z } from 'zod';
import { orderStatusEnum } from '../enums';

export const orderItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  orderId: z.string(),
  menuItemId: z.string(),
  quantity: z.number().int().positive(),
  totalPrice: z.number(),
  createdAt: z.string(),
});

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  status: orderStatusEnum,
  totalAmount: z.number(),
  specialInstruction: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order     = z.infer<typeof orderSchema>;
