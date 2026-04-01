import { z } from 'zod';
import { isValid } from 'ulidx';

export const orderStatusEnum = z.enum([
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const userRoleEnum = z.enum(['customer', 'tenant']);

export type UserRole = z.infer<typeof userRoleEnum>;

export const ulidSchema = z.string().refine(isValid, { message: 'Invalid ULID' });
