'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/trpc/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { columns } from './components/columns';
import { GlassCard, Skeleton } from '@/components/ui';
import { ClipboardList, LayoutList } from 'lucide-react';
import type { Order } from '@nummygo/shared/models/types';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function TenantDashboardOrders() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: false }]); // Oldest to newest initially, but we group below

  // 1. Fetch current tenant profile to get tenantId
  const { data: tenant, isPending: isTenantPending } = trpc.tenant.me.useQuery();

  // 2. Fetch orders using the tenantId
  const { data: orders, isPending: isOrdersPending } = trpc.tenant.getDashboardOrders.useQuery(
    { tenantId: tenant?.id as string },
    { enabled: !!tenant?.id }
  );

  // 3. Connect to WebSocket for live updates
  const { isConnected } = useWebSocket(
    tenant?.id || null, 
    {
      onMessage: (message: any) => {
      if (!tenant?.id) return;
      if (message.type === 'ORDER_CREATED' || message.type === 'ORDER_STATUS_UPDATED') {
        // Invalidate the orders query to refetch fresh data
        // For absolute perfection, we could manually update the React Query cache via setQueryData,
        // but invalidating is safer to guarantee we capture all associated line items & fields accurately.
        // We use trpc.useUtils() or purely queryClient.
        queryClient.invalidateQueries({
          queryKey: [
            ['tenant', 'getDashboardOrders'],
            { input: { tenantId: tenant.id }, type: 'query' },
          ],
        });
      }
      }
    }
  );

  // 4. Group & Sort Logic (Requested by user: group by active status)
  const groupedOrders = useMemo(() => {
    if (!orders) return [];
    
    // Custom sort order logic
    const statusWeight: Record<string, number> = {
      pending: 1,
      accepted: 2,
      preparing: 3,
      ready: 4,
      completed: 5,
      cancelled: 6,
    };

    return [...orders].sort((a, b) => {
      const weightA = statusWeight[a.status] || 99;
      const weightB = statusWeight[b.status] || 99;
      
      // Secondary sort: by created at descending if status is same
      if (weightA === weightB) {
        return b.createdAt - a.createdAt;
      }
      return weightA - weightB;
    });
  }, [orders]);

  // 5. TanStack Table Setup
  const table = useReactTable({
    data: groupedOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true, // All rows can expand
  });

  if (isTenantPending || (isOrdersPending && !orders)) {
    return (
      <div className="p-6 lg:p-10 space-y-6">
        <Skeleton className="h-10 w-64 rounded-md" />
        <GlassCard className="h-[500px] border-white/5 opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10 space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-amber-500" />
            LIVE ORDERS
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            Manage incoming orders in real-time. Changes instantly sync to the kitchen and the customer's tracking page.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-full px-4 py-2">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", isConnected ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse" : "bg-rose-500 shadow-rose-500/50")} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {isConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING...'}
          </span>
        </div>
      </div>

      <GlassCard className="border border-indigo-500/10 overflow-hidden">
        {/* Table wrapper for horizontal scroll on mobile */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-black/40 border-b border-white/5">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-4 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                      <LayoutList className="w-8 h-8 opacity-50" />
                      No orders found matching your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className={cn(
                      "hover:bg-white/[0.02] transition-colors group",
                      row.getIsExpanded() ? "bg-white/[0.02]" : ""
                    )}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-4 whitespace-nowrap align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Expanded Row Detail View */}
                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={columns.length} className="bg-black/30 border-b border-white/5 p-0">
                          <div className="px-6 py-5 animate-in slide-in-from-top-2 duration-300 border-l-[3px] border-indigo-500/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Order Items */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Order Items</h4>
                                <div className="space-y-2">
                                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm text-slate-300">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-slate-500 font-semibold uppercase">Total items</span>
                                      <span className="text-amber-400 font-black">Loaded via detail query (TODO)</span>
                                    </div>
                                    <div className="space-y-1.5 divide-y divide-white/5 text-slate-500 italic text-xs">
                                      Detail line items and modifiers will be displayed here when the order is expanded.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Special Instructions & Details */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Order Details</h4>
                                <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm">
                                  <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">Special Instructions</span>
                                  {row.original.specialInstruction ? (
                                    <p className="text-slate-200 bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                                      "{row.original.specialInstruction}"
                                    </p>
                                  ) : (
                                    <p className="text-slate-600 italic">No special instructions provided.</p>
                                  )}
                                  
                                  {row.original.rejectionReason && (
                                    <div className="mt-4">
                                      <span className="block text-xs font-semibold text-rose-500/80 uppercase mb-1">Rejection Reason</span>
                                      <p className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-md">
                                        {row.original.rejectionReason}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
