'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ── Filter tab type — exported so the dashboard page & OrdersTable can use it ─

export type OrderTab =
  | 'all'
  | 'active'
  | 'preparing'
  | 'ready'
  | 'modifications';

interface TabConfig {
  id: OrderTab;
  label: string;
  countKey: OrderTab;
  alertVariant?: boolean; // amber pulsing badge
}

const TABS: TabConfig[] = [
  { id: 'all',           label: 'All Orders',    countKey: 'all' },
  { id: 'active',        label: 'Active',         countKey: 'active' },
  { id: 'preparing',     label: 'In Kitchen',     countKey: 'preparing' },
  { id: 'ready',         label: 'Ready',          countKey: 'ready' },
  { id: 'modifications', label: 'Modifications',  countKey: 'modifications', alertVariant: true },
];

// ── Count badge ─────────────────────────────────────────────────────────────

function CountBadge({ count, alert, active }: { count: number; alert?: boolean; active: boolean }) {
  if (count === 0 && !active) return null;
  return (
    <span className={cn(
      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums',
      alert && count > 0
        ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30 animate-pulse'
        : active
          ? 'bg-white/20 text-white'
          : 'bg-slate-700/60 text-slate-400'
    )}>
      {count}
    </span>
  );
}

// ── OrderFilterTabs ─────────────────────────────────────────────────────────

interface OrderFilterTabsProps {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
  counts: Record<OrderTab, number>;
}

export function OrderFilterTabs({ activeTab, onTabChange, counts }: OrderFilterTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-black/30 border border-white/[0.06] rounded-xl p-1 overflow-x-auto scrollbar-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
              isActive
                ? 'bg-white/10 text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
              // Alert tab (modifications) gets amber styling when not active + has count
              tab.alertVariant && count > 0 && !isActive && 'text-amber-400/80 hover:text-amber-300'
            )}
          >
            {tab.label}
            <CountBadge count={count} alert={tab.alertVariant} active={isActive} />
          </button>
        );
      })}
    </div>
  );
}
