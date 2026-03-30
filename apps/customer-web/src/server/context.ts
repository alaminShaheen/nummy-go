import type { CloudflareEnv } from '@/types/cloudflare';

// Define the context type
export interface Context {
  req?: Request;
  env?: CloudflareEnv;
  cf?: IncomingRequestCfProperties;
  workerCtx?: {
    waitUntil: (promise: Promise<unknown>) => void;
    passThroughOnException: () => void;
  };
}

interface CreateContextOptions {
  req: Request;
  env?: CloudflareEnv;
  cf?: IncomingRequestCfProperties;
  workerCtx?: {
    waitUntil: (promise: Promise<unknown>) => void;
    passThroughOnException: () => void;
  };
}

// Create context with Cloudflare bindings
export const createContext = (opts: CreateContextOptions): Context => {
  return {
    req: opts.req,
    env: opts.env,
    cf: opts.cf,
    workerCtx: opts.workerCtx,
  };
};
