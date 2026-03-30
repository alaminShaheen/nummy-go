/**
 * apps/tenant-web/src/trpc/Provider.tsx
 *
 * tRPC + React Query provider for the tenant dashboard.
 * Points to the same api-worker as customer-web.
 *
 * Configure NEXT_PUBLIC_API_WORKER_URL in apps/tenant-web/.env.local.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './client';

function getApiUrl() {
  const base =
    process.env.NEXT_PUBLIC_API_WORKER_URL ?? 'http://localhost:8787';
  return `${base}/trpc`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            staleTime: 10_000, // Shorter stale time for dashboard freshness
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({ url: getApiUrl() }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
