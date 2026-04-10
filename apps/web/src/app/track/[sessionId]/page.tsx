'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import Navbar from '@/components/Navbar';
import { useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  ReceiptText,
  ArrowLeft,
  Pencil,
  CalendarClock,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';
import { Card, Separator, Badge } from '@nummygo/shared/ui';
import { differenceInSeconds, format } from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type ModStatus = 'pending' | 'accepted' | 'rejected' | null;

const STATUS_STAGES: { status: OrderStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'pending', label: 'Received', icon: <ReceiptText className="w-4 h-4" />, color: 'bg-slate-500' },
  { status: 'accepted', label: 'Accepted', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-indigo-500' },
  { status: 'preparing', label: 'Preparing', icon: <ChefHat className="w-4 h-4" />, color: 'bg-amber-500' },
  { status: 'ready', label: 'Ready for Pickup', icon: <PackageCheck className="w-4 h-4" />, color: 'bg-emerald-500' },
];

// ── Modification Status Banner ─────────────────────────────────────────────

function ModificationBanner({ status, note }: { status: ModStatus; note?: string | null }) {
  if (!status) return null;
  const configs = {
    pending: { bg: 'bg-amber-500/10 border-amber-500/30', icon: <Clock className="w-4 h-4 text-amber-400 shrink-0" />, label: 'Modification pending vendor review…', text: 'text-amber-300' },
    accepted: { bg: 'bg-emerald-500/10 border-emerald-500/30', icon: <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />, label: 'Order modification accepted!', text: 'text-emerald-300' },
    rejected: { bg: 'bg-rose-500/10 border-rose-500/30', icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />, label: 'Modification request rejected.', text: 'text-rose-300' },
  } as const;
  const c = configs[status];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${c.bg} animate-in fade-in duration-300`}>
      {c.icon}
      <div>
        <p className={`text-sm font-semibold ${c.text}`}>{c.label}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">Partner note: "{note}"</p>}
      </div>
    </div>
  );
}

// ── Countdown hook ─────────────────────────────────────────────────────────

function useCountdown(createdAt: number, thresholdMinutes: number) {
  const deadlineMs = createdAt + thresholdMinutes * 60 * 1000;
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, differenceInSeconds(deadlineMs, Date.now())));
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(Math.max(0, differenceInSeconds(deadlineMs, Date.now()))), 1000);
    return () => clearInterval(id);
  }, [deadlineMs, secondsLeft]);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return { secondsLeft, label, expired: secondsLeft <= 0 };
}

// ── Modify Order Countdown ─────────────────────────────────────────────────

/**
 * Shows the modification countdown timer and a "Modify Order" button.
 * On click, lazily fetches the tenant slug then navigates to:
 * /[tenantSlug]?modify=ORDER_ID&session=SESSION_ID
 */
function ModifyOrderCountdown({
  order,
  sessionId,
  canModify,
  thresholdMinutes
}: {
  order: any;
  sessionId: string;
  canModify: boolean;
  thresholdMinutes: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { label, expired } = useCountdown(order.createdAt, thresholdMinutes);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: details, isFetching } = trpc.order.getOrderDetails.useQuery(
    { orderId: order.id },
    { enabled: shouldFetch, staleTime: Infinity }
  );

  const cancelOrder = trpc.order.customerCancel.useMutation({
    onSuccess: () => {
      setShowCancelModal(false);
      // We do not strictly need to invalidate because WebSocket will blast an ORDER_UPDATED but it's good safety
      queryClient.invalidateQueries({
        queryKey: [['order', 'getCheckoutGroup']],
      });
    }
  });

  // Navigate as soon as data arrives
  useEffect(() => {
    if (details && shouldFetch) {
      setShouldFetch(false);
      router.push(`/${details.tenantSlug}?modify=${order.id}&session=${sessionId}`);
    }
  }, [details, shouldFetch, order.id, sessionId, router]);

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-slate-600 text-xs border border-white/5 rounded-lg px-3 py-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Modification window closed</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2 flex-1">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit limit: <span className="font-mono font-bold text-indigo-300">{label}</span></span>
        </div>

        {canModify && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelOrder.isPending || isFetching}
            className="flex items-center justify-center min-w-[70px] gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          onClick={() => canModify && setShouldFetch(true)}
          disabled={!canModify || isFetching || cancelOrder.isPending}
          className={`flex items-center justify-center min-w-[90px] gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all
            ${canModify
              ? 'bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500/30'
              : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
            }`}
        >
          {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
          {canModify ? (isFetching ? 'Loading…' : 'Modify') : 'Review Pending'}
        </button>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#11161d] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Cancel Order?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to cancel your order? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-[0.8] px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                disabled={cancelOrder.isPending}
              >
                Go Back
              </button>
              <button
                onClick={() => cancelOrder.mutate({ orderId: order.id })}
                disabled={cancelOrder.isPending}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Cancel
              </button>
            </div>
            {cancelOrder.isError && (
              <p className="text-xs text-rose-400 mt-4 text-center">
                {cancelOrder.error?.message || "Cancellation failed. Please refresh."}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Tracking Page ─────────────────────────────────────────────────────

export default function TrackingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [modNotes, setModNotes] = useState<Record<string, string | null | undefined>>({});

  const { data: sessionData, isLoading, error } = trpc.order.getCheckoutGroup.useQuery(
    { checkoutSessionId: sessionId },
    { staleTime: 1000 * 60 }
  );

  const { isConnected } = useWebSocket(sessionId, {
    type: 'session',
    onMessage: (msg: any) => {
      if (['ORDER_UPDATED', 'ORDER_CREATED', 'MODIFICATION_REQUESTED', 'MODIFICATION_REVIEWED'].includes(msg.type)) {
        queryClient.invalidateQueries({
          queryKey: [['order', 'getCheckoutGroup'], { input: { checkoutSessionId: sessionId }, type: 'query' }],
        });
        if (msg.type === 'MODIFICATION_REVIEWED' && msg.modification) {
          setModNotes(prev => ({ ...prev, [msg.order.id]: msg.modification.tenantNote }));
        }
      }
    },
  });

  const orders = sessionData?.orders || [];
  const tenantThreshold = sessionData?.tenantModificationThreshold ?? 30;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Looking up your orders…</p>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#090C10] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full mb-4 border border-rose-500/20">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Tracking Not Found</h1>
        <p className="text-slate-400 mb-6 max-w-sm">We couldn't find active orders for this tracking ID. It may have expired.</p>
        <button onClick={() => router.push('/')} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C10] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 mb-2">
            Live Order Tracking
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
            <span>Tracking ID: <span className="text-slate-300 font-mono">{sessionId.slice(0, 10)}</span></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              </span>
              {isConnected ? 'Live Sync Active' : 'Connecting…'}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-8">
          {orders.map((order: any) => {
            const currentStageIdx = STATUS_STAGES.findIndex(s => s.status === order.status);
            const isCancelled = order.status === 'cancelled';
            const isCompleted = order.status === 'completed';
            let activeStage = currentStageIdx >= 0 ? currentStageIdx : 0;
            if (isCompleted) activeStage = STATUS_STAGES.length;

            const canModify = !['completed', 'cancelled', 'ready'].includes(order.status)
              && order.modificationStatus !== 'pending';

            return (
              <Card key={order.id} className="bg-[#131920] border-white/10 overflow-hidden shadow-xl rounded-2xl">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-black/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </span>
                    {order.scheduledFor && (
                      <span className="flex items-center gap-1 text-xs text-amber-400/80 mt-0.5">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Scheduled: {format(new Date(order.scheduledFor), 'MMM d, h:mm a')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCancelled && <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border border-rose-500/30">Cancelled</Badge>}
                    {isCompleted && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Completed</Badge>}
                    {!isCancelled && !isCompleted && (
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                        {STATUS_STAGES[activeStage]?.label || 'Pending'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Modification status banner */}
                {order.modificationStatus && (
                  <div className="px-5 pt-4">
                    <ModificationBanner status={order.modificationStatus as ModStatus} note={modNotes[order.id]} />
                  </div>
                )}

                {/* Progress stepper */}
                {!isCancelled && !isCompleted && (
                  <div className="p-5 sm:p-8">
                    <div className="relative">
                      <div className="absolute top-5 left-4 right-4 h-1 rounded-full bg-slate-800" />
                      <div
                        className="absolute top-5 left-4 h-1 rounded-full bg-indigo-500 transition-all duration-700 ease-in-out"
                        style={{ width: `calc(${(activeStage / (STATUS_STAGES.length - 1)) * 100}% - 32px)` }}
                      />
                      <div className="relative flex justify-between">
                        {STATUS_STAGES.map((stage, idx) => {
                          const isPast = idx < activeStage;
                          const isCurrent = idx === activeStage;
                          return (
                            <div key={stage.status} className="flex flex-col items-center gap-3 z-10 w-20">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isCurrent ? `${stage.color} border-[#131920] ring-4 ring-offset-0`
                                  : isPast ? 'bg-indigo-500 border-[#131920]'
                                    : 'bg-slate-800 border-[#131920] text-slate-500'}`}
                              >
                                {isPast ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={isCurrent ? 'text-white' : ''}>{stage.icon}</div>}
                              </div>
                              <span className={`text-[10px] sm:text-xs font-semibold text-center transition-colors duration-500
                                ${isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-600'}`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {isCancelled && (
                  <div className="p-6 text-center text-rose-400 bg-rose-500/5">
                    <p className="font-medium text-sm">This order was cancelled by the vendor.</p>
                    {order.rejectionReason && <p className="text-xs text-rose-500/70 mt-1">Reason: "{order.rejectionReason}"</p>}
                  </div>
                )}

                <Separator className="bg-white/5" />

                {/* Footer */}
                <div className="p-5 sm:p-6 bg-[#0c1015]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Amount</span>
                    <span className="text-lg font-black text-amber-400">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-slate-500 uppercase">Fulfillment</span>
                    <span className="text-sm font-semibold text-slate-300 capitalize">{order.fulfillmentMethod}</span>
                  </div>

                  {!isCancelled && !isCompleted && (
                    <ModifyOrderCountdown
                      order={order}
                      sessionId={sessionId}
                      canModify={canModify}
                      thresholdMinutes={tenantThreshold}
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
