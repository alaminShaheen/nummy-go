import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { initializeServices } from '@/server/init';

const handler = (req: Request) => {
  try {
    // Get Cloudflare context when running on Cloudflare Workers/Pages
    const { getRequestContext } = require('@cloudflare/next-on-pages');
    const { env, cf, ctx } = getRequestContext();

    // Initialize your database or other services here
    // This is equivalent to your React app's initialization
    initializeServices(env);

    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createContext({ req, env, cf, workerCtx: ctx }),
    });
  } catch {
    // Running locally - no Cloudflare context available
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createContext({ req }),
    });
  }
};

export { handler as GET, handler as POST };
