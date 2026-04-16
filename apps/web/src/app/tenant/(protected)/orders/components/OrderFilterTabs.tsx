'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/themes';

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
  alertVariant?: boolean;
}

const TABS: TabConfig[] = [
  { id: 'all', label: 'All Orders', countKey: 'all' },
  { id: 'active', label: 'Active', countKey: 'active' },
  { id: 'preparing', label: 'Preparing', countKey: 'preparing' },
  { id: 'ready', label: 'Ready', countKey: 'ready' },
  { id: 'modifications', label: 'Modifications', countKey: 'modifications', alertVariant: true },
];

// ── Count badge ─────────────────────────────────────────────────────────────

function CountBadge({ count, alert, active, isLight }: { count: number; alert?: boolean; active: boolean; isLight: boolean }) {
  if (count === 0 && !active) return null;
  return (
    <span className={cn(
      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums',
      alert && count > 0
        ? 'bg-amber-500/20 text-amber-500 border border-amber-400/30 animate-pulse'
        : active
          ? isLight ? 'bg-slate-700/15 text-slate-700' : 'bg-white/20 text-white'
          : isLight ? 'bg-slate-200 text-slate-500' : 'bg-slate-700/60 text-slate-400'
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
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  return (
    <div
      className="flex items-center gap-1 rounded-xl p-1 overflow-x-auto scrollbar-none"
      style={{
        background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(0,0,0,0.30)',
        border: `1px solid ${theme.card.border}`,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
              tab.alertVariant && count > 0 && !isActive && 'text-amber-500 hover:text-amber-600'
            )}
            style={{
              background: isActive
                ? isLight ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.10)'
                : 'transparent',
              color: isActive
                ? theme.text.primary
                : theme.text.muted,
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = theme.text.secondary;
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = theme.text.muted;
            }}
          >
            {tab.label}
            <CountBadge count={count} alert={tab.alertVariant} active={isActive} isLight={isLight} />
          </button>
        );
      })}
    </div>
  );
}
