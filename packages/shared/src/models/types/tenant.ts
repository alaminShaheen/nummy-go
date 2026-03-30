import { z } from 'zod';

export const tenantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().nullable(),
  businessHours: z.string().nullable(), // serialised JSON
  acceptsOrders: z.boolean(),
  closedUntil: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export type Tenant = z.infer<typeof tenantSchema>;
