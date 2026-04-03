/**
 * apps/tenant-web/src/hooks/useWebSocket.ts
 *
 * Identical in structure to customer-web's useWebSocket.
 * Both apps connect to the same TenantOrderDO endpoint –
 * the DO broadcasts to ALL clients subscribed to a tenantId.
 *
 * Tenant dashboard receives:
 *  - ORDER_CREATED → a new order just came in (show notification)
 *  - ORDER_UPDATED → a status update (can happen from another tenant tab)
 *
 * See customer-web/src/hooks/useWebSocket.ts for full implementation notes.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { WsMessage } from '@nummygo/shared/models/types';

function getWsUrl(tenantId: string) {
  const base =
    process.env.NEXT_PUBLIC_API_WORKER_URL ?? 'http://localhost:8787';
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}/ws/tenant/${tenantId}`;
}

interface UseWebSocketOptions {
  onMessage:     (msg: WsMessage) => void;
  onConnect?:    () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(
  tenantId: string | null,
  { onMessage, onConnect, onDisconnect }: UseWebSocketOptions
) {
  const wsRef          = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000);
  const unmountedRef   = useRef(false);
  const onMessageRef   = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!tenantId || unmountedRef.current) return;

    const ws = new WebSocket(getWsUrl(tenantId));
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 1000;
      onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        onMessageRef.current(msg);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      onDisconnect?.();
      if (!unmountedRef.current) {
        const delay = Math.min(reconnectDelay.current, 30_000);
        reconnectDelay.current = delay * 2;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => ws.close();
  }, [tenantId, onConnect, onDisconnect]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

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
    disconnect: () => wsRef.current?.close(),
    readyState: wsRef.current?.readyState,
  };
}
