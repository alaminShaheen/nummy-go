import { ulid } from 'ulidx';
import { generateTenantSlug } from '../utils/slugGenerator';
import { createTenant, getTenantByUserId, updateTenant, updateUserRole } from '@nummygo/shared/db/queries';
import { businessHoursSchema } from '@nummygo/shared/models/types';
import type { RegisterTenantDto } from '@nummygo/shared/models/dtos';

export async function createTenantForUser(userId: string) {
	await updateUserRole(userId, 'tenant');

	return createTenant({
		id:                  ulid(),
		userId,
		slug:                generateTenantSlug(),
		name:                '',
		phoneNumber:         '',
		onboardingCompleted: false,
		createdAt:           new Date().toISOString(),
		updatedAt:           new Date().toISOString(),
	});
}

export async function completeTenantOnboarding(userId: string, data: RegisterTenantDto) {
	const tenant = await getTenantByUserId(userId);
	if (!tenant) throw new Error('Tenant not found');

	return updateTenant(userId, {
		...data,
		onboardingCompleted: true,
	});
}

export async function getTenantProfile(userId: string) {
	const tenant = await getTenantByUserId(userId);
	if (!tenant) return null;

	const businessHours = tenant.businessHours
		? businessHoursSchema.parse(JSON.parse(tenant.businessHours))
		: null;

	return { ...tenant, businessHours };
}
