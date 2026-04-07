import { WorkerEntrypoint } from 'cloudflare:workers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../trpc/routers/_app';
import { createContext } from '../trpc/context';
import { createAuth } from '../auth';
import type { Env } from '../index';
import { initDatabase } from '@nummygo/shared/db';

export class ApiWorker extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		initDatabase(env.DB);
	}

	override async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('origin') ?? '';
		const cors = this.#corsHeaders(origin);

		// ── CORS preflight ───────────────────────────────────────────────────
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: cors });
		}

		// ── Auth: /api/auth/* ────────────────────────────────────────────────
		if (url.pathname.startsWith('/api/auth')) {
			const response = await createAuth(this.env).handler(request);
			const headers = new Headers(response.headers);
			for (const [key, value] of Object.entries(cors)) {
				headers.set(key, value);
			}
			return new Response(response.body, { status: response.status, headers });
		}

		// ── WebSocket: /ws/tenant/:tenantId ──────────────────────────────────
		if (url.pathname.startsWith('/ws/tenant/')) {
			const tenantId = url.pathname.split('/ws/tenant/')[1];
			if (!tenantId) return new Response('Missing tenantId', { status: 400, headers: cors });
			return this.#forwardToDO(request, tenantId);
		}

		// ── WebSocket: /ws/session/:sessionId ────────────────────────────────
		if (url.pathname.startsWith('/ws/session/')) {
			const sessionId = url.pathname.split('/ws/session/')[1];
			if (!sessionId) return new Response('Missing sessionId', { status: 400, headers: cors });

			// Session may span multiple tenants. For now, use the sessionId as the DO name.
			// All orders in a checkout session route to a single DO keyed by sessionId,
			// and the orderService broadcasts to BOTH the tenant DO and the session DO.
			return this.#forwardToDO(request, `session:${sessionId}`);
		}

		// ── tRPC: /trpc/* ────────────────────────────────────────────────────
		if (url.pathname.startsWith('/trpc')) {
			const response = await fetchRequestHandler({
				endpoint: '/trpc',
				req: request,
				router: appRouter,
				createContext: () => createContext({ req: request, env: this.env, ctx: this.ctx }),
			});

			const headers = new Headers(response.headers);
			for (const [key, value] of Object.entries(cors)) {
				headers.set(key, value);
			}
			return new Response(response.body, { status: response.status, headers });
		}

		// ── 404 ──────────────────────────────────────────────────────────────
		return new Response(JSON.stringify({ error: 'Not found', path: url.pathname }), {
			status: 404,
			headers: { 'Content-Type': 'application/json', ...cors },
		});
	}

	// ── Private helpers ────────────────────────────────────────────────────

	/**
	 * Forward a WebSocket upgrade request to the TenantOrderDO.
	 * The `doName` is used with idFromName() to get a deterministic DO instance.
	 */
	#forwardToDO(request: Request, doName: string): Promise<Response> {
		const doId = this.env.TENANT_ORDER_DO.idFromName(doName);
		const stub = this.env.TENANT_ORDER_DO.get(doId);
		return stub.fetch(request);
	}

	#corsHeaders(origin: string): HeadersInit {
		const corsOrigin = this.env?.CORS_ORIGIN || '*';
		const allowed = corsOrigin.split(',').map((o) => o.trim().replace(/\/$/, ''));
		const reflect = allowed.includes(origin) ? origin : (allowed[0] ?? '*');
		return {
			'Access-Control-Allow-Origin': reflect,
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Max-Age': '86400',
		};
	}
}
