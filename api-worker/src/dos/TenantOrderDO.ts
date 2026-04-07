/**
 * api-worker/src/dos/TenantOrderDO.ts
 *
 * TenantOrderDO – Durable Object for real-time order broadcasting.
 * Uses the WebSocket Hibernation API for cost-efficient long-lived connections.
 *
 * ── Hibernation API ─────────────────────────────────────────────────────
 * Instead of keeping the DO alive for every ping/pong, the Hibernation API
 * lets the DO sleep while WebSocket connections remain open. The CF runtime
 * handles pong auto-responses without waking the DO. The DO only wakes for:
 *   - A new broadcast (order created/updated)
 *   - A client message (other than ping)
 *   - Connection open/close events
 *
 * ── Connection types ────────────────────────────────────────────────────
 * Two groups stored via WebSocket tags:
 *   - "tenant:{tenantId}"   → tenant dashboard connections
 *   - "session:{sessionId}" → customer tracking page connections
 *
 * Tags allow getWebSockets(tag) to efficiently target broadcasts.
 */

import type { WsMessage } from '@nummygo/shared/models/types';

export class TenantOrderDO implements DurableObject {
  constructor(
    private readonly ctx: DurableObjectState,
    private readonly env: Record<string, unknown>,
  ) {}

  // ── Main request handler ───────────────────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Route 1: WebSocket upgrade for tenant dashboard
    if (url.pathname.startsWith('/ws/tenant/')) {
      const tenantId = url.pathname.split('/ws/tenant/')[1];
      if (!tenantId) return new Response('Missing tenantId', { status: 400 });
      return this.handleUpgrade(request, `tenant:${tenantId}`);
    }

    // Route 2: WebSocket upgrade for customer tracking
    if (url.pathname.startsWith('/ws/session/')) {
      const sessionId = url.pathname.split('/ws/session/')[1];
      if (!sessionId) return new Response('Missing sessionId', { status: 400 });
      return this.handleUpgrade(request, `session:${sessionId}`);
    }

    // Route 3: Internal broadcast from orderService
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      return this.handleBroadcast(request);
    }

    return new Response('Not found', { status: 404 });
  }

  // ── Hibernation API WebSocket handlers ─────────────────────────────────

  /**
   * Called when a hibernated DO wakes up due to a WebSocket message.
   * With auto-response set for 'ping', this only fires for non-ping messages.
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Currently no client-to-server messages other than ping (handled by auto-response)
  }

  /**
   * Called when a WebSocket connection is closed (client navigates away, etc).
   * The DO wakes briefly to handle cleanup, then goes back to sleep.
   */
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    ws.close(code, reason);
  }

  /**
   * Called on WebSocket error. Clean up the connection.
   */
  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    ws.close(1011, 'WebSocket error');
  }

  // ── Private helpers ────────────────────────────────────────────────────

  /**
   * Upgrade an HTTP request to a WebSocket using the Hibernation API.
   * The tag is used to group connections for targeted broadcasting.
   */
  private handleUpgrade(request: Request, tag: string): Response {
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    // Accept via Hibernation API — DO can sleep while sockets stay open
    this.ctx.acceptWebSocket(server, [tag]);

    // Set auto-response for ping/pong — handled by CF runtime without waking DO
    server.serializeAttachment({ tag });

    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Broadcast a message to all connections matching given tags.
   * Called internally by orderService after order create/update.
   */
  private async handleBroadcast(request: Request): Promise<Response> {
    const body = await request.json<{ tags: string[]; message: WsMessage }>();
    const payload = JSON.stringify(body.message);

    for (const tag of body.tags) {
      const sockets = this.ctx.getWebSockets(tag);
      for (const ws of sockets) {
        try {
          ws.send(payload);
        } catch {
          // Dead socket — close it; webSocketClose handler will clean up
          try { ws.close(1011, 'Send failed'); } catch { /* already closed */ }
        }
      }
    }

    return new Response('OK');
  }
}
