/**
 * apps/customer-web/src/hooks/useOrders.ts
 *
 * Hook for fetching a customer's orders via tRPC.
 *
 * Usage:
 *   const { orders, isLoading, error, refetch } = useOrders(customerId);
 *
 * The hook is intentionally simple – React Query handles caching,
 * background refetching, and error states automatically.
 * Real-time updates are handled separately by useWebSocket.
 */

'use client';

import { trpc } from '@/trpc/client';

/**
 * Fetch all orders for a given customer.
 *
 * @param customerId - The UUID of the customer.  Pass `null` to skip fetching.
 */
export function useOrders(customerId: string | null) {
  const query = trpc.customer.getOrders.useQuery(
    // Input – only used when customerId is non-null
    { customerId: customerId ?? '' },
    {
      // Skip the query entirely if we don't have a customer yet
      enabled: !!customerId,
      // Polling interval as a fallback (WebSocket provides real-time updates)
      refetchInterval: 30_000,
    }
  );

  return {
    orders:    query.data ?? [],
    isLoading: query.isLoading,
    error:     query.error,
    refetch:   query.refetch,
  };
}
