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

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WsMessage } from '@nummygo/shared/models/types';
import { env } from '@/env';

function getWsUrl(endpoint: string, type: 'tenant' | 'session' = 'tenant') {
  const base = env.NEXT_PUBLIC_API_WORKER_URL;
  const wsBase = base.replace(/^http/, 'ws');
  return `${wsBase}/ws/${type}/${endpoint}`;
}

interface UseWebSocketOptions {
  onMessage:     (msg: WsMessage) => void;
  onConnect?:    () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(
  endpointId: string | null,
  { onMessage, onConnect, onDisconnect, type = 'tenant' }: UseWebSocketOptions & { type?: 'tenant' | 'session' }
) {
  const wsRef          = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectDelay = useRef(1000);
  const unmountedRef   = useRef(false);

  const onMessageRef   = useRef(onMessage);
  onMessageRef.current = onMessage;

  const onConnectRef   = useRef(onConnect);
  onConnectRef.current = onConnect;

  const onDisconnectRef   = useRef(onDisconnect);
  onDisconnectRef.current = onDisconnect;

  const connect = useCallback(() => {
    if (!endpointId || unmountedRef.current) return;

    const ws = new WebSocket(getWsUrl(endpointId, type));
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return;
      reconnectDelay.current = 1000;
      setIsConnected(true);
      onConnectRef.current?.();
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return;
      try {
        const msg = JSON.parse(event.data as string) as WsMessage;
        onMessageRef.current(msg);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return;
      setIsConnected(false);
      onDisconnectRef.current?.();
      if (!unmountedRef.current) {
        const delay = Math.min(reconnectDelay.current, 30_000);
        reconnectDelay.current = delay * 2;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => ws.close();
  }, [endpointId, type]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 20_000);

    const handleOffline = () => {
      // Immediately close to trigger the offline UI
      wsRef.current?.close();
    };

    const handleOnline = () => {
      // If we are currently disconnected, connect immediately rather than waiting for next backoff
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      unmountedRef.current = true;
      clearInterval(pingInterval);
      wsRef.current?.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [connect]);

  return {
    disconnect: () => wsRef.current?.close(),
    readyState: wsRef.current?.readyState,
    isConnected,
  };
}
