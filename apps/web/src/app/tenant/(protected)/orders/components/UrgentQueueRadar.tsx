import React, { useEffect, useState } from 'react';
import { URGENT_QUEUE_THRESHOLD_MINS, CRITICAL_QUEUE_THRESHOLD_MINS } from '@nummygo/shared';
import type { Order } from '@nummygo/shared/models/types';
import { AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrgentQueueRadarProps {
  orders: Order[];
  estimatedPrepTime?: number; // In minutes, used for ASAP baseline
  onOrderClick?: (orderId: string) => void;
}

// Minimal dependency-free SVG Circular Gauge
function SVGProgress({ pct, strokeColor, children }: { pct: number, strokeColor: string, children: React.ReactNode }) {
  const sqSize = 96;
  const strokeWidth = 8;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * pct) / 100;

  return (
    <div className="relative w-full h-full">
      <svg width={sqSize} height={sqSize} viewBox={viewBox} className="absolute inset-0 rotate-[-90deg]">
        <circle
          className="stroke-white/5"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
        />
        <circle
          stroke={strokeColor}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          fill="none"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function UrgentQueueRadar({ orders, estimatedPrepTime = 20, onOrderClick }: UrgentQueueRadarProps) {
  const [now, setNow] = useState(Date.now());

  // Force local timer tick every minute to keep radar completely live
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter and sort urgent orders, mapping ASAP to an effective Date
  const urgentOrders = orders
    .map(o => {
      // Effective target time: Explicit schedule OR (CreatedAt + PrepTime) for ASAP
      const effectiveTargetTime = o.scheduledFor 
        ? new Date(o.scheduledFor).getTime() 
        : o.createdAt + (estimatedPrepTime * 60000);
        
      return { ...o, _effectiveTargetTime: effectiveTargetTime };
    })
    .filter(o => {
      if (o.status === 'completed' || o.status === 'cancelled') return false;
      
      const diffMins = (o._effectiveTargetTime - now) / 60000;
      return diffMins <= URGENT_QUEUE_THRESHOLD_MINS;
    })
    .sort((a, b) => a._effectiveTargetTime - b._effectiveTargetTime);

  if (urgentOrders.length === 0) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            Urgent Queue Horizon
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            {urgentOrders.length} order{urgentOrders.length !== 1 && 's'} approaching critical status (due &lt; {URGENT_QUEUE_THRESHOLD_MINS}m)
          </p>
        </div>
      </div>

      {/* The Glow Radar Lens wrapper */}
      <div className="relative rounded-3xl p-1.5 overflow-hidden">
        {/* Glow Effects backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-transparent blur-2xl max-w-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent rounded-3xl border border-white/10" />
        
        {/* Scrollable swimlane */}
        <div className="relative flex gap-4 overflow-x-auto p-4 custom-scrollbar snap-x">
          {urgentOrders.map((order) => {
            const diffMins = Math.max(-99, Math.round((order._effectiveTargetTime - now) / 60000));
            
            const isCritical = diffMins <= CRITICAL_QUEUE_THRESHOLD_MINS;
            const isLate = diffMins < 0;

            const themeColors = isLate
              ? { bg: 'bg-rose-950/40 border-rose-500/50', path: '#f43f5e', text: 'text-rose-400', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]' }
              : isCritical
              ? { bg: 'bg-orange-950/40 border-orange-500/40', path: '#f97316', text: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' }
              : { bg: 'bg-amber-950/30 border-amber-500/30', path: '#f59e0b', text: 'text-amber-400', glow: 'shadow-lg' };

            // Calculate percentage for the gauge using URGENT_QUEUE_THRESHOLD_MINS as 100%
            const pct = isLate ? 100 : Math.max(0, 100 - (diffMins / URGENT_QUEUE_THRESHOLD_MINS) * 100);

            return (
              <button
                key={order.id}
                onClick={() => onOrderClick?.(order.id)}
                className={cn(
                  "shrink-0 snap-start w-64 rounded-2xl p-4 border backdrop-blur-md flex flex-col items-center justify-between text-left transition-all hover:scale-[1.02]",
                  themeColors.bg,
                  themeColors.glow
                )}
              >
                {/* Header row */}
                <div className="w-full flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">Order #{order.id.slice(-4).toUpperCase()}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[120px]">{order.customerName}</p>
                  </div>
                  {isLate && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Late
                    </span>
                  )}
                </div>

                {/* Circular Gauge */}
                <div className="w-24 h-24 my-2 relative">
                  <SVGProgress pct={pct} strokeColor={themeColors.path}>
                    <div className="flex flex-col items-center justify-center translate-y-0.5">
                      <span className={cn("text-2xl font-black leading-none", themeColors.text)}>
                        {Math.abs(diffMins)}<span className="text-sm">m</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {isLate ? 'overdue' : 'left'}
                      </span>
                    </div>
                  </SVGProgress>
                </div>

                {/* Footer row */}
                <div className="w-full flex items-center justify-between mt-3 px-1">
                  <span className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-widest rounded-md px-2 py-1", 
                     !order.scheduledFor ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-slate-800 text-slate-400"
                  )}>
                    {!order.scheduledFor ? "ASAP" : "Scheduled"}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className={cn("px-2 py-1 rounded-md",
                      order.status === 'ready' ? "bg-emerald-500/20 text-emerald-400" :
                      order.status === 'preparing' ? "bg-amber-500/20 text-amber-400" : ""
                    )}>
                      {order.status}
                    </span>
                    <Users className="w-3.5 h-3.5 ml-1" />
                    <span className="tabular-nums">{order.totalItems || 1}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
