import { router, tenantProcedure, protectedProcedure, TRPCError } from '../init';
import {
  getOrdersByTenantSchema,
  updateOrderStatusSchema,
  registerTenantSchema,
  checkTenantSlugSchema,
} from '@nummygo/shared/models/dtos';
import { changeOrderStatus, fetchTenantOrders } from '../../services/orderService';
import { completeTenantOnboarding, getTenantProfile } from '../../services/tenantService';
import { getTenantBySlug } from '@nummygo/shared/db/queries';

export const tenantRouter = router({

	// ── Onboarding ───────────────────────────────────────────────────────────

	me: protectedProcedure.query(async ({ ctx }) => {
		return getTenantProfile(ctx.session.user.id);
	}),

	checkSlug: protectedProcedure
		.input(checkTenantSlugSchema)
		.query(async ({ input }) => {
			const existing = await getTenantBySlug(input.slug);
			return { available: !existing };
		}),

	onboard: protectedProcedure
		.input(registerTenantSchema)
		.mutation(async ({ input, ctx }) => {
			const tenant = await getTenantProfile(ctx.session.user.id);
			if (!tenant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant record not found' });
			if (tenant.onboardingCompleted) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Onboarding already completed' });

			const existing = await getTenantBySlug(input.slug);
			if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Slug is already taken' });

			return completeTenantOnboarding(ctx.session.user.id, input);
		}),

	// ── Dashboard ────────────────────────────────────────────────────────────

	getDashboardOrders: tenantProcedure
		.input(getOrdersByTenantSchema)
		.query(async ({ input, ctx }) => {
			try {
				return await fetchTenantOrders(ctx.env, input);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error instanceof Error ? error.message : 'Failed to fetch orders',
				});
			}
		}),

	updateOrderStatus: tenantProcedure
		.input(updateOrderStatusSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				return await changeOrderStatus(ctx.env, input);
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: error instanceof Error ? error.message : 'Failed to update order status',
				});
			}
		}),
});
