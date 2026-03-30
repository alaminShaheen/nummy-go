/**
 * apps/customer-web/src/hooks/useWebSocket.ts
 *
 * Hook that manages a WebSocket connection to the TenantOrderDO.
 *
 * ── Connection path ────────────────────────────────────────────────────────
 *   ws://localhost:8787/ws/tenant/:tenantId   (dev)
 *   wss://nummygo-api.workers.dev/ws/tenant/:tenantId  (prod)
 *
 * ── Message handling ───────────────────────────────────────────────────────
 * The DO broadcasts WsMessage objects (see shared/types).
 * This hook parses them and calls the onMessage callback so the component
 * can update its local state (e.g. add a new order to the list).
 *
 * ── Reconnection ───────────────────────────────────────────────────────────
 * Implements exponential backoff reconnection so temporary network
 * interruptions don't kill the live-update experience.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { WsMessage } from '@nummygo/shared';

/** Base URL for the api-worker WebSocket endpoint. */
function getWsUrl(tenantId: string) {
  const base =
    process.env.NEXT_PUBLIC_API_WORKER_URL ?? 'http://localhost:8787';
  // Convert http(s) → ws(s)
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}/ws/tenant/${tenantId}`;
}

interface UseWebSocketOptions {
  /** Called whenever the DO broadcasts a message. */
  onMessage: (msg: WsMessage) => void;
  /** Called when the connection opens successfully. */
  onConnect?: () => void;
  /** Called when the connection closes unexpectedly. */
  onDisconnect?: () => void;
}

/**
 * Opens and maintains a WebSocket connection to the given tenant's DO room.
 *
 * @param tenantId - The tenant whose order updates to subscribe to.
 * @param options  - Event callbacks.
 */
export function useWebSocket(
  tenantId: string | null,
  { onMessage, onConnect, onDisconnect }: UseWebSocketOptions
) {
  const wsRef           = useRef<WebSocket | null>(null);
  const reconnectDelay  = useRef(1000); // Start with 1 second
  const unmountedRef    = useRef(false);

  // Stable callback ref – avoids re-connecting on every render
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!tenantId || unmountedRef.current) return;

    const url = getWsUrl(tenantId);
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 1000; // Reset backoff on successful connect
      onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        onMessageRef.current(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      onDisconnect?.();
      if (!unmountedRef.current) {
        // Exponential backoff: 1s → 2s → 4s → … max 30s
        const delay = Math.min(reconnectDelay.current, 30_000);
        reconnectDelay.current = delay * 2;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror, so reconnect happens there
      ws.close();
    };
  }, [tenantId, onConnect, onDisconnect]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    // Heartbeat – send ping every 20s to keep the connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 20_000);

    return () => {
      unmountedRef.current = true;
      clearInterval(pingInterval);
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    /** Manually close the connection. */
    disconnect: () => wsRef.current?.close(),
    /** Current WebSocket readyState (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED). */
    readyState: wsRef.current?.readyState,
  };
}
