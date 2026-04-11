'use client';

import { use, useEffect, useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import Navbar from '@/components/Navbar';
import { useQueryClient } from '@tanstack/react-query';
import { formatPhoneNumber } from '@nummygo/shared/lib/formatters';
import {
  Loader2, CheckCircle2, Clock, ChefHat, PackageCheck, ArrowLeft,
  Pencil, CalendarClock, AlertCircle, CheckCheck, X, Phone,
  MapPin, Store, WifiOff, RefreshCw, ShoppingBag, ReceiptText,
} from 'lucide-react';
import { differenceInSeconds, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getGoogleMapsUrl } from '@/utils/tenant';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type ModStatus = 'pending' | 'accepted' | 'rejected' | null;

interface VendorInfo {
  name: string;
  slug: string;
  phoneNumber: string;
  logoUrl: string | null;
  address: string | null;
  modificationThreshold: number;
}

// ── Animated SVG Icons ─────────────────────────────────────────────────────

function AnimatedWokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 52" fill="none" aria-hidden="true" className={className}>
      <style>{`
        .wok-flame-1 { animation: wokFlicker 0.35s 0s ease-in-out infinite alternate; transform-origin: 26px 40px; }
        .wok-flame-2 { animation: wokFlicker 0.3s 0.1s ease-in-out infinite alternate; transform-origin: 26px 38px; }
        .wok-steam   { animation: wokSteam 1.8s ease-in-out infinite; }
        .wok-food    { animation: wokBubble 1.2s ease-in-out infinite alternate; }
        @keyframes wokFlicker {
          0%   { transform: scaleY(1) scaleX(0.95); }
          100% { transform: scaleY(1.25) scaleX(1.08); }
        }
        @keyframes wokSteam {
          0%   { opacity:0; transform: translateY(0) scaleX(1); }
          40%  { opacity: 0.5; }
          100% { opacity:0; transform: translateY(-12px) scaleX(1.6); }
        }
        @keyframes wokBubble {
          0%   { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
      `}</style>
      {/* Flames */}
      <ellipse className="wok-flame-1" cx="26" cy="42" rx="7" ry="5" fill="#ea580c" opacity="0.9" />
      <ellipse className="wok-flame-2" cx="26" cy="40" rx="4" ry="3.5" fill="#fbbf24" opacity="0.95" />

      {/* Wok body */}
      <path d="M10 28 Q10 40 26 40 Q42 40 42 28" fill="#1e293b" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 26 Q8 16 26 16 Q44 16 44 26" fill="#334155" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="26" cy="26" rx="18" ry="10" fill="#1e293b" stroke="currentColor" strokeWidth="1.5" />

      {/* Food */}
      <g className="wok-food">
        <circle cx="21" cy="24" r="2.5" fill="#f97316" opacity="0.9" />
        <circle cx="27" cy="22" r="2" fill="#84cc16" opacity="0.85" />
        <circle cx="31" cy="25" r="2.5" fill="#f59e0b" opacity="0.9" />
        <circle cx="24" cy="27" r="1.5" fill="#ef4444" opacity="0.8" />
      </g>

      {/* Handle */}
      <path d="M42 24 L50 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 24 L4 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Steam */}
      <path className="wok-steam" d="M22 16 Q21 10 22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path className="wok-steam" d="M30 14 Q29 8 30 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ animationDelay: '0.6s' }} />
    </svg>
  );
}

