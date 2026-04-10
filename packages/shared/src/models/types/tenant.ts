import { z } from 'zod';
import { timestampSchema, ulidSchema } from '../schemas';
import { ORDER_MODIFICATION_THRESHOLD_OPTIONS } from '../enums';

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
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	email: z.string().nullable(),
	promotionalHeading: z.string().nullable(),
	description: z.string().nullable(),
	tags: z.array(z.string()).nullable(),
	logoUrl: z.string().nullable(),
	heroImageUrl: z.string().nullable(),
	businessHours: businessHoursSchema.nullable(),
	acceptsOrders: z.boolean(),
	closedUntil: timestampSchema.nullable(),
	isActive: z.boolean(),
	onboardingCompleted: z.boolean(),
	/** Minutes after order creation within which customers can request modifications (15|30|45|60). */
	orderModificationThreshold: z.union([
		z.literal(15),
		z.literal(30),
		z.literal(45),
		z.literal(60),
	]).default(30),
	createdAt: timestampSchema,
	updatedAt: timestampSchema.nullable(),
});

export type BusinessHours = z.infer<typeof businessHoursSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
