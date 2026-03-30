/**
 * api-worker/src/dos/TenantOrderDO.ts
 *
 * TenantOrderDO – Durable Object for real-time order broadcasting.
 *
 * ── What is a Durable Object? ──────────────────────────────────────────────
 * A Durable Object (DO) is a single-threaded, stateful class that lives in
 * ONE specific Cloudflare data centre.  Unlike regular Workers (which are
 * stateless and may run in many isolates), a DO instance is guaranteed to be
 * a single instance – perfect for coordinating WebSocket connections.
 *
 * ── Architecture ───────────────────────────────────────────────────────────
 * One DO instance = one tenant (identified by tenantId).
 * idFromName(tenantId) in the Worker ensures the same instance is always used.
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │                  TenantOrderDO (per tenant)             │
 *  │                                                         │
 *  │  connections: Map<tenantId, Set<WebSocket>>             │
 *  │                                                         │
 *  │  fetch("/ws/tenant/:id")   → handle WS upgrade          │
 *  │  fetch("/broadcast")       → broadcast to all clients   │
 *  └─────────────────────────────────────────────────────────┘
 *
 * ── WebSocket lifecycle ────────────────────────────────────────────────────
 * 1. Client connects: /ws/tenant/:tenantId
 * 2. Worker routes to this DO via `doStub.fetch(request)`
 * 3. DO creates a WebSocketPair, stores the server socket, returns client socket
 * 4. Client receives live ORDER_CREATED / ORDER_UPDATED events
 * 5. On disconnect, DO removes the socket from the group
 */

import type { WsMessage } from '@nummygo/shared/types';

export class TenantOrderDO implements DurableObject {
  /**
   * Map of tenantId → Set of active WebSocket connections.
   *
   * Although this DO instance is per-tenant (one DO = one tenant), we still
   * key by tenantId here so the structure is explicit and can later support
   * multi-tenant DO instances if needed.
   */
  private connections: Map<string, Set<WebSocket>> = new Map();

  // state and env are injected by the CF runtime
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Record<string, unknown>
  ) {}

  // ── Main request handler ─────────────────────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Route 1: WebSocket upgrade from the main Worker
    if (url.pathname.startsWith('/ws/tenant/')) {
      return this.handleWebSocketUpgrade(request, url);
    }

    // Route 2: Internal broadcast from orderService
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      return this.handleBroadcast(request);
    }

    return new Response('Not found', { status: 404 });
  }

  // ── WebSocket upgrade ────────────────────────────────────────────────────

  private handleWebSocketUpgrade(request: Request, url: URL): Response {
    const tenantId = url.pathname.split('/ws/tenant/')[1];
    if (!tenantId) {
      return new Response('Missing tenantId', { status: 400 });
    }

    // WebSocketPair creates two paired sockets:
    //  - client: returned to the browser
    //  - server: kept in the DO to send/receive messages
    const pair   = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    // Accept the server-side socket so we can use it
    server.accept();

    // Register the connection in our tenant group
    this.addConnection(tenantId, server);

    // Set up event listeners on the server socket
    server.addEventListener('message', (event) => {
      // Clients can send messages (e.g. ping/pong) – handle here if needed
      this.handleClientMessage(tenantId, server, event.data);
    });

    server.addEventListener('close', () => {
      this.removeConnection(tenantId, server);
    });

    server.addEventListener('error', () => {
      this.removeConnection(tenantId, server);
    });

    // Return the client socket to the browser with 101 Switching Protocols
    return new Response(null, {
      status:  101,
      webSocket: client,
    });
  }

  // ── Internal broadcast handler ───────────────────────────────────────────

  private async handleBroadcast(request: Request): Promise<Response> {
    const body = await request.json<{ tenantId: string; message: WsMessage }>();
    this.broadcast(body.tenantId, body.message);
    return new Response('OK');
  }

  // ── broadcast ────────────────────────────────────────────────────────────

  /**
   * Send a message to ALL WebSocket clients connected for a given tenantId.
   *
   * Serialises the WsMessage to JSON and sends it to each live socket.
   * Dead sockets are cleaned up automatically.
   */
  broadcast(tenantId: string, message: WsMessage): void {
    const group = this.connections.get(tenantId);
    if (!group || group.size === 0) return;

    const payload = JSON.stringify(message);

    for (const socket of group) {
      try {
        socket.send(payload);
      } catch {
        // Socket is dead – remove it to avoid memory leaks
        group.delete(socket);
      }
    }
  }

  // ── Client message handler ───────────────────────────────────────────────

  private handleClientMessage(
    tenantId: string,
    socket: WebSocket,
    data: string | ArrayBuffer
  ): void {
    // Simple ping/pong keepalive – prevents proxies from closing idle connections
    if (data === 'ping') {
      socket.send('pong');
      return;
    }
    // Extend here to handle other client-to-server messages if needed
  }

  // ── Connection bookkeeping ───────────────────────────────────────────────

  private addConnection(tenantId: string, socket: WebSocket): void {
    if (!this.connections.has(tenantId)) {
      this.connections.set(tenantId, new Set());
    }
    this.connections.get(tenantId)!.add(socket);
  }

  private removeConnection(tenantId: string, socket: WebSocket): void {
    const group = this.connections.get(tenantId);
    if (!group) return;
    group.delete(socket);
    // Clean up empty groups to free memory
    if (group.size === 0) {
      this.connections.delete(tenantId);
    }
  }
}
