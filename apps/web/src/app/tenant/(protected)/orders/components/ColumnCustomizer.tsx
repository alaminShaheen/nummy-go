'use client';

import React from 'react';
import type { Table } from '@tanstack/react-table';
import type { Order } from '@nummygo/shared/models/types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  Button,
} from '@/components/ui';
import { SlidersHorizontal } from 'lucide-react';
import { useTheme } from '@/lib/themes';

interface ColumnCustomizerProps {
  table: Table<Order>;
}

const COLUMN_LABELS: Record<string, string> = {
  expander:          'Expand',
  createdAt:         'Received',
  id:                'Order ID',
  customer:          'Customer',
  totalAmount:       'Total',
  fulfillmentMethod: 'Method',
  paymentMethod:     'Payment',
  status:            'Status',
  actions:           'Actions',
};

export function ColumnCustomizer({ table }: ColumnCustomizerProps) {
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  const hideable = table.getAllColumns().filter((col) => col.getCanHide());
  if (hideable.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-9 rounded-xl text-xs font-medium transition-all"
          style={{
            background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(0,0,0,0.30)',
            border: `1px solid ${theme.card.border}`,
            color: theme.text.secondary,
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 shadow-xl"
        style={{
          background: isLight ? 'rgba(255,255,255,0.98)' : '#111820',
          border: `1px solid ${theme.card.border}`,
          color: theme.text.primary,
          backdropFilter: 'blur(16px)',
          boxShadow: isLight
            ? '0 8px 32px rgba(15,23,42,0.12)'
            : '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <DropdownMenuLabel
          className="text-[10px] uppercase tracking-wider"
          style={{ color: theme.text.muted }}
        >
          Show / Hide Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ background: theme.card.border }} />
        {hideable.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            className="text-sm cursor-pointer"
            style={{ color: theme.text.secondary }}
            checked={col.getIsVisible()}
            onCheckedChange={(val) => col.toggleVisibility(!!val)}
          >
            <span className="ml-6 flex-1 truncate whitespace-nowrap">
              {COLUMN_LABELS[col.id] ?? col.id}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
