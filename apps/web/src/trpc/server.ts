import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'api-worker/types';

// Get the API URL, ensuring it works both on server and client
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_WORKER_URL) {
    return process.env.NEXT_PUBLIC_API_WORKER_URL;
  }
  return 'http://localhost:8787';
};

/**
 * A vanilla tRPC client for Server Components and Server Actions.
 * It connects to the api-worker backend over HTTP.
 */
export const serverTRPC = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
    }),
  ],
});
