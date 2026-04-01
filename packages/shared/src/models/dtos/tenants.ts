import { z } from 'zod';
import { ulidSchema } from '../enums';
import { businessHoursSchema } from '../types/tenant';

// ── API-facing ─────────────────────────────────────────────────────────────

export const registerTenantSchema = z.object({
  name:          z.string().min(1),
  slug:          z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  phoneNumber:   z.string().min(7),
  email:         z.email().optional(),
  businessHours: businessHoursSchema.optional(),
});

export const updateTenantSchema = z.object({
  name:          z.string().min(1).optional(),
  phoneNumber:   z.string().min(7).optional(),
  email:         z.email().optional(),
  businessHours: businessHoursSchema.optional(),
  acceptsOrders: z.boolean().optional(),
  closedUntil:   z.string().nullable().optional(),
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
  businessHours:       z.string().optional(), // serialized JSON string for DB
  onboardingCompleted: z.boolean(),
  createdAt:           z.string(),
  updatedAt:           z.string(),
});

export type RegisterTenantDto     = z.infer<typeof registerTenantSchema>;
export type UpdateTenantDto       = z.infer<typeof updateTenantSchema>;
export type CheckTenantSlugDto    = z.infer<typeof checkTenantSlugSchema>;
export type CreateTenantRecordDto = z.infer<typeof createTenantRecordSchema>;
