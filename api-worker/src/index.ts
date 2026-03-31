// ── Environment bindings ───────────────────────────────────────────────────
// Auto-generated shape kept here so all files can import `Env` from one place.
export interface Env {
  /** Cloudflare D1 SQLite database. */
  DB: D1Database;
  /** Durable Object namespace for real-time order broadcasting. */
  TENANT_ORDER_DO: DurableObjectNamespace;
  /** Comma-separated allowed CORS origins. */
  CORS_ORIGIN: string;
  ENVIRONMENT: string;
}

// ── Exports ────────────────────────────────────────────────────────────────
// The default export is the Worker entrypoint.
// TenantOrderDO must be a named export so Wrangler can register the class.
export { ApiWorker as default } from './workers/ApiWorker';
export { TenantOrderDO }        from './dos/TenantOrderDO';
