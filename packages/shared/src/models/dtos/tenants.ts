import { z } from 'zod';
import { ulidSchema, timestampSchema } from '../schemas';
import { businessHoursSchema } from '../types';

// ── API-facing ─────────────────────────────────────────────────────────────

export const registerTenantSchema = z.object({
  name: z.string().trim().min(1, 'Restaurant name is required'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens allowed'),
  phoneNumber: z.string().length(10, 'Valid phone number required'),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().min(1, 'Business address is required'),
  businessHours: businessHoursSchema,
});

export const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().length(10).optional(),
  email: z.email().optional(),
  address: z.string().optional(),
  businessHours: businessHoursSchema.optional(),
  acceptsOrders: z.boolean().optional(),
  closedUntil: timestampSchema.nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
  slug: z.string().optional(),
});

export const checkTenantSlugSchema = z.object({
  slug: registerTenantSchema.shape.slug,
});

export const searchTenantsSchema = z.object({
  query: z.string().trim().min(1, 'Search query is required'),
  limit: z.number().int().positive().max(50).optional(),
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createTenantRecordSchema = z.object({
  id: ulidSchema,
  userId: ulidSchema,
  slug: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().optional(),
  address: z.string().optional(),
  businessHours: businessHoursSchema.optional(), // serialized JSON string for DB
  onboardingCompleted: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type RegisterTenantDto = z.infer<typeof registerTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
export type CheckTenantSlugDto = z.infer<typeof checkTenantSlugSchema>;
export type SearchTenantsDto = z.infer<typeof searchTenantsSchema>;
export type CreateTenantRecordDto = z.infer<typeof createTenantRecordSchema>;

