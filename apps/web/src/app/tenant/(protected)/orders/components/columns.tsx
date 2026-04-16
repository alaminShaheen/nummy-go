'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@nummygo/shared/models/types';
import { OrderActions } from './OrderActions';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Package,
  MapPin,
  Store,
  CreditCard,
  Clock,
  Bell,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui';
import { useTheme } from '@/lib/themes';

// ── Theme-aware header label ────────────────────────────────────────────────

function ColHeader({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <span
      className="text-xs font-bold uppercase tracking-wider"
      style={{ color: theme.text.secondary }}
    >
      {children}
    </span>
  );
}

function SortableColHeader({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex items-center text-xs font-bold uppercase tracking-wider transition-colors"
      style={{ color: theme.text.secondary }}
      onMouseEnter={e => (e.currentTarget.style.color = theme.accent.amber)}
      onMouseLeave={e => (e.currentTarget.style.color = theme.text.secondary)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </button>
  );
}

// ── Sub-badges ─────────────────────────────────────────────────────────────

export const FulfillmentBadge = ({ method }: { method: 'pickup' | 'delivery' }) => {
  if (method === 'delivery') {
    return (
      <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
        <MapPin className="w-3.5 h-3.5" />
        Delivery
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
      <Package className="w-3.5 h-3.5" />
      Pickup
    </div>
  );
};

export const PaymentBadge = ({ method }: { method: 'counter' | 'card' }) => {
  if (method === 'card') {
    return (
      <div className="inline-flex items-center gap-1.5 text-indigo-500 text-xs font-semibold">
        <CreditCard className="w-3.5 h-3.5" />
        Paid Online
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
      <Store className="w-3.5 h-3.5" />
      Pay at Store
    </div>
  );
};

export const ModificationBadge = ({ status }: { status: Order['modificationStatus'] }) => {
  if (!status) return null;
  const configs = {
    pending: { className: 'text-amber-500 animate-pulse', label: 'Mod Pending' },
    accepted: { className: 'text-emerald-600', label: 'Mod Accepted' },
    rejected: { className: 'text-rose-500', label: 'Mod Rejected' },
  } as const;
  const c = configs[status];
  return (
    <div className={cn('inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide', c.className)}>
      <Bell className="w-3.5 h-3.5" />
      {c.label}
    </div>
  );
};

// ── Row cell text helper ────────────────────────────────────────────────────

function useCellColors() {
  const { theme } = useTheme();
  return { primary: theme.text.primary, secondary: theme.text.secondary, muted: theme.text.muted };
}

// ── Column factory ─────────────────────────────────────────────────────────

export function buildColumns({
  onReviewModification,
  loadingOrderId,
  estimatedPrepTime = 20,
}: {
  onReviewModification: (order: Order) => void;
  loadingOrderId?: string | null;
  estimatedPrepTime?: number;
}): ColumnDef<Order>[] {
  return [
    {
      id: 'expander',
      enableHiding: false,
      header: () => null,
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { theme } = useTheme();
        return (
          <div className="px-2">
            <button
              onClick={row.getToggleExpandedHandler()}
              className="p-1 rounded-md transition-colors"
              style={{ color: theme.text.muted }}
              onMouseEnter={e => (e.currentTarget.style.background = theme.card.border)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {row.getIsExpanded() ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortableColHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Received
        </SortableColHeader>
      ),
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const colors = useCellColors();
        const ts = row.getValue('createdAt') as number;
        const date = new Date(ts);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold" style={{ color: colors.primary }}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs" style={{ color: colors.muted }}>{date.toLocaleDateString()}</span>
          </div>
        );
      },
    },
    {
      id: 'targetTime',
      accessorFn: (row) => row.scheduledFor ? new Date(row.scheduledFor).getTime() : row.createdAt + (estimatedPrepTime * 60000),
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors"
        >
          Target Time
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </button>
      ),
      cell: ({ row, getValue }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const colors = useCellColors();
        const order = row.original;
        const ts = getValue() as number;
        const effectiveTs = ts + (order.delayMinutes * 60000);
        const date = new Date(effectiveTs);
        const isLate = effectiveTs < Date.now() && order.status !== 'ready' && order.status !== 'completed' && order.status !== 'cancelled';

        return (
          <div className="flex flex-col">
            <span className={cn('text-sm font-black', isLate ? 'text-rose-500 animate-pulse' : 'text-amber-500')}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs font-semibold" style={{ color: colors.muted }}>
              {order.scheduledFor ? 'Scheduled' : 'ASAP'}
              {order.delayMinutes > 0 && ` (+${order.delayMinutes}m)`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'id',
      header: () => <ColHeader>Order ID</ColHeader>,
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const colors = useCellColors();
        const id = row.getValue('id') as string;
        return <div className="text-xs font-mono" style={{ color: colors.muted }}>#{id.slice(-6).toUpperCase()}</div>;
      },
    },
    {
      id: 'customer',
      header: () => <ColHeader>Customer</ColHeader>,
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const colors = useCellColors();
        const order = row.original;
        return (
          <div className="flex flex-col min-w-[120px]">
            <span className="text-sm font-medium" style={{ color: colors.primary }}>{order.customerName || 'Guest'}</span>
            <span className="text-xs" style={{ color: colors.muted }}>{order.customerPhone || 'No Phone'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: () => <ColHeader>Total</ColHeader>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        return <div className="font-bold text-amber-500">{formatted}</div>;
      },
    },
    {
      accessorKey: 'fulfillmentMethod',
      header: () => <ColHeader>Method</ColHeader>,
      cell: ({ row }) => <FulfillmentBadge method={row.getValue('fulfillmentMethod')} />,
    },
    {
      accessorKey: 'paymentMethod',
      header: () => <ColHeader>Payment</ColHeader>,
      cell: ({ row }) => <PaymentBadge method={row.getValue('paymentMethod')} />,
    },
    {
      accessorKey: 'status',
      header: () => <ColHeader>Status</ColHeader>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col gap-1">
            <StatusBadge status={row.getValue('status') as string} />
            {order.modificationStatus && (
              <ModificationBadge status={order.modificationStatus} />
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      header: () => <ColHeader>Actions</ColHeader>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex justify-end items-center gap-2">
            {order.modificationStatus === 'pending' && (
              <button
                onClick={() => onReviewModification(order)}
                disabled={loadingOrderId === order.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/25 text-xs font-bold transition-all disabled:opacity-60"
              >
                {loadingOrderId === order.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Bell className="w-3.5 h-3.5" />}
                {loadingOrderId === order.id ? 'Loading…' : 'Review'}
              </button>
            )}
            <OrderActions orderId={order.id} status={order.status} />
          </div>
        );
      },
    },
  ];
}

// ── Legacy export ──────────────────────────────────────────────────────────
export const columns = buildColumns({ onReviewModification: () => {} });
