/**
 * apps/tenant-web/src/hooks/useDashboardOrders.ts
 *
 * Fetch the tenant's incoming orders from the api-worker via tRPC.
 *
 * Usage:
 *   const { orders, isLoading, refetch } = useDashboardOrders(tenantId);
 *
 * This hook provides the initial data set.
 * Live updates (new orders, status changes) arrive via useWebSocket.
 */

'use client';

import { trpc } from '@/trpc/client';
import type { OrderStatus } from '@nummygo/shared';

interface UseDashboardOrdersOptions {
  /** Filter by a specific status (omit to get all). */
  status?: OrderStatus;
  limit?:  number;
  offset?: number;
}

export function useDashboardOrders(
  tenantId: string | null,
  options: UseDashboardOrdersOptions = {}
) {
  const query = trpc.tenant.getDashboardOrders.useQuery(
    {
      tenantId:  tenantId ?? '',
      status:    options.status,
      limit:     options.limit  ?? 50,
      offset:    options.offset ?? 0,
    },
    {
      enabled:         !!tenantId,
      // Poll as a fallback – WebSocket provides instant updates
      refetchInterval: 15_000,
    }
  );

  return {
    orders:    query.data ?? [],
    isLoading: query.isLoading,
    error:     query.error,
    refetch:   query.refetch,
  };
}
