'use client';

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { useQueryClient } from '@tanstack/react-query';
import type { Order } from '@nummygo/shared/models/types';
import {
  Bell, X, CheckCheck, AlertCircle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type DiffEntry = {
  menuItemId: string; name: string; price: number; imageUrl: string | null;
  currentQty: number; requestedQty: number; delta: number;
  change: 'added' | 'removed' | 'increased' | 'decreased';
};
type EnrichedItem = { menuItemId: string; name: string; price: number; imageUrl: string | null; quantity: number };

// ── Sub-components ───────────────────────────────────────────────────────────

function ItemThumb({ url, alt }: { url?: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0">
        <span className="text-xl">🍽️</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0" />;
}

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

// ── Main dialog ──────────────────────────────────────────────────────────────

interface ReviewModificationDialogProps {
  order: Order;
  modificationId: string;
  diff: DiffEntry[];
  currentItems: EnrichedItem[];
  requestedItems: EnrichedItem[];
  specialInstruction: string | null;
  onClose: () => void;
}

export function ReviewModificationDialog({
  order,
  modificationId,
  diff,
  currentItems,
  requestedItems,
  specialInstruction,
  onClose,
}: ReviewModificationDialogProps) {
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

        {/* Header */}
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

        {/* Tabs */}
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

        {/* Scrollable body */}
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
                      'flex items-center gap-3 rounded-xl border px-4 py-3',
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
                  <p className="text-sm text-slate-200">&ldquo;{specialInstruction}&rdquo;</p>
                </div>
              )}
            </>
          )}

          {tab === 'after' && (
            <>
              <p className="text-xs text-slate-500 mb-2">
                This is what the order will look like if you <span className="text-emerald-400 font-semibold">accept</span>:
              </p>
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

        {/* Footer */}
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
                : <><AlertCircle className="w-4 h-4" /> Reject & Keep Original</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
