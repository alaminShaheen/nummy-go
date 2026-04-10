'use client';

import React from 'react';
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

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ── Single KPI card ─────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconClass?: string;
  glowClass?: string;
  pulse?: boolean;
}

function KpiCard({ label, value, sub, icon: Icon, iconClass, glowClass, pulse }: KpiCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden border-white/[0.06] bg-[#111820] transition-all duration-300 hover:border-white/[0.12] hover:-translate-y-0.5',
      pulse && 'border-amber-500/30'
    )}>
      {/* Subtle gradient overlay */}
      <div className={cn(
        'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        glowClass
      )} />

      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className={cn(
              'text-2xl font-black text-transparent bg-clip-text',
              pulse
                ? 'bg-gradient-to-r from-amber-300 to-orange-400'
                : 'bg-gradient-to-r from-slate-100 to-slate-300'
            )}>
              {value}
            </p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
          </div>

          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            iconClass ?? 'bg-slate-500/10 text-slate-400'
          )}>
            <Icon className="w-5 h-5" />
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
  const todayOrders = orders.filter(o => isToday(o.createdAt));
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
      value: String(totalToday),
      sub: 'since midnight',
      icon: ShoppingBag,
      iconClass: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      label: 'Revenue Today',
      value: `$${revenueToday.toFixed(2)}`,
      sub: 'excl. cancelled',
      icon: DollarSign,
      iconClass: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Pending',
      value: String(pendingCount),
      sub: pendingCount === 0 ? 'all clear!' : 'awaiting action',
      icon: Clock,
      iconClass: pendingCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400',
      pulse: pendingCount > 0,
    },
    {
      label: 'In Kitchen',
      value: String(preparingCount),
      sub: 'being prepared',
      icon: Flame,
      iconClass: 'bg-orange-500/10 text-orange-400',
    },
    {
      label: 'Avg Order Value',
      value: avgOrderValue > 0 ? `$${avgOrderValue.toFixed(2)}` : '—',
      sub: 'per order today',
      icon: TrendingUp,
      iconClass: 'bg-pink-500/10 text-pink-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
