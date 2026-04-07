// ── Environment bindings ───────────────────────────────────────────────────
export interface Env {
  // ── Bindings ──────────────────────────────────────────────────────────
  DB: D1Database;
  TENANT_ORDER_DO: DurableObjectNamespace;

  // ── Vars (wrangler.jsonc) ─────────────────────────────────────────────
  ENVIRONMENT:      string;
  CORS_ORIGIN:      string;
  CUSTOMER_WEB_URL: string;
  TENANT_WEB_URL:   string;
  BETTER_AUTH_URL:  string;

  // ── Secrets (wrangler secret put) ────────────────────────────────────
  BETTER_AUTH_SECRET:   string;
  GOOGLE_CLIENT_ID:     string;
  GOOGLE_CLIENT_SECRET: string;
}

// ── Exports ────────────────────────────────────────────────────────────────
export { ApiWorker as default } from './workers/ApiWorker';
export { TenantOrderDO }        from './dos/TenantOrderDO';
