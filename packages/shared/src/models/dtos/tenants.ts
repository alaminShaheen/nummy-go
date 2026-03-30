import { z } from 'zod';

export const createTenantSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  phoneNumber: z.string().min(7),
  email: z.email().optional(),
  businessHours: z.string().optional(), // JSON string
});

export const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().min(7).optional(),
  email: z.email().optional(),
  businessHours: z.string().optional(),
  acceptsOrders: z.boolean().optional(),
  closedUntil: z.string().nullable().optional(),
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
