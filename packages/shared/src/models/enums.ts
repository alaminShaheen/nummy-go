import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const paymentMethodEnum = z.enum(["card", "counter"]);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

export const userRoleEnum = z.enum(['customer', 'tenant']);

export type UserRole = z.infer<typeof userRoleEnum>;
