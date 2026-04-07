'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@nummygo/shared/models/types';
import { OrderActions } from './OrderActions';
import { ArrowUpDown, ChevronDown, ChevronRight, Package, MapPin, Store, CreditCard, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui';

// Custom renderers for specific badges
export const FulfillmentBadge = ({ method }: { method: 'pickup' | 'delivery' }) => {
  if (method === 'delivery') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold">
        <MapPin className="w-3 h-3" />
        Delivery
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
      <Package className="w-3 h-3" />
      Pickup
    </div>
  );
};

export const PaymentBadge = ({ method }: { method: 'counter' | 'card' }) => {
  if (method === 'card') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
        <CreditCard className="w-3 h-3" />
        Paid Online
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-500/10 text-slate-400 border border-white/10 text-xs font-semibold">
      <Store className="w-3 h-3" />
      Pay at Store
    </div>
  );
};

export const columns: ColumnDef<Order>[] = [
  {
    id: 'expander',
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
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
        >
          Received
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </button>
      );
    },
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
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
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
      const status = row.getValue('status') as string;
      return <StatusBadge status={status} />;
    },
  },
  {
    id: 'actions',
    header: () => <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-right w-full block">Actions</span>,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex justify-end">
          <OrderActions orderId={order.id} status={order.status} />
        </div>
      );
    },
  },
];
