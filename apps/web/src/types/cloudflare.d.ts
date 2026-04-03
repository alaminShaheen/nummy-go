/**
 * Cloudflare Service Bindings
 *
 * This interface extends the auto-generated Env type from `wrangler types`
 * Add your additional bindings here as needed.
 *
 * To generate types: pnpm cf-typegen
 */

// Auto-generated types from wrangler will be in worker-configuration.d.ts
// This interface extends those with any custom additions
export interface CloudflareEnv extends Env {
  // Add additional typed bindings here
  // Examples:

  // KV Namespace
  // MY_KV: KVNamespace;

  // D1 Database
  // DB: D1Database;

  // R2 Bucket
  // MY_BUCKET: R2Bucket;

  // Durable Object
  // MY_DO: DurableObjectNamespace;

  // Service Binding
  // MY_SERVICE: Fetcher;

  // Analytics Engine
  // ANALYTICS: AnalyticsEngineDataset;

  // AI
  // AI: Ai;

  // Queue Producer
  // MY_QUEUE: Queue;

  // Vectorize Index
  // VECTORIZE_INDEX: VectorizeIndex;

  // Environment variables
  // ENVIRONMENT?: string;
}
