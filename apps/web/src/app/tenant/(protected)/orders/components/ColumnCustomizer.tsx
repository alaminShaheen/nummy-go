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

interface ColumnCustomizerProps {
  table: Table<Order>;
}

// Friendly display names for column IDs
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
  const hideable = table.getAllColumns().filter(
    (col) => col.getCanHide()
  );

  if (hideable.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-9 rounded-xl border-white/[0.08] bg-black/30 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-xs font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-[#111820] border-white/[0.08] text-slate-300 shadow-xl shadow-black/40"
      >
        <DropdownMenuLabel className="text-slate-500 text-[10px] uppercase tracking-wider">
          Show / Hide Columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.06]" />
        {hideable.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            className="text-sm text-slate-300 focus:bg-white/[0.05] focus:text-slate-100 cursor-pointer"
            checked={col.getIsVisible()}
            onCheckedChange={(val) => col.toggleVisibility(!!val)}
          >
            {COLUMN_LABELS[col.id] ?? col.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
