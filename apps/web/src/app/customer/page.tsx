'use client';

import { useState, useCallback } from 'react';
import { trpc } from '@/trpc/client';
import { useOrders } from '@/hooks/useOrders';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Order, WsMessage } from '@nummygo/shared/models/types';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StatusBadge } from '@/components/ui';

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002';

export default function CustomerPage() {
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [quantity, setQuantity] = useState(1);

  const { orders: initialOrders, isLoading } = useOrders(DEMO_USER_ID);

  const checkoutMutation = trpc.order.checkout.useMutation({
    onSuccess: (result) => {
      // The new checkout returns { checkoutSessionId }, not an Order directly.
      // For this demo page we'll just log it.
      console.log('Checkout session:', result.checkoutSessionId);
    },
  });

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'ORDER_UPDATED') {
      setLiveOrders((prev) =>
        prev.map((o) => (o.id === msg.order.id ? msg.order : o))
      );
    }
  }, []);

  useWebSocket(DEMO_TENANT_ID, {
    onMessage: handleWsMessage,
    onConnect: () => setWsStatus('connected'),
    onDisconnect: () => setWsStatus('disconnected'),
  });

  const allOrders = [
    ...liveOrders,
    ...initialOrders.filter((o) => !liveOrders.some((l) => l.id === o.id)),
  ];

  const handlePlaceOrder = () => {
    checkoutMutation.mutate({
      cart: [{
        tenantId: DEMO_TENANT_ID,
        items: [{ menuItemId: '00000000-0000-0000-0000-000000000003', quantity }],
      }],
      customerName: 'Demo Customer',
      customerPhone: '4165550192',
    });
  };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <h1>nummyGo – Customer</h1>

      {/* WebSocket status */}
      <p style={{ color: wsStatus === 'connected' ? '#10b981' : '#f59e0b' }}>
        WebSocket: {wsStatus}
      </p>

      {/* Place Order */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Place an Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mt-2">
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
              className="w-20"
            />
            <Button
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? 'Placing…' : 'Place Order'}
            </Button>
          </div>
          {checkoutMutation.isError && (
            <p className="text-destructive text-sm mt-2">
              {checkoutMutation.error.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Your Orders */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
        {isLoading && (
          <p className="text-muted-foreground">Loading orders…</p>
        )}
        {allOrders.length === 0 && !isLoading && (
          <p className="text-muted-foreground">No orders yet.</p>
        )}
        <ul className="space-y-3 list-none p-0">
          {allOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <li>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <strong className="text-sm">Order #{order.id.slice(0, 8)}</strong>
            <StatusBadge status={order.status} />
          </div>
          <p className="font-semibold mt-2">${order.totalAmount.toFixed(2)}</p>
        </CardContent>
      </Card>
    </li>
  );
}
