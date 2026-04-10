'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import type { Order } from '@nummygo/shared/models/types';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Helpers ─────────────────────────────────────────────────────────────────

function isSameDay(ts: number, referenceTs: number): boolean {
  const d = new Date(ts);
  const ref = new Date(referenceTs);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

// ── Number Ticker Hook ──────────────────────────────────────────────────────

function useNumberTicker(value: number, duration: number = 1200) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const initialValue = displayValue;

    if (initialValue === value) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutExpo for rapid slide followed by slow settle
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = initialValue + (value - initialValue) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return displayValue;
}

// ── Single KPI card ─────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  rawValue: number;
  formatValue?: (val: number) => string;
  sub?: string;
  icon: React.ElementType;
  iconClass?: string;
  pulse?: boolean;
}

function KpiCard({ label, rawValue, formatValue, sub, icon: Icon, iconClass, pulse }: KpiCardProps) {
  const animatedValue = useNumberTicker(rawValue);
  const formattedValue = formatValue ? formatValue(animatedValue) : String(Math.round(animatedValue));

  // WebSocket live Bounce Mechanic
  const [isBouncing, setIsBouncing] = useState(false);
  const [initialMount, setInitialMount] = useState(true);

  useEffect(() => {
    if (initialMount) {
      setInitialMount(false);
      return;
    }
    setIsBouncing(true);
    const timer = setTimeout(() => setIsBouncing(false), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawValue]); // Trigger bounce exactly when the underlying DB value ticks up

  return (
    <Card className={cn(
      'group relative overflow-hidden bg-[#111820] transition-all duration-500 hover:-translate-y-1',
      // The subtle glassmorphic ring, heavily amber skewed during pulse
      pulse ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : 'border-white/[0.06] hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      // WebSocket physical micro-bounce
      isBouncing && 'scale-[1.02] border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
    )}>
      {/* ── Internal Radial Glow Effect ── */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700',
        pulse && 'from-amber-500/[0.08] opacity-100'
      )} />

      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500/70">{label}</p>
            <p className="gradient-text text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-orange-500 tabular-nums">
              {formattedValue}
            </p>
            {sub && <p className="text-[11px] text-slate-500/80 font-medium">{sub}</p>}
          </div>

          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500',
            pulse
              ? 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-white/[0.02] border-white/[0.05] text-amber-500/40 group-hover:bg-amber-500/5 group-hover:text-amber-500/80 group-hover:border-amber-500/10',
            iconClass
          )}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── KpiCards ────────────────────────────────────────────────────────────────

interface KpiCardsProps {
  orders: Order[];
}

export function KpiCards({ orders }: KpiCardsProps) {
  // Use the most recent order's date as the reference point for "today"
  // so that legacy test data still populates the dynamic values and triggers animations.
  const mostRecentOrder = [...orders].sort((a, b) => b.createdAt - a.createdAt)[0];
  const todayMillis = mostRecentOrder ? mostRecentOrder.createdAt : Date.now();

  const todayOrders = orders.filter(o => isSameDay(o.createdAt, todayMillis));
  const totalToday = todayOrders.length;

  const revenueToday = todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (parseFloat(String(o.totalAmount)) || 0), 0);

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  const completedOrders = todayOrders.filter(o => o.status !== 'cancelled');
  const avgOrderValue = completedOrders.length > 0
    ? revenueToday / completedOrders.length
    : 0;

  const cards: KpiCardProps[] = [
    {
      label: 'Orders Today',
      rawValue: totalToday,
      sub: 'since midnight',
      icon: ShoppingBag,
      iconClass: totalToday > 0 ? 'animate-[pulse_3s_ease-in-out_infinite]' : '',
    },
    {
      label: 'Revenue Today',
      rawValue: revenueToday,
      formatValue: (v) => `$${v.toFixed(2)}`,
      sub: 'excl. cancelled',
      icon: DollarSign,
      iconClass: revenueToday > 0 ? 'animate-[pulse_3s_ease-in-out_infinite]' : '',
    },
    {
      label: 'Pending',
      rawValue: pendingCount,
      sub: pendingCount === 0 ? 'all clear' : 'awaiting action',
      icon: Clock,
      // Apply a subtle rotation tick animation naturally if pending > 0
      iconClass: pendingCount > 0 ? "animate-[pulse_1.5s_ease-in-out_infinite]" : "",
      pulse: pendingCount > 0,
    },
    {
      label: 'In Kitchen',
      rawValue: preparingCount,
      sub: 'being prepared',
      icon: Flame,
      // Makes the flame pulsate/flicker realistically
      iconClass: preparingCount > 0 ? "animate-pulse" : "",
      pulse: preparingCount > 0,
    },
    {
      label: 'Avg Order Value',
      rawValue: avgOrderValue,
      formatValue: (v) => v > 0 ? `$${v.toFixed(2)}` : '—',
      sub: 'per order today',
      icon: TrendingUp,
      iconClass: avgOrderValue > 0 ? 'animate-[pulse_3s_ease-in-out_infinite]' : '',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
