import type { CloudflareEnv } from '@/types/cloudflare';

/**
 * Initialize services when the worker starts
 * Call this from your tRPC route handler
 */
export function initializeServices(env: CloudflareEnv) {
  // Initialize your database
  // Example: initDatabase(env.DB);

  // Initialize other services
  // Example: setupCache(env.MY_KV);

  // You can also do lazy initialization in your procedures
  // if you prefer to initialize on first use
}
