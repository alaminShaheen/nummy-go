'use client';

import React, { useState, useMemo } from 'react';
import { trpc } from '@/trpc/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { buildColumns } from './components/columns';
import { GlassCard, Skeleton } from '@/components/ui';
import {
  ClipboardList,
  LayoutList,
  X,
  CheckCheck,
  AlertCircle,
  Loader2,
  CalendarClock,
  Bell,
} from 'lucide-react';
import type { Order } from '@nummygo/shared/models/types';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// ── Types from backend ─────────────────────────────────────────────────────

type DiffEntry = {
  menuItemId: string; name: string; price: number; imageUrl: string | null;
  currentQty: number; requestedQty: number; delta: number;
  change: 'added' | 'removed' | 'increased' | 'decreased';
};
type EnrichedItem = { menuItemId: string; name: string; price: number; imageUrl: string | null; quantity: number };

// ── Item Image ────────────────────────────────────────────────────────────

function ItemThumb({ url, alt }: { url?: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">🍽️</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0" />
  );
}

// ── Diff Badge ─────────────────────────────────────────────────────────────

function DiffBadge({ change, delta }: { change: DiffEntry['change']; delta: number }) {
  const configs = {
    added:     { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', label: '+ Added' },
    removed:   { cls: 'bg-rose-500/15 text-rose-400 border-rose-500/20',         label: '× Removed' },
    increased: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20',       label: `↑ +${delta}` },
    decreased: { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/20',   label: `↓ ${delta}` },
  };
  const { cls, label } = configs[change];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${cls}`}>
      {label}
    </span>
  );
}

// ── Modification Review Dialog ─────────────────────────────────────────────

function ReviewModificationDialog({
  order,
  modificationId,
  diff,
  currentItems,
  requestedItems,
  specialInstruction,
  onClose,
}: {
  order: Order;
  modificationId: string;
  diff: DiffEntry[];
  currentItems: EnrichedItem[];
  requestedItems: EnrichedItem[];
  specialInstruction: string | null;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const [tab, setTab] = useState<'diff' | 'after'>('diff');
  const queryClient = useQueryClient();

  const reviewMutation = trpc.order.reviewModification.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['order', 'getDashboardOrders']] });
      onClose();
    },
    onError: (err) => alert(`Error: ${err.message}`),
  });

  const newTotal = requestedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleAction = (action: 'accepted' | 'rejected') => {
    reviewMutation.mutate({ modificationId, action, tenantNote: note || undefined });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#111820] border border-amber-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Modification Request</span>
          </div>
          <h3 className="text-lg font-bold text-white">Order #{order.id.slice(-6).toUpperCase()}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{order.customerName} • {order.customerPhone}</p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-white/5 shrink-0">
          {(['diff', 'after'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors',
                tab === t ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {t === 'diff' ? `What's changing (${diff.length})` : 'New order summary'}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

          {tab === 'diff' && (
            <>
              {diff.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No item changes — only the note was updated.</p>
              ) : (
                diff.map((d) => (
                  <div
                    key={d.menuItemId}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all',
                      d.change === 'added'     && 'bg-emerald-500/5 border-emerald-500/20',
                      d.change === 'removed'   && 'bg-rose-500/5 border-rose-500/20',
                      d.change === 'increased' && 'bg-amber-500/5 border-amber-500/15',
                      d.change === 'decreased' && 'bg-orange-500/5 border-orange-500/15',
                    )}
                  >
                    <ItemThumb url={d.imageUrl} alt={d.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{d.name}</p>
                      <p className="text-xs text-slate-500">${d.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <DiffBadge change={d.change} delta={d.delta} />
                      <span className="text-[11px] text-slate-500">
                        {d.change === 'added' ? (
                          <span className="text-emerald-400/70">×{d.requestedQty}</span>
                        ) : d.change === 'removed' ? (
                          <span className="text-rose-400/70 line-through">×{d.currentQty}</span>
                        ) : (
                          <span><span className="text-slate-500">×{d.currentQty}</span> → <span className="text-amber-400">×{d.requestedQty}</span></span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {specialInstruction && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
                  <span className="block text-xs font-bold text-indigo-400 uppercase mb-1">Updated Note from Customer</span>
                  <p className="text-sm text-slate-200">"{specialInstruction}"</p>
                </div>
              )}
            </>
          )}

          {tab === 'after' && (
            <>
              <p className="text-xs text-slate-500 mb-2">This is what the order will look like if you <span className="text-emerald-400 font-semibold">accept</span>:</p>
              {requestedItems.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-4 py-3">
                  <ItemThumb url={item.imageUrl} alt={item.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-400">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                <span className="text-xs text-slate-500 font-bold uppercase">New Total</span>
                <span className="text-lg font-black text-amber-400">${newTotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-4 border-t border-white/5 shrink-0 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Response note for customer <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Accepted — we'll adjust your order!"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('accepted')}
              disabled={reviewMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-sm transition-all disabled:opacity-40"
            >
              {reviewMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><CheckCheck className="w-4 h-4" /> Accept Changes</>
              }
            </button>
            <button
              onClick={() => handleAction('rejected')}
              disabled={reviewMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-sm transition-all disabled:opacity-40"
            >
              {reviewMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><AlertCircle className="w-4 h-4" /> Reject & Keep Original</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function TenantDashboardOrders() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: false }]);

  // orderId whose Review button was clicked — drives the getModificationDetails query
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  // Once the modification is fetched, this holds the full dialog state
  const [reviewingOrder, setReviewingOrder] = useState<{
    order: Order;
    modificationId: string;
    diff: DiffEntry[];
    currentItems: EnrichedItem[];
    requestedItems: EnrichedItem[];
    specialInstruction: string | null;
  } | null>(null);
  const [loadingModOrderId, setLoadingModOrderId] = useState<string | null>(null);

  const { data: tenant, isPending: isTenantPending } = trpc.tenant.me.useQuery(undefined, { staleTime: Infinity });

  const { data: orders, isPending: isOrdersPending } = trpc.order.getDashboardOrders.useQuery(
    { tenantId: tenant?.id as string },
    { enabled: !!tenant?.id }
  );

  const { isConnected } = useWebSocket(
    tenant?.id || null,
    {
      onMessage: (message: any) => {
        if (!tenant?.id) return;
        const events = ['ORDER_CREATED', 'ORDER_STATUS_UPDATED', 'ORDER_UPDATED', 'MODIFICATION_REQUESTED', 'MODIFICATION_REVIEWED'];
        if (events.includes(message.type)) {
          queryClient.invalidateQueries({
            queryKey: [
              ['order', 'getDashboardOrders'],
              { input: { tenantId: tenant.id }, type: 'query' },
            ],
          });
        }
      }
    }
  );

  const groupedOrders = useMemo(() => {
    if (!orders) return [];
    const statusWeight: Record<string, number> = {
      pending: 1,
      accepted: 2,
      preparing: 3,
      ready: 4,
      completed: 5,
      cancelled: 6,
    };
    return [...orders].sort((a, b) => {
      // Orders with pending modifications bubble to the very top
      const aHasMod = a.modificationStatus === 'pending' ? -1 : 0;
      const bHasMod = b.modificationStatus === 'pending' ? -1 : 0;
      if (aHasMod !== bHasMod) return aHasMod - bHasMod;

      const weightA = statusWeight[a.status] || 99;
      const weightB = statusWeight[b.status] || 99;
      if (weightA === weightB) return b.createdAt - a.createdAt;
      return weightA - weightB;
    });
  }, [orders]);

  const pendingModCount = groupedOrders.filter(o => o.modificationStatus === 'pending').length;

  // Fetch enriched modification data when a Review button is clicked
  const pendingModOrder = groupedOrders.find(o => o.id === reviewingOrderId);
  const { data: pendingModData } = trpc.order.getModificationDetails.useQuery(
    { orderId: reviewingOrderId! },
    { enabled: !!reviewingOrderId, staleTime: 0 }
  );

  // Open dialog once the modification data arrives
  const prevPendingModData = React.useRef<typeof pendingModData>(undefined);
  if (pendingModData && pendingModOrder && reviewingOrderId && pendingModData !== prevPendingModData.current) {
    prevPendingModData.current = pendingModData;
    setLoadingModOrderId(null);
    setReviewingOrder({
      order: pendingModOrder,
      modificationId: pendingModData.modificationId,
      diff:           pendingModData.diff,
      currentItems:   pendingModData.currentItems,
      requestedItems: pendingModData.requestedItems,
      specialInstruction: pendingModData.specialInstruction,
    });
    setReviewingOrderId(null);
  }

  const columns = useMemo(() => buildColumns({
    onReviewModification: (order) => {
      setReviewingOrderId(order.id);
      setLoadingModOrderId(order.id);
    },
    loadingOrderId: loadingModOrderId,
  }), [loadingModOrderId]);

  const table = useReactTable({
    data: groupedOrders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
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
        <div className="flex items-center gap-3">
          {pendingModCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 animate-pulse">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">
                {pendingModCount} modification{pendingModCount > 1 ? 's' : ''} pending
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-full px-4 py-2">
            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", isConnected ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse" : "bg-rose-500 shadow-rose-500/50")} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING...'}
            </span>
          </div>
        </div>
      </div>

      <GlassCard className="border border-indigo-500/10 overflow-hidden">
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
                      No orders found.
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className={cn(
                      "hover:bg-white/[0.02] transition-colors group",
                      row.original.modificationStatus === 'pending' && "bg-amber-500/5 border-l-2 border-l-amber-500/50",
                      row.getIsExpanded() ? "bg-white/[0.02]" : ""
                    )}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-4 whitespace-nowrap align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={columns.length} className="bg-black/30 border-b border-white/5 p-0">
                          <div className="px-6 py-5 animate-in slide-in-from-top-2 duration-300 border-l-[3px] border-indigo-500/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Order Items */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Order Items</h4>
                                <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-500 italic">
                                  Detail line items will be displayed here (TODO: join order items in query).
                                </div>
                              </div>

                              {/* Order Details */}
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 ml-1">Order Details</h4>
                                <div className="p-4 rounded-lg bg-black/40 border border-white/5 text-sm space-y-4">
                                  {row.original.scheduledFor && (
                                    <div>
                                      <span className="block text-xs font-semibold text-amber-500 uppercase mb-1">Scheduled For</span>
                                      <div className="flex items-center gap-1.5 text-amber-300">
                                        <CalendarClock className="w-4 h-4" />
                                        {format(new Date(row.original.scheduledFor), 'MMM d, yyyy — h:mm a')}
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">Special Instructions</span>
                                    {row.original.specialInstruction ? (
                                      <p className="text-slate-200 bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                                        "{row.original.specialInstruction}"
                                      </p>
                                    ) : (
                                      <p className="text-slate-600 italic">No special instructions provided.</p>
                                    )}
                                  </div>
                                  {row.original.rejectionReason && (
                                    <div>
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

      {/* Modification Review Dialog */}
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
