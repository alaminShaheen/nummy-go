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