const STATUS_STAGES: { status: OrderStatus; label: string; icon: React.ReactNode; color: string; mobileLabel: string }[] = [
  { status: 'accepted', label: 'Confirmed', mobileLabel: 'Confirmed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'indigo' },
  { status: 'preparing', label: 'Preparing', mobileLabel: 'Preparing', icon: <AnimatedWokIcon className="w-5 h-5 -mt-1" />, color: 'amber' },
  { status: 'ready', label: 'Ready for Pickup', mobileLabel: 'Ready', icon: <PackageCheck className="w-4 h-4" />, color: 'emerald' },
];

// ── SVG Orbital Ring ───────────────────────────────────────────────────────

function OrbitalRing({
  progress,
  statusLabel,
  statusIcon,
  accentColor,
  size = 180,
}: {
  progress: number; // 0-1
  statusLabel: string;
  statusIcon: React.ReactNode;
  accentColor: string;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const rawId = useId();
  const gradientId = `orbital-grad-${rawId.replace(/:/g, '')}`;

  const colorMap: Record<string, { from: string; to: string; glow: string }> = {
    indigo: { from: '#818cf8', to: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
    amber: { from: '#fbbf24', to: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    emerald: { from: '#34d399', to: '#10b981', glow: 'rgba(16,185,129,0.3)' },
    rose: { from: '#fb7185', to: '#f43f5e', glow: 'rgba(244,63,94,0.3)' },
  };
  const colors = colorMap[accentColor] || colorMap.amber!;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)` }}
      />
      
      {/* Ember Particles for Preparing Stage */}
      {accentColor === 'amber' && (
         <div className="absolute inset-0 -z-10 rounded-full overflow-hidden" aria-hidden="true">
           <style>{`
             .orbital-ember { animation: orbitalRise 3s ease-out infinite; }
             @keyframes orbitalRise {
               0% { opacity: 0; transform: translateY(20px) scale(0.5); }
               20% { opacity: 0.8; }
               100% { opacity: 0; transform: translateY(-40px) scale(1.5); }
             }
           `}</style>
           {[...Array(5)].map((_, i) => (
             <div
               key={i}
               className="orbital-ember absolute rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"
               style={{
                 width: (i % 2 === 0 ? 3 : 5) + 'px',
                 height: (i % 2 === 0 ? 3 : 5) + 'px',
                 left: 30 + (i * 10) + '%',
                 bottom: '20%',
                 animationDelay: `${i * 0.4}s`,
               }}
             />
           ))}
         </div>
      )}

      <svg width={size} height={size} className="relative -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <div className={cn("mb-1 text-white")} style={{ color: colors.from }}>
          {statusIcon}
        </div>
        <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

// ── Vertical Timeline ──────────────────────────────────────────────────────

function VerticalTimeline({ activeStage, isCompleted, isCancelled }: { activeStage: number; isCompleted: boolean; isCancelled: boolean }) {
  return (
    <div className="flex flex-col gap-0 mt-4 sm:mt-6">
      {STATUS_STAGES.map((stage, idx) => {
        const isPast = idx < activeStage || isCompleted;
        const isCurrent = idx === activeStage && !isCompleted && !isCancelled;

        return (
          <div key={stage.status} className="flex items-start gap-3">
            {/* Node + connector */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                isCurrent && `border-${stage.color}-500 bg-${stage.color}-500/20 text-${stage.color}-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]`,
                isPast && "border-indigo-500 bg-indigo-500/20 text-indigo-400",
                !isPast && !isCurrent && "border-white/10 bg-white/[0.03] text-slate-600",
              )}
                style={isCurrent ? {
                  borderColor: stage.color === 'amber' ? '#f59e0b' : stage.color === 'emerald' ? '#10b981' : '#6366f1',
                  backgroundColor: stage.color === 'amber' ? 'rgba(245,158,11,0.15)' : stage.color === 'emerald' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                  color: stage.color === 'amber' ? '#fbbf24' : stage.color === 'emerald' ? '#34d399' : '#818cf8',
                  boxShadow: `0 0 15px ${stage.color === 'amber' ? 'rgba(245,158,11,0.25)' : stage.color === 'emerald' ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`,
                } : isPast ? {
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                } : {}}
              >
                {isPast ? <CheckCircle2 className="w-4 h-4" /> : stage.icon}
              </div>
              {idx < STATUS_STAGES.length - 1 && (
                <div className={cn(
                  "w-px h-8 transition-all duration-500",
                  isPast ? "bg-indigo-500/40" : "bg-white/5",
                )} />
              )}
            </div>

            {/* Label */}
            <div className="pt-1.5">
              <span className={cn(
                "text-xs sm:text-sm font-semibold transition-colors duration-300",
                isCurrent ? "text-white" : isPast ? "text-slate-300" : "text-slate-600",
              )}>
                {stage.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Modification Status Banner ─────────────────────────────────────────────

function ModificationBanner({ status, note }: { status: ModStatus; note?: string | null }) {
  if (!status) return null;
  const configs = {
    pending: { bg: 'border-amber-500/30 bg-amber-500/10', icon: <Clock className="w-4 h-4 text-amber-400 shrink-0" />, label: 'Waiting for the kitchen to review your changes...', text: 'text-amber-300' },
    accepted: { bg: 'border-emerald-500/30 bg-emerald-500/10', icon: <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />, label: 'Great news! Your changes were approved.', text: 'text-emerald-300' },
    rejected: { bg: 'border-rose-500/30 bg-rose-500/10', icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />, label: "The kitchen couldn't accommodate your changes.", text: 'text-rose-300' },
  } as const;
  const c = configs[status];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${c.bg} animate-in fade-in duration-300`}>
      {c.icon}
      <div>
        <p className={`text-sm font-semibold ${c.text}`}>{c.label}</p>
        {note && <p className="text-xs text-slate-400 mt-0.5">Message from kitchen: &quot;{note}&quot;</p>}
      </div>
    </div>
  );
}

// ── Countdown Hook ─────────────────────────────────────────────────────────

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

// ── Modify / Cancel Action Bar ─────────────────────────────────────────────

function OrderActionBar({
  order,
  sessionId,
  vendorSlug,
  canModify,
  thresholdMinutes,
}: {
  order: any;
  sessionId: string;
  vendorSlug: string;
  canModify: boolean;
  thresholdMinutes: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { label, expired } = useCountdown(order.createdAt, thresholdMinutes);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const cancelOrder = trpc.order.customerCancel.useMutation({
    onSuccess: () => {
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: [['order', 'getCheckoutGroup']] });
    },
  });

  const handleModify = () => {
    if (canModify && vendorSlug) {
      router.push(`/${vendorSlug}?modify=${order.id}&session=${sessionId}`);
    }
  };

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-slate-600 text-xs border border-white/5 rounded-lg px-3 py-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Too late to make changes</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Timer */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2 flex-1 sm:flex-none">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit: <span className="font-mono font-bold text-indigo-300">{label}</span></span>
        </div>

        {/* Cancel */}
        {canModify && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelOrder.isPending}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50 transition-all"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        )}

        {/* Modify */}
        <button
          onClick={handleModify}
          disabled={!canModify}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all",
            canModify
              ? "bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500/30"
              : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
          )}
        >
          <Pencil className="w-3 h-3" />
          {canModify ? 'Modify' : 'Pending'}
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#11161d] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Change of plans?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to cancel this order? The restaurant will be notified immediately and this action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-[0.8] px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors" disabled={cancelOrder.isPending}>
                Go Back
              </button>
              <button onClick={() => cancelOrder.mutate({ orderId: order.id })} disabled={cancelOrder.isPending} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {cancelOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Cancel
              </button>
            </div>
            {cancelOrder.isError && (
              <p className="text-xs text-rose-400 mt-4 text-center">
                {cancelOrder.error?.message || 'Cancellation failed.'}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── WebSocket Health Banner ────────────────────────────────────────────────

function ConnectionBanner({ isConnected }: { isConnected: boolean }) {
  const [showBanner, setShowBanner] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setWasConnected(true);
      // Brief "reconnected" flash then hide
      if (showBanner) {
        const t = setTimeout(() => setShowBanner(false), 3000);
        return () => clearTimeout(t);
      }
    } else if (wasConnected) {
      // Was connected but lost connection — show warning after a brief delay
      const t = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  if (!showBanner && isConnected) return null;
  if (!showBanner) return null;

  return (
    <div className={cn(
      "fixed top-16 inset-x-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold animate-in slide-in-from-top duration-300",
      isConnected
        ? "bg-emerald-900/80 text-emerald-300 border-b border-emerald-500/20"
        : "bg-rose-900/80 text-rose-300 border-b border-rose-500/20"
    )}>
      {isConnected ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          You&apos;re back online — tracking updated
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          Waiting for connection…
          <RefreshCw className="w-3 h-3 animate-spin ml-1" />
        </>
      )}
    </div>
  );
}

// ── Live Indicator Pill ────────────────────────────────────────────────────

function LiveIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
      isConnected
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
        : "border-rose-500/30 bg-rose-500/10 text-rose-400"
    )}>
      <span className="relative flex h-2 w-2">
        {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", isConnected ? "bg-emerald-500" : "bg-rose-500")} />
      </span>
      {isConnected ? 'Live with kitchen' : 'Reconnecting to kitchen'}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TrackingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [modNotes, setModNotes] = useState<Record<string, string | null | undefined>>({});

  const { data: sessionData, isLoading, error } = trpc.order.getCheckoutGroup.useQuery(
    { checkoutSessionId: sessionId },
    { staleTime: 1000 * 60 },
  );

  const { isConnected } = useWebSocket(sessionId, {
    type: 'session',
    onMessage: (msg: any) => {
      if (['ORDER_UPDATED', 'ORDER_CREATED', 'MODIFICATION_REQUESTED', 'MODIFICATION_REVIEWED'].includes(msg.type)) {
        queryClient.invalidateQueries({
          queryKey: [['order', 'getCheckoutGroup'], { input: { checkoutSessionId: sessionId }, type: 'query' }],
        });
        if (msg.type === 'MODIFICATION_REVIEWED' && msg.modification) {
          setModNotes((prev) => ({ ...prev, [msg.order.id]: msg.modification.tenantNote }));
        }
      }
    },
  });

  const orders = sessionData?.orders || [];
  const vendorInfo: Record<string, VendorInfo> = (sessionData as any)?.vendorInfo || {};

  // ── Dynamic Headline ──
  const mainOrder = orders[0];
  let headingNode = <><span className="gradient-text">Live</span> Tracking</>;

  if (mainOrder) {
    const customerFirstName = mainOrder.customerName ? mainOrder.customerName.split(' ')[0] : '';
    const vendorName = vendorInfo[mainOrder.tenantId]?.name || 'The kitchen';
    const nameStr = customerFirstName ? `, ${customerFirstName}` : '';

    if (mainOrder.status === 'completed') {
      headingNode = <>Enjoy your meal<span className="gradient-text">{nameStr}!</span></>;
    } else if (mainOrder.status === 'cancelled') {
      headingNode = <><span className="text-rose-400">Order</span> Cancelled</>;
    } else if (mainOrder.status === 'ready') {
      headingNode = <>Your order is <span className="text-emerald-400">ready</span>{nameStr}!</>;
    } else {
      headingNode = <><span className="gradient-text">{vendorName}</span> is preparing your order{nameStr}</>;
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        {/* Fixed Background */}
        <div className="fixed inset-0 bg-[#0D1117] -z-10 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{ width: 700, height: 700, top: '-18%', left: '-12%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.6 }} aria-hidden="true" />
          <div className="absolute rounded-full" style={{ width: 650, height: 650, bottom: '-20%', right: '-14%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.5 }} aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '50px 50px' }} aria-hidden="true" />
        </div>

        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm">Looking up your orders…</p>
      </div>
    );
  }

  // ── Error / Empty ──
  if (error || orders.length === 0) {
    return (
      <>
        {/* Fixed Background */}
        <div className="fixed inset-0 bg-[#0D1117] -z-10 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{ width: 700, height: 700, top: '-18%', left: '-12%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.6 }} aria-hidden="true" />
          <div className="absolute rounded-full" style={{ width: 650, height: 650, bottom: '-20%', right: '-14%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.5 }} aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '50px 50px' }} aria-hidden="true" />
        </div>

        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full mb-4 border border-rose-500/20">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Hmm, we couldn&apos;t find this order</h1>
          <p className="text-slate-400 mb-6 max-w-sm">This tracking link might have expired or the order no longer exists.</p>
          <button onClick={() => router.push('/')} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-[#0D1117] -z-10 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 700, height: 700, top: '-18%', left: '-12%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.6 }} aria-hidden="true" />
        <div className="absolute rounded-full" style={{ width: 650, height: 650, bottom: '-20%', right: '-14%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.5 }} aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '50px 50px' }} aria-hidden="true" />
      </div>

      <Navbar />
      <ConnectionBanner isConnected={isConnected} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-10 pt-20 sm:pt-24">
        {/* ── Header ── */}
        <div className="mb-6 sm:mb-10 lg:mb-12">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight max-w-2xl">
              {headingNode}
            </h1>
            <div className="shrink-0 pt-1 sm:pt-2">
              <LiveIndicator isConnected={isConnected} />
            </div>
          </div>
          <div className="w-12 sm:w-16 h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 mt-4 sm:mt-5" />
        </div>

        {/* ── Orders ── */}
        <div className="space-y-6 sm:space-y-8">
          {orders.map((order: any) => {
            const currentStageIdx = STATUS_STAGES.findIndex((s) => s.status === order.status);
            const isCancelled = order.status === 'cancelled';
            const isCompleted = order.status === 'completed';
            let activeStage = currentStageIdx >= 0 ? currentStageIdx : 0;
            if (isCompleted) activeStage = STATUS_STAGES.length;

            const vendor = vendorInfo[order.tenantId];
            const threshold = vendor?.modificationThreshold || 30;
            const canModify = !['completed', 'cancelled', 'ready'].includes(order.status) && order.modificationStatus !== 'pending';

            // Ring progress: 0 → 0.33 → 0.66 → 1.0
            let ringProgress = 0;
            let ringColor = 'amber';
            let ringLabel = 'Pending';
            let ringIcon = <Clock className="w-6 h-6 sm:w-8 sm:h-8" />;

            if (isCancelled) {
              ringProgress = 0;
              ringColor = 'rose';
              ringLabel = 'Cancelled';
              ringIcon = <X className="w-6 h-6 sm:w-8 sm:h-8" />;
            } else if (isCompleted) {
              ringProgress = 1;
              ringColor = 'emerald';
              ringLabel = 'Complete';
              ringIcon = <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />;
            } else {
              const stage = STATUS_STAGES[activeStage];
              if (stage) {
                ringProgress = (activeStage + 1) / STATUS_STAGES.length;
                ringColor = stage.color;
                ringLabel = stage.mobileLabel;
                ringIcon = <div className="scale-150">{stage.icon}</div>;
              }
            }

            return (
              <div key={order.id} className="rounded-2xl border border-white/[0.06] bg-[rgba(19,25,31,0.5)] backdrop-blur-md overflow-hidden shadow-xl">

                {/* ── Vendor Header ── */}
                {vendor && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                      {/* Vendor avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {vendor.logoUrl ? (
                          <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        )}
                      </div>

                      {/* Vendor name + contact */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">{vendor.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2">
                          <a href={`tel:${vendor.phoneNumber}`} className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-amber-400 transition-colors">
                            <Phone className="w-3 h-3" />
                            {formatPhoneNumber(vendor.phoneNumber)}
                          </a>
                          {vendor.address && (
                            <Link
                              href={getGoogleMapsUrl(vendor.address || '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 truncate max-w-[180px]"
                            >
                              <MapPin className="w-3 h-3 shrink-0" />
                              {vendor.address}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Modification Banner ── */}
                {order.modificationStatus && (
                  <div className="px-4 sm:px-6 pt-4">
                    <ModificationBanner status={order.modificationStatus as ModStatus} note={modNotes[order.id]} />
                  </div>
                )}

                {/* ── Main Content ── */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
                    {/* Orbital Ring */}
                    <div className="flex flex-col items-center">
                      <OrbitalRing
                        progress={ringProgress}
                        statusLabel={ringLabel}
                        statusIcon={ringIcon}
                        accentColor={ringColor}
                        size={160}
                      />

                      {/* Schedule badge */}
                      {order.scheduledFor && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mt-3 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-1.5">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {format(new Date(order.scheduledFor), 'MMM d, h:mm a')}
                        </div>
                      )}
                    </div>

                    {/* Right side: Timeline + Details */}
                    <div className="flex-1 w-full sm:w-auto">
                      {/* Timeline */}
                      {!isCancelled && (
                        <VerticalTimeline activeStage={activeStage} isCompleted={isCompleted} isCancelled={isCancelled} />
                      )}

                      {/* Cancelled message */}
                      {isCancelled && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
                          <p className="text-sm font-medium text-rose-400">Your order has been cancelled.</p>
                          {order.rejectionReason && <p className="text-xs text-rose-500/70 mt-1">Reason provided: &quot;{order.rejectionReason}&quot;</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Order Details Footer ── */}
                <div className="px-4 sm:px-6 py-4 border-t border-white/5 bg-black/20">
                  {/* Order ID + meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Order ID</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-slate-300">#{order.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total</span>
                      <span className="text-sm sm:text-base font-black text-amber-400">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Order Type</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-300 capitalize flex items-center gap-1">
                        {order.fulfillmentMethod === 'delivery' ? <MapPin className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                        {order.fulfillmentMethod}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Payment</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-300 capitalize">{order.paymentMethod}</span>
                    </div>
                  </div>

                  {order.specialInstruction && (
                    <div className="mb-4 flex items-start gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                      <ReceiptText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                      <span>{order.specialInstruction}</span>
                    </div>
                  )}

                  {/* Actions */}
                  {!isCancelled && !isCompleted && vendor && (
                    <OrderActionBar
                      order={order}
                      sessionId={sessionId}
                      vendorSlug={vendor.slug}
                      canModify={canModify}
                      thresholdMinutes={threshold}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
