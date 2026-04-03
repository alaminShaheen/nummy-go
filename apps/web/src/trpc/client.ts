/**
 * apps/tenant-web/src/trpc/client.ts
 *
 * Typed tRPC React client for the tenant dashboard.
 * Same pattern as customer-web – imports AppRouter type from api-worker.
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'api-worker/types';

/**
 * `trpc` exposes typed hooks for all api-worker procedures:
 *   trpc.tenant.getDashboardOrders.useQuery(...)
 *   trpc.tenant.updateOrderStatus.useMutation()
 */
export const trpc = createTRPCReact<AppRouter>();
