'use client';

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import type { OrderStatus } from '@nummygo/shared/models/enums';
import { GlassCard, GradientButton, FormField, BrandInput } from '@/components/ui';
import { Loader2, X, Check, XCircle, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
}

export function OrderActions({ orderId, status }: OrderActionsProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const handleUpdate = (nextStatus: OrderStatus, reason?: string) => {
    updateStatusMutation.mutate({
      orderId,
      status: nextStatus,
      rejectionReason: reason
    });
  };

  const isPending = updateStatusMutation.isPending;

  // Render buttons based on current state
  if (status === 'completed' || status === 'cancelled') {
    return null; // Terminal states 
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'pending' && (
        <>
          <button
            onClick={() => setRejecting(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Reject Order"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <GradientButton 
            onClick={() => handleUpdate('accepted')}
            disabled={isPending}
            className="py-1.5 px-3 text-xs"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3 mr-1" />}
            Accept
          </GradientButton>
        </>
      )}

      {status === 'accepted' && (
        <>
          <button
            onClick={() => setRejecting(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Reject Order"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleUpdate('preparing')}
            disabled={isPending}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <ArrowRightCircle className="w-3 h-3" />}
            Prepare
          </button>
        </>
      )}

      {status === 'preparing' && (
        <button 
          onClick={() => handleUpdate('ready')}
          disabled={isPending}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3" />}
          Mark Ready
        </button>
      )}

      {status === 'ready' && (
        <button 
          onClick={() => handleUpdate('completed')}
          disabled={isPending}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3" />}
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
    </div>
  );
}
