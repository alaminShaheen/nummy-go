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
    <div className="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
      <Package className="w-3.5 h-3.5" />
      Pickup
    </div>
  );
};

export const PaymentBadge = ({ method }: { method: 'counter' | 'card' }) => {
  if (method === 'card') {
    return (
      <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
        <CreditCard className="w-3.5 h-3.5" />
        Paid Online
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
      <Store className="w-3.5 h-3.5" />
      Pay at Store
    </div>
  );
};

export const ModificationBadge = ({ status }: { status: Order['modificationStatus'] }) => {
  if (!status) return null;
  const configs = {
    pending: {
      className: 'text-amber-400 animate-pulse',
      label: 'Mod Pending',
    },
    accepted: {
      className: 'text-emerald-400',
      label: 'Mod Accepted',
    },
    rejected: {
      className: 'text-rose-400',
      label: 'Mod Rejected',
    },
  } as const;
  const c = configs[status];
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide", c.className)}>
      <Bell className="w-3.5 h-3.5" />
      {c.label}
    </div>
  );
};

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
      cell: ({ row }) => (
        <div className="px-2">
          <button
            onClick={row.getToggleExpandedHandler()}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors"
          >
            {row.getIsExpanded() ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
        >
          Received
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const ts = row.getValue('createdAt') as number;
        const date = new Date(ts);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-200">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-slate-500">{date.toLocaleDateString()}</span>
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
          className="flex items-center text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300"
        >
          Target Time
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </button>
      ),
      cell: ({ row, getValue }) => {
        const order = row.original;
        const ts = getValue() as number;
        
        // Add active kitchen delay to formatting, if any
        const effectiveTs = ts + (order.delayMinutes * 60000);
        const date = new Date(effectiveTs);
        
        const isLate = effectiveTs < Date.now() && order.status !== 'ready' && order.status !== 'completed' && order.status !== 'cancelled';

        return (
          <div className="flex flex-col">
            <span className={cn("text-sm font-black", isLate ? "text-rose-400 animate-pulse" : "text-amber-400")}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {order.scheduledFor ? 'Scheduled' : 'ASAP'}
              {order.delayMinutes > 0 && ` (+${order.delayMinutes}m)`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'id',
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</span>,
      cell: ({ row }) => {
        const id = row.getValue('id') as string;
        return <div className="text-xs font-mono text-slate-400">#{id.slice(-6).toUpperCase()}</div>;
      },
    },
    {
      id: 'customer',
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</span>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col min-w-[120px]">
            <span className="text-sm font-medium text-slate-200">{order.customerName || 'Guest'}</span>
            <span className="text-xs text-slate-500">{order.customerPhone || 'No Phone'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        return <div className="font-bold text-amber-400">{formatted}</div>;
      },
    },
    {
      accessorKey: 'fulfillmentMethod',
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Method</span>,
      cell: ({ row }) => <FulfillmentBadge method={row.getValue('fulfillmentMethod')} />,
    },
    {
      accessorKey: 'paymentMethod',
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</span>,
      cell: ({ row }) => <PaymentBadge method={row.getValue('paymentMethod')} />,
    },
    {
      accessorKey: 'status',
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>,
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
      header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-right w-full block">Actions</span>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex justify-end items-center gap-2">
            {/* Review Modification button — shown only when a pending mod exists */}
            {order.modificationStatus === 'pending' && (
              <button
                onClick={() => onReviewModification(order)}
                disabled={loadingOrderId === order.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold transition-all disabled:opacity-60"
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

// ── Legacy export for any legacy import ────────────────────────────────────
// Maintains backwards compatibility; pass no-op handlers
export const columns = buildColumns({ onReviewModification: () => {} });
