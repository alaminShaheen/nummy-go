import { z } from 'zod';
import { orderStatusEnum, ulidSchema } from '../enums';

export const orderItemSchema = z.object({
  id:         ulidSchema,
  tenantId:   ulidSchema,
  orderId:    ulidSchema,
  menuItemId: ulidSchema,
  quantity:   z.number().int().positive(),
  totalPrice: z.number(),
  createdAt:  z.string(),
});

export const orderSchema = z.object({
  id:                 ulidSchema,
  userId:             ulidSchema,
  tenantId:           ulidSchema,
  status:             orderStatusEnum,
  totalAmount:        z.number(),
  specialInstruction: z.string().nullable(),
  createdAt:          z.string(),
  updatedAt:          z.string().nullable(),
  completedAt:        z.string().nullable(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order     = z.infer<typeof orderSchema>;
