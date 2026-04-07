'use client';

import { use, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import Navbar from '@/components/Navbar';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Clock, ChefHat, PackageCheck, ReceiptText, ArrowLeft } from 'lucide-react';
import { Card, Separator, Badge, Skeleton } from '@nummygo/shared/ui';

// Type mapping for order status
type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

const STATUS_STAGES: { status: OrderStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'pending', label: 'Received', icon: <ReceiptText className="w-4 h-4" />, color: 'bg-slate-500' },
  { status: 'accepted', label: 'Accepted', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-indigo-500' },
  { status: 'preparing', label: 'Preparing', icon: <ChefHat className="w-4 h-4" />, color: 'bg-amber-500' },
  { status: 'ready', label: 'Ready for Pickup', icon: <PackageCheck className="w-4 h-4" />, color: 'bg-emerald-500' },
];

export default function TrackingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: sessionData, isLoading, error } = trpc.customer.getCheckoutGroup.useQuery(
    { checkoutSessionId: sessionId },
    { staleTime: 1000 * 60 }
  );

  // Live WebSocket
  const { isConnected } = useWebSocket(sessionId, {
    type: 'session',
    onMessage: (msg: any) => {
      if (msg.type === 'ORDER_UPDATED' || msg.type === 'ORDER_CREATED') {
        queryClient.invalidateQueries({
          queryKey: [['customer', 'getCheckoutGroup'], { input: { checkoutSessionId: sessionId }, type: 'query' }],
        });
      }
    },
  });

  const orders = sessionData || [];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090C10] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Looking up your orders...</p>
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
      
      <main className="flex-1 max-w-3xl items-center mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Header Segment */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 mb-2">
            Live Order Tracking
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
            <span>Tracking ID: <span className="text-slate-300 font-mono">{sessionId.slice(0, 10)}</span></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
              </span>
              {isConnected ? 'Live Sync Active' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="space-y-8">
          {orders.map((order: any) => {
            const currentStageIdx = STATUS_STAGES.findIndex(s => s.status === order.status);
            const isCancelled = order.status === 'cancelled';
            const isCompleted = order.status === 'completed';

            // Special overrides
            let activeStage = currentStageIdx >= 0 ? currentStageIdx : 0;
            if (isCompleted) activeStage = STATUS_STAGES.length;

            return (
              <Card key={order.id} className="bg-[#131920] border-white/10 overflow-hidden shadow-xl rounded-2xl">
                {/* Vendor Header */}
                <div className="p-5 sm:p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-black/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1">
                      {order.tenantId.slice(0, 8) /* Using ID temporarily, backend should join vendor name if possible */} Order
                    </span>
                    <h3 className="text-xl font-bold text-slate-100">Order #{order.id.slice(-6).toUpperCase()}</h3>
                  </div>
                  
                  {isCancelled && (
                    <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Cancelled
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Completed
                    </Badge>
                  )}
                  {!isCancelled && !isCompleted && (
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                      {STATUS_STAGES[activeStage]?.label || 'Pending'}
                    </Badge>
                  )}
                </div>

                {/* Tracking Progress Bar */}
                {!isCancelled && !isCompleted && (
                  <div className="p-5 sm:p-8">
                    <div className="relative">
                      {/* Background Track */}
                      <div className="absolute top-5 left-4 right-4 h-1 rounded-full bg-slate-800" />
                      
                      {/* Progress Line */}
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
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                  ${isCurrent ? `${stage.color} border-[#131920] ring-4 ring-${stage.color.split('-')[1]}-500/30 shadow-[0_0_15px_rgba(var(--color-${stage.color.split('-')[1]}-500),0.5)]` 
                                  : isPast ? 'bg-indigo-500 border-[#131920]' 
                                  : 'bg-slate-800 border-[#131920] text-slate-500'}`}
                              >
                                {isPast ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={isCurrent ? 'text-white' : ''}>{stage.icon}</div>}
                              </div>
                              <span className={`text-[10px] sm:text-xs font-semibold text-center transition-colors duration-500
                                ${isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-600'}`
                              }>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Cancelled State */}
                {isCancelled && (
                  <div className="p-6 text-center text-rose-400 bg-rose-500/5">
                    <p className="font-medium text-sm">This order was cancelled by the vendor.</p>
                    {order.rejectionReason && (
                      <p className="text-xs text-rose-500/70 mt-1">Reason: "{order.rejectionReason}"</p>
                    )}
                  </div>
                )}

                <Separator className="bg-white/5" />
                
                {/* Order Summary */}
                <div className="p-5 sm:p-6 bg-[#0c1015]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Amount</span>
                    <span className="text-lg font-black text-amber-400">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Fulfillment</span>
                    <span className="text-sm font-semibold text-slate-300 capitalize">{order.fulfillmentMethod}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
