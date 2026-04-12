'use client';

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import type { OrderStatus } from '@nummygo/shared/models/enums';
import { GlassCard, GradientButton, FormField, BrandInput } from '@/components/ui';
import { Loader2, X, Check, XCircle, ArrowRightCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
}

export function OrderActions({ orderId, status }: OrderActionsProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Kitchen Delay Status
  const [delaying, setDelaying] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [delayMessage, setDelayMessage] = useState('');

  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.order.getDashboardOrders.invalidate();
      setRejecting(false);
      setRejectionReason('');
    },
    onError: (err) => {
      alert(`Error updating order: ${err.message}`);
    }
  });

  const delayOrderMutation = trpc.order.delayOrder.useMutation({
    onSuccess: () => {
      utils.order.getDashboardOrders.invalidate();
      setDelaying(false);
      setDelayMessage('');
    },
    onError: (err) => {
      alert(`Error delaying order: ${err.message}`);
    }
  });

  const handleUpdate = (nextStatus: OrderStatus, reason?: string) => {
    updateStatusMutation.mutate({
      orderId,
      status: nextStatus,
      rejectionReason: reason
    });
  };

  const handleDelaySubmit = () => {
    delayOrderMutation.mutate({
      orderId,
      delayMinutes,
      delayMessage: delayMessage.trim() || undefined
    });
  };

  const isPending = updateStatusMutation.isPending || delayOrderMutation.isPending;

  // Render buttons based on current state
  if (status === 'completed' || status === 'cancelled') {
    return null; // Terminal states 
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'accepted' && (
        <>
          <button
            onClick={() => setDelaying(true)}
            className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Delay Order"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRejecting(true)}
            className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Reject Order"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate('preparing')}
            disabled={isPending}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRightCircle className="w-3 h-3" />}
            Prepare
          </button>
        </>
      )}

      {status === 'preparing' && (
        <>
          <button
            onClick={() => setDelaying(true)}
            className="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Delay Order"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleUpdate('ready')}
            disabled={isPending}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Mark Ready
          </button>
        </>
      )}

      {status === 'ready' && (
        <button
          onClick={() => handleUpdate('completed')}
          disabled={isPending}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Complete
        </button>
      )}

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejecting(false)} />
          <GlassCard className="relative w-full max-w-sm p-5 animate-in zoom-in-95 duration-200">
            <button onClick={() => setRejecting(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Reject Order</h3>
            <p className="text-sm text-slate-400 mb-4">Please provide a reason for cancelling this order.</p>

            <FormField id="reject-reason" label="Rejection Reason">
              <BrandInput
                autoFocus
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Out of stock"
              />
            </FormField>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setRejecting(false)}
                className="flex-1 py-2 text-sm font-semibold rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    alert("Reason is required");
                    return;
                  }
                  handleUpdate('cancelled', rejectionReason);
                }}
                disabled={isPending}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
              >
                {isPending ? 'Removing...' : 'Confirm Reject'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delay Modal */}
      {delaying && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDelaying(false)} />
          <GlassCard className="relative w-full max-w-sm p-5 animate-in zoom-in-95 duration-200">
            <button onClick={() => setDelaying(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Delay Order</h3>
            <p className="text-sm text-slate-400 mb-6">Need a little more time? The customer will be instantly notified.</p>

            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                {[10, 15, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDelayMinutes(mins)}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-sm font-semibold transition-all",
                      delayMinutes === mins
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    )}
                  >
                    +{mins} mins
                  </button>
                ))}
              </div>

              <FormField id="delay-msg" label="Custom Message (Optional)">
                <BrandInput
                  value={delayMessage}
                  onChange={(e) => setDelayMessage(e.target.value)}
                  placeholder="e.g. Sorry, we had a rush! Doing our best."
                />
              </FormField>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDelaying(false)}
                className="flex-[0.5] py-2 text-sm font-semibold rounded-lg border border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelaySubmit}
                disabled={isPending}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                {delayOrderMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delay
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
