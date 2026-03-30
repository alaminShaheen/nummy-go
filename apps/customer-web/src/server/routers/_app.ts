import { router } from '../trpc';
import { exampleRouter } from './example';
import { cloudflareRouter } from './cloudflare';

export const appRouter = router({
  example: exampleRouter,
  cloudflare: cloudflareRouter,
});

export type AppRouter = typeof appRouter;
