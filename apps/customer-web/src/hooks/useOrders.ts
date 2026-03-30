'use client';

import { trpc } from '@/trpc/client';

export function useOrders(userId: string | null) {
  const query = trpc.customer.getOrders.useQuery(
    { userId: userId ?? '' },
    {
      enabled: !!userId,
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
