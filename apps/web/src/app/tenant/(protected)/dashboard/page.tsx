'use client';

import React, { useState, useMemo } from 'react';
import { trpc } from '@/trpc/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { buildColumns } from '../orders/components/columns';
import { KpiCards } from '../orders/components/KpiCards';
import { OrderFilterTabs, type OrderTab } from '../orders/components/OrderFilterTabs';
import { ColumnCustomizer } from '../orders/components/ColumnCustomizer';
import { ReviewModificationDialog } from '../orders/components/ReviewModificationDialog';
import { OrdersTable } from '../orders/components/OrdersTable';
import { Skeleton } from '@/components/ui';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import type { Order } from '@nummygo/shared/models/types';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

// ── Page ───────────────────────────────────────────────────────────────────

export default function TenantDashboardPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: false }]);
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Modification review state
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<{
    order: Order;
    modificationId: string;
    diff: any[];
    currentItems: any[];
    requestedItems: any[];
    specialInstruction: string | null;
  } | null>(null);
  const [loadingModOrderId, setLoadingModOrderId] = useState<string | null>(null);

  const { data: tenant, isPending: isTenantPending } = trpc.tenant.me.useQuery(
    undefined,
    { staleTime: Infinity }
  );

  const { data: orders, isPending: isOrdersPending } = trpc.order.getDashboardOrders.useQuery(
    { tenantId: tenant?.id as string },
    { enabled: !!tenant?.id }
  );

  const { isConnected } = useWebSocket(tenant?.id || null, {
    onMessage: (message: any) => {
      if (!tenant?.id) return;
      const WS_EVENTS = ['ORDER_CREATED', 'ORDER_STATUS_UPDATED', 'ORDER_UPDATED', 'MODIFICATION_REQUESTED', 'MODIFICATION_REVIEWED'];
      if (WS_EVENTS.includes(message.type)) {
        queryClient.invalidateQueries({
          queryKey: [['order', 'getDashboardOrders'], { input: { tenantId: tenant.id }, type: 'query' }],
        });
      }
    },
  });

  // ── Sorted orders ───────────────────────────────────────────────────────────
  const STATUS_WEIGHT: Record<string, number> = { pending: 1, accepted: 2, preparing: 3, ready: 4, completed: 5, cancelled: 6 };

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      // Pending modifications always bubble to top
      const aHasMod = a.modificationStatus === 'pending' ? -1 : 0;
      const bHasMod = b.modificationStatus === 'pending' ? -1 : 0;
      if (aHasMod !== bHasMod) return aHasMod - bHasMod;
      const wa = STATUS_WEIGHT[a.status] ?? 99;
      const wb = STATUS_WEIGHT[b.status] ?? 99;
      return wa !== wb ? wa - wb : b.createdAt - a.createdAt;
    });
  }, [orders]);

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:           sortedOrders.length,
    pending:       sortedOrders.filter(o => o.status === 'pending').length,
    accepted:      sortedOrders.filter(o => o.status === 'accepted').length,
    preparing:     sortedOrders.filter(o => o.status === 'preparing').length,
    ready:         sortedOrders.filter(o => o.status === 'ready').length,
    modifications: sortedOrders.filter(o => o.modificationStatus === 'pending').length,
  }), [sortedOrders]);

  // ── Filtered by active tab ──────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return sortedOrders;
    if (activeTab === 'modifications') return sortedOrders.filter(o => o.modificationStatus === 'pending');
    return sortedOrders.filter(o => o.status === activeTab);
  }, [activeTab, sortedOrders]);

  // ── Modification details fetch ──────────────────────────────────────────────
  const pendingModOrder = sortedOrders.find(o => o.id === reviewingOrderId);
  const { data: pendingModData } = trpc.order.getModificationDetails.useQuery(
    { orderId: reviewingOrderId! },
    { enabled: !!reviewingOrderId, staleTime: 0 }
  );

  const prevModDataRef = React.useRef<typeof pendingModData>(undefined);
  if (pendingModData && pendingModOrder && reviewingOrderId && pendingModData !== prevModDataRef.current) {
    prevModDataRef.current = pendingModData;
    setLoadingModOrderId(null);
    setReviewingOrder({
      order: pendingModOrder,
      modificationId: pendingModData.modificationId,
      diff: pendingModData.diff,
      currentItems: pendingModData.currentItems,
      requestedItems: pendingModData.requestedItems,
      specialInstruction: pendingModData.specialInstruction,
    });
    setReviewingOrderId(null);
  }

  // ── Table ──────────────────────────────────────────────────────────────────
  const columns = useMemo(() => buildColumns({
    onReviewModification: (order) => {
      setReviewingOrderId(order.id);
      setLoadingModOrderId(order.id);
    },
    loadingOrderId: loadingModOrderId,
  }), [loadingModOrderId]);

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isTenantPending || (isOrdersPending && !orders)) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
        <Skeleton className="h-12 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <Skeleton className="h-96 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── Page heading + live status ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 leading-tight">
            Live Orders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time order management · synced to kitchen &amp; customers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {counts.modifications > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Bell className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-bold text-amber-400">
                {counts.modifications} mod{counts.modifications > 1 ? 's' : ''} pending
              </span>
            </div>
          )}

          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
              isConnected
                ? 'text-emerald-400'
                : 'text-rose-400'
            )}
            style={{
              background: isConnected ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
              border: isConnected ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(244,63,94,0.2)',
            }}
          >
            {isConnected
              ? <><Wifi className="w-3 h-3" aria-hidden="true" /> Live Sync</>
              : <><WifiOff className="w-3 h-3" aria-hidden="true" /> Reconnecting…</>
            }
          </div>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <KpiCards orders={sortedOrders} />

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <OrderFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
        <ColumnCustomizer table={table} />
      </div>

      {/* ── Orders table ───────────────────────────────────────────────────── */}
      <OrdersTable
        table={table}
        columns={columns}
        activeTab={activeTab}
      />

      {/* ── Modification review dialog ──────────────────────────────────────── */}
      {reviewingOrder && (
        <ReviewModificationDialog
          order={reviewingOrder.order}
          modificationId={reviewingOrder.modificationId}
          diff={reviewingOrder.diff}
          currentItems={reviewingOrder.currentItems}
          requestedItems={reviewingOrder.requestedItems}
          specialInstruction={reviewingOrder.specialInstruction}
          onClose={() => { setReviewingOrder(null); setLoadingModOrderId(null); }}
        />
      )}
    </div>
  );
}
