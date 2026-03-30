'use client';

import { useState, useCallback } from 'react';
import { trpc }                  from '@/trpc/client';
import { useDashboardOrders }    from '@/hooks/useDashboardOrders';
import { useWebSocket }          from '@/hooks/useWebSocket';
import type { Order, WsMessage } from '@nummygo/shared/models/types';
import type { OrderStatus }      from '@nummygo/shared/models/enums';

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'completed',
};

export default function TenantDashboard() {
  const [liveOrders, setLiveOrders]   = useState<Order[]>([]);
  const [wsStatus, setWsStatus]       = useState<'connected' | 'disconnected'>('disconnected');
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  const { orders: initialOrders, isLoading, refetch } = useDashboardOrders(DEMO_TENANT_ID);

  const updateStatusMutation = trpc.tenant.updateOrderStatus.useMutation({
    onSuccess: (updatedOrder) => {
      setLiveOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    },
  });

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'ORDER_CREATED') {
      setLiveOrders((prev) => [msg.order, ...prev]);
      setNewOrderIds((prev) => {
        const next = new Set(prev);
        next.add(msg.order.id);
        setTimeout(() => {
          setNewOrderIds((ids) => {
            const s = new Set(ids);
            s.delete(msg.order.id);
            return s;
          });
        }, 5000);
        return next;
      });
    }
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

  const pending   = allOrders.filter((o) => o.status === 'pending');
  const preparing = allOrders.filter((o) => o.status === 'preparing');
  const ready     = allOrders.filter((o) => o.status === 'ready');

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>NummyGo – Tenant Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: wsStatus === 'connected' ? 'green' : 'orange', fontSize: 14 }}>
            ● {wsStatus}
          </span>
          <button onClick={() => refetch()} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>

      {isLoading && <p>Loading orders…</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        <Column
          title="Pending"
          orders={pending}
          isNew={newOrderIds}
          onAdvance={(id) => updateStatusMutation.mutate({ orderId: id, status: NEXT_STATUS['pending']! })}
          advanceLabel="Start Preparing"
          onCancel={(id) => updateStatusMutation.mutate({ orderId: id, status: 'cancelled' })}
        />
        <Column
          title="Preparing"
          orders={preparing}
          isNew={newOrderIds}
          onAdvance={(id) => updateStatusMutation.mutate({ orderId: id, status: NEXT_STATUS['preparing']! })}
          advanceLabel="Mark Ready"
        />
        <Column
          title="Ready for Pick-up"
          orders={ready}
          isNew={newOrderIds}
          onAdvance={(id) => updateStatusMutation.mutate({ orderId: id, status: NEXT_STATUS['ready']! })}
          advanceLabel="Mark Completed"
        />
      </div>
    </main>
  );
}

function Column({
  title,
  orders,
  isNew,
  onAdvance,
  advanceLabel,
  onCancel,
}: {
  title:        string;
  orders:       Order[];
  isNew:        Set<string>;
  onAdvance:    (id: string) => void;
  advanceLabel: string;
  onCancel?:    (id: string) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: '1rem' }}>
        {title} <span style={{ color: '#888' }}>({orders.length})</span>
      </h2>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isNew={isNew.has(order.id)}
          onAdvance={() => onAdvance(order.id)}
          advanceLabel={advanceLabel}
          onCancel={onCancel ? () => onCancel(order.id) : undefined}
        />
      ))}
      {orders.length === 0 && (
        <p style={{ color: '#bbb', fontSize: 14 }}>No orders here</p>
      )}
    </div>
  );
}

function OrderCard({
  order,
  isNew,
  onAdvance,
  advanceLabel,
  onCancel,
}: {
  order:        Order;
  isNew:        boolean;
  onAdvance:    () => void;
  advanceLabel: string;
  onCancel?:    () => void;
}) {
  return (
    <div
      style={{
        padding: '1rem',
        marginBottom: '0.75rem',
        border: `2px solid ${isNew ? '#f59e0b' : '#e5e7eb'}`,
        borderRadius: 8,
        background: isNew ? '#fffbeb' : '#fff',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      {isNew && (
        <p style={{ color: '#d97706', fontWeight: 700, fontSize: 12, margin: '0 0 0.5rem' }}>
          NEW ORDER
        </p>
      )}
      <strong style={{ fontSize: 14 }}>#{order.id.slice(0, 8)}</strong>
      {order.specialInstruction && (
        <p style={{ fontSize: 12, color: '#888', margin: '0.5rem 0' }}>
          Note: {order.specialInstruction}
        </p>
      )}
      <p style={{ fontWeight: 600, margin: '0.5rem 0 0.75rem', fontSize: 14 }}>
        ${order.totalAmount.toFixed(2)}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onAdvance}
          style={{
            flex: 1,
            padding: '0.35rem 0',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {advanceLabel}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: '0.35rem 0.6rem',
              background: '#fee2e2',
              color: '#b91c1c',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
