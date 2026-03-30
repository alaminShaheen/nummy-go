/**
 * apps/customer-web/src/server/routers/_app.ts
 *
 * NOTE: customer-web's own tRPC server is intentionally minimal.
 *
 * All order-related API calls go directly to the api-worker
 * (see src/trpc/Provider.tsx for the URL configuration).
 *
 * This file exists only to satisfy the Next.js API route at
 * src/app/api/trpc/[trpc]/route.ts.  You can use it for any
 * Next.js-specific server logic (e.g. session cookies, SSR data).
 *
 * Business logic lives in: api-worker/src/trpc/routers/
 */

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const appRouter = router({
  // Health check – useful for smoke-testing the Next.js deployment
  health: publicProcedure.query(() => ({
    status: 'ok',
    app:    'customer-web',
    time:   new Date().toISOString(),
  })),

  // Example: echo procedure for testing
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => ({ echo: input.message })),
});

export type AppRouter = typeof appRouter;
