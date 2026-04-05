import {ulid} from 'ulidx';
import {generateTenantSlug} from '../utils/slugGenerator';
import {
    createTenant,
    getTenantBySlug,
    getTenantByUserId,
    updateTenant,
    updateUserRole
} from '@nummygo/shared/db/queries';
import {businessHoursSchema} from '@nummygo/shared/models/types';
import type {RegisterTenantDto} from '@nummygo/shared/models/dtos';
import {TRPCError} from "@trpc/server";
import {ZodError} from "zod";

export async function createTenantForUser(userId: string) {
    await updateUserRole(userId, 'tenant');

    return createTenant({
        id: ulid(),
        userId,
        slug: generateTenantSlug(),
        name: '',
        phoneNumber: '',
        onboardingCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
}

export async function completeTenantOnboarding(userId: string, data: RegisterTenantDto) {
    const tenant = await getTenantProfile(userId);
    if (!tenant) throw new TRPCError({code: 'NOT_FOUND', message: 'Tenant record not found'});
    if (tenant.onboardingCompleted) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Onboarding already completed'
        });
    }
    const existing = await getTenantBySlug(data.slug);
    if (existing) throw new ZodError([{
        code: "custom",
        path: ["slug"],
        message: "Slug is not available"
    }])

    return updateTenant(userId, {
        ...data,
        onboardingCompleted: true,
    });
}

export async function getTenantProfile(userId: string) {
    const tenant = await getTenantByUserId(userId);
    if (!tenant) return null;

    const businessHours = tenant.businessHours
        ? businessHoursSchema.parse(tenant.businessHours)
        : null;

    return {...tenant, businessHours};
}
