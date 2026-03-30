/**
 * apps/customer-web/src/app/page.tsx
 *
 * Customer home page – Place an order and watch it update in real-time.
 *
 * ── Demo flow ──────────────────────────────────────────────────────────────
 * 1. Fill in demo IDs (tenantId, customerId) and item details.
 * 2. Click "Place Order" → tRPC mutation → api-worker → D1 + DO broadcast.
 * 3. The tenant dashboard (tenant-web) receives the ORDER_CREATED event.
 * 4. When the tenant updates the status, this page receives ORDER_UPDATED.
 *
 * In production you would replace the hardcoded IDs with:
 *  - tenantId: from URL param (/order/:tenantSlug)
 *  - customerId: from auth session or local storage
 */

'use client';

import { useState, useCallback } from 'react';
import { trpc }            from '@/trpc/client';
import { useOrders }       from '@/hooks/useOrders';
import { useWebSocket }    from '@/hooks/useWebSocket';
import type { Order, WsMessage } from '@nummygo/shared';

// ── Demo constants (replace with real auth/routing in production) ──────────
// Create these UUIDs in your D1 database first via wrangler d1 execute.
const DEMO_TENANT_ID   = '00000000-0000-0000-0000-000000000001';
const DEMO_CUSTOMER_ID = '00000000-0000-0000-0000-000000000002';

export default function CustomerPage() {
  // ── Local state ──────────────────────────────────────────────────────────
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [wsStatus, setWsStatus]     = useState<'connected' | 'disconnected'>('disconnected');
  const [itemName, setItemName]     = useState('Burger');
  const [quantity, setQuantity]     = useState(1);

  // ── tRPC hooks ───────────────────────────────────────────────────────────
  // Initial order fetch (populates before WebSocket connects)
  const { orders: initialOrders, isLoading } = useOrders(DEMO_CUSTOMER_ID);

  // Place order mutation
  const placeOrderMutation = trpc.customer.placeOrder.useMutation({
    onSuccess: (newOrder) => {
      // Optimistically prepend the new order to the live list
      setLiveOrders((prev) => [newOrder, ...prev]);
    },
  });

  // ── WebSocket ─────────────────────────────────────────────────────────────
  // Receive real-time broadcasts from TenantOrderDO
  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'ORDER_UPDATED') {
      // Update the order in the live list when the tenant changes its status
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

  // Merge initial orders with live updates (deduped by id)
  const allOrders = [
    ...liveOrders,
    ...initialOrders.filter(
      (o) => !liveOrders.some((l) => l.id === o.id)
    ),
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    placeOrderMutation.mutate({
      tenantId:   DEMO_TENANT_ID,
      customerId: DEMO_CUSTOMER_ID,
      items: [
        {
          menuItemId: crypto.randomUUID(),
          name:       itemName,
          unitPrice:  9.99,
          quantity,
        },
      ],
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <h1>NummyGo – Customer</h1>

      {/* WebSocket status indicator */}
      <p style={{ color: wsStatus === 'connected' ? 'green' : 'orange' }}>
        WebSocket: {wsStatus}
      </p>

      {/* ── Place Order form ────────────────────────────────────────── */}
      <section style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Place an Order</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name"
            style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: 64, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending || !itemName}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 4,
              background: '#111',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {placeOrderMutation.isPending ? 'Placing…' : 'Place Order'}
          </button>
        </div>
        {placeOrderMutation.isError && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>
            Error: {placeOrderMutation.error.message}
          </p>
        )}
      </section>

      {/* ── Order list ──────────────────────────────────────────────── */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Your Orders</h2>
        {isLoading && <p>Loading orders…</p>}
        {allOrders.length === 0 && !isLoading && (
          <p style={{ color: '#999' }}>No orders yet. Place one above!</p>
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

// ── OrderCard component ────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const statusColour: Record<string, string> = {
    PENDING:   '#3b82f6',
    PREPARING: '#f59e0b',
    READY:     '#10b981',
    DELIVERED: '#6b7280',
    CANCELLED: '#ef4444',
  };
  return (
    <li
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Order #{order.id.slice(0, 8)}</strong>
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 9999,
            background: statusColour[order.status] ?? '#999',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {order.status}
        </span>
      </div>
      <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none' }}>
        {order.items.map((item, i) => (
          <li key={i} style={{ fontSize: 14, color: '#555' }}>
            {item.quantity}× {item.name} – ${item.unitPrice.toFixed(2)}
          </li>
        ))}
      </ul>
      <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>
        Total: ${order.totalPrice.toFixed(2)}
      </p>
    </li>
  );
}
