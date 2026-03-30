'use client';

import { useState, useCallback } from 'react';
import { trpc }         from '@/trpc/client';
import { useOrders }    from '@/hooks/useOrders';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Order, WsMessage } from '@nummygo/shared/models/types';

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID   = '00000000-0000-0000-0000-000000000002';

export default function CustomerPage() {
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [wsStatus, setWsStatus]     = useState<'connected' | 'disconnected'>('disconnected');
  const [quantity, setQuantity]     = useState(1);

  const { orders: initialOrders, isLoading } = useOrders(DEMO_USER_ID);

  const placeOrderMutation = trpc.customer.placeOrder.useMutation({
    onSuccess: (newOrder) => setLiveOrders((prev) => [newOrder, ...prev]),
  });

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'ORDER_UPDATED') {
      setLiveOrders((prev) =>
        prev.map((o) => (o.id === msg.order.id ? msg.order : o))
      );
    }
  }, []);

  useWebSocket(DEMO_TENANT_ID, {
    onMessage:    handleWsMessage,
    onConnect:    () => setWsStatus('connected'),
    onDisconnect: () => setWsStatus('disconnected'),
  });

  const allOrders = [
    ...liveOrders,
    ...initialOrders.filter((o) => !liveOrders.some((l) => l.id === o.id)),
  ];

  const handlePlaceOrder = () => {
    placeOrderMutation.mutate({
      tenantId: DEMO_TENANT_ID,
      items: [{ menuItemId: '00000000-0000-0000-0000-000000000003', quantity }],
    });
  };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <h1>NummyGo – Customer</h1>

      <p style={{ color: wsStatus === 'connected' ? 'green' : 'orange' }}>
        WebSocket: {wsStatus}
      </p>

      <section style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Place an Order</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: 64, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 4, background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            {placeOrderMutation.isPending ? 'Placing…' : 'Place Order'}
          </button>
        </div>
        {placeOrderMutation.isError && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>
            {placeOrderMutation.error.message}
          </p>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Your Orders</h2>
        {isLoading && <p>Loading orders…</p>}
        {allOrders.length === 0 && !isLoading && (
          <p style={{ color: '#999' }}>No orders yet.</p>
        )}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {allOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColour: Record<string, string> = {
    pending:   '#3b82f6',
    accepted:  '#8b5cf6',
    preparing: '#f59e0b',
    ready:     '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444',
  };
  return (
    <li style={{ padding: '1rem', marginBottom: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Order #{order.id.slice(0, 8)}</strong>
        <span style={{ padding: '2px 10px', borderRadius: 9999, background: statusColour[order.status] ?? '#999', color: '#fff', fontSize: 12, fontWeight: 600 }}>
          {order.status}
        </span>
      </div>
      <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>${order.totalAmount.toFixed(2)}</p>
    </li>
  );
}
