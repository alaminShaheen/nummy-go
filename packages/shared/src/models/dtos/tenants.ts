import { z } from 'zod';
import { timestampSchema, ulidSchema, userIdSchema } from '../schemas';
import { businessHoursSchema } from '../types';

// ── API-facing ─────────────────────────────────────────────────────────────

export const registerTenantSchema = z.object({
	name: z.string().trim().min(1, 'Restaurant name is required'),
	slug: z
		.string()
		.min(2, 'Slug must be at least 2 characters long')
		.regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens allowed'),
	phoneNumber: z.string().length(10, 'Valid phone number required'),
	email: z.email('Invalid email address').optional().or(z.literal('')),
	address: z.string().trim().min(1, 'Business address is required'),
	latitude: z.number().optional().nullable(),
	longitude: z.number().optional().nullable(),
	businessHours: businessHoursSchema,
	promotionalHeading: z.string().optional().or(z.literal('')),
	description: z.string().optional().or(z.literal('')),
});

export const updateTenantSchema = registerTenantSchema.partial().extend({
	acceptsOrders: z.boolean().default(true).optional(),
	// TODO: Add closed until later
	// closedUntil: timestampSchema.nullable().optional(),
	onboardingCompleted: z.boolean().optional(),
	tags: z.array(z.string()).optional(),
	logoUrl: z.string().optional().or(z.literal('')),
	heroImageUrl: z.string().optional().or(z.literal('')),
	/** Minutes within which customers can request modifications: 15 | 30 | 45 | 60 */
	orderModificationThreshold: z.union([
		z.literal(15),
		z.literal(30),
		z.literal(45),
		z.literal(60),
	]).optional(),
});

export const checkTenantSlugSchema = z.object({
	slug: registerTenantSchema.shape.slug,
});

export const searchTenantsSchema = z.object({
  query: z.string().trim().min(0),
  limit: z.number().int().positive().max(50).optional(),
});

// ── Internal (query-facing) ────────────────────────────────────────────────

export const createTenantRecordSchema = z.object({
	id: ulidSchema,
	userId: userIdSchema,
	slug: z.string(),
	name: z.string(),
	phoneNumber: z.string(),
	email: z.string().optional(),
	address: z.string().optional(),
	latitude: z.number().optional().nullable(),
	longitude: z.number().optional().nullable(),
	promotionalHeading: z.string().optional(),
	description: z.string().optional(),
	tags: z.array(z.string()).optional(),
	logoUrl: z.string().optional().or(z.literal('')),
	heroImageUrl: z.string().optional().or(z.literal('')),
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

