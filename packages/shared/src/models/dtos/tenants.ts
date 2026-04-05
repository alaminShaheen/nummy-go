import { z } from 'zod';
import { ulidSchema, timestampSchema } from '../schemas';
import { businessHoursSchema } from '../types';

// ── API-facing ─────────────────────────────────────────────────────────────

export const registerTenantSchema = z.object({
  name:          z.string().min(1),
  slug:          z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  phoneNumber:   z.string().min(7),
  email:         z.email().optional(),
  address:       z.string().optional(),
  businessHours: businessHoursSchema.optional(),
});

export const updateTenantSchema = z.object({
  name:          z.string().min(1).optional(),
  phoneNumber:   z.string().min(7).optional(),
  email:         z.email().optional(),
  address:       z.string().optional(),
  businessHours: businessHoursSchema.optional(),
  acceptsOrders: z.boolean().optional(),
  closedUntil:   timestampSchema.nullable().optional(),
    onboardingCompleted: z.boolean().optional(),
    slug: z.string().optional(),
});

export const checkTenantSlugSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createTenantRecordSchema = z.object({
  id:                  ulidSchema,
  userId:              ulidSchema,
  slug:                z.string(),
  name:                z.string(),
  phoneNumber:         z.string(),
  email:               z.string().optional(),
  address:             z.string().optional(),
  businessHours:       businessHoursSchema.optional(), // serialized JSON string for DB
  onboardingCompleted: z.boolean(),
  createdAt:           timestampSchema,
  updatedAt:           timestampSchema,
});

export type RegisterTenantDto     = z.infer<typeof registerTenantSchema>;
export type UpdateTenantDto       = z.infer<typeof updateTenantSchema>;
export type CheckTenantSlugDto    = z.infer<typeof checkTenantSlugSchema>;
export type CreateTenantRecordDto = z.infer<typeof createTenantRecordSchema>;
