import { z } from 'zod';
import { timestampSchema, ulidSchema } from '../schemas';

const dayHoursSchema = z.object({
	open: z.iso.time(), // e.g. "09:00"
	close: z.iso.time(), // e.g. "22:00"
	closed: z.boolean(),
});

export const businessHoursSchema = z.object({
	monday: dayHoursSchema,
	tuesday: dayHoursSchema,
	wednesday: dayHoursSchema,
	thursday: dayHoursSchema,
	friday: dayHoursSchema,
	saturday: dayHoursSchema,
	sunday: dayHoursSchema,
});

export const tenantSchema = z.object({
	id: ulidSchema,
	userId: ulidSchema,
	slug: z.string(),
	name: z.string(),
	phoneNumber: z.string(),
	address: z.string().nullable(),
	email: z.string().nullable(),
	businessHours: businessHoursSchema.nullable(),
	acceptsOrders: z.boolean(),
	closedUntil: timestampSchema.nullable(),
	isActive: z.boolean(),
	onboardingCompleted: z.boolean(),
	createdAt: timestampSchema,
	updatedAt: timestampSchema.nullable(),
});

export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
