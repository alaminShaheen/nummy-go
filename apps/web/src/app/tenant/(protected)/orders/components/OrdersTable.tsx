'use client';

import React from 'react';
import { flexRender, type Table as TanstackTable, type ColumnDef } from '@tanstack/react-table';
import type { Order } from '@nummygo/shared/models/types';
import { CalendarClock, LayoutList } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { OrderTab } from './OrderFilterTabs';
import { trpc } from '@/trpc/client';
import { Loader2 } from 'lucide-react';
import { formatPhoneNumber } from '@nummygo/shared/lib/formatters';
import { useTheme } from '@/lib/themes';

// ── OrdersTable ──────────────────────────────────────────────────────────────

interface OrdersTableProps {
  table: TanstackTable<Order>;
  columns: ColumnDef<Order>[];
  activeTab: OrderTab;
}

export function OrdersTable({ table, columns, activeTab }: OrdersTableProps) {
  const rows = table.getRowModel().rows;
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  return (
    <div
      className="rounded-xl overflow-hidden w-full"
      style={{
        background: isLight ? theme.card.bg : '#111820',
        border: `1px solid ${theme.card.border}`,
      }}
    >
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-transparent"
        style={{ scrollbarColor: `${theme.card.border} transparent` }}>
        <table className="w-full text-left border-collapse min-w-[800px]">

          {/* ── Head ── */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b"
                style={{
                  background: isLight ? 'rgba(15,23,42,0.03)' : 'rgba(0,0,0,0.35)',
                  borderColor: theme.card.border,
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left align-middle"
                    scope="col"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ── Body ── */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2" style={{ color: theme.text.muted }}>
                    <LayoutList className="w-7 h-7 opacity-40" aria-hidden="true" />
                    <span className="text-sm">
                      {activeTab === 'all' ? 'No orders yet.' : `No ${activeTab} orders.`}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  {/* Main row */}
                  <tr
                    className={cn(
                      'transition-colors border-b',
                      row.original.modificationStatus === 'pending'
                        ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500/40'
                        : '',
                    )}
                    style={{
                      borderColor: theme.card.border,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = isLight
                        ? 'rgba(15,23,42,0.025)'
                        : 'rgba(255,255,255,0.02)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = row.original.modificationStatus === 'pending'
                        ? 'rgba(245,158,11,0.03)'
                        : 'transparent';
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3.5 align-middle"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>

                  {/* Expanded detail row */}
                  {row.getIsExpanded() && (
                    <tr style={{ borderBottom: `1px solid ${theme.card.border}` }}>
                      <td
                        colSpan={columns.length}
                        style={{
                          background: isLight ? 'rgba(15,23,42,0.02)' : 'rgba(0,0,0,0.25)',
                          padding: 0,
                        }}
                      >
                        <OrderDetailPanel row={row.original} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── OrderDetailPanel ─────────────────────────────────────────────────────────

function OrderDetailPanel({ row }: { row: Order }) {
  const { theme } = useTheme();
  const isLight = theme.name === 'light';

  const { data, isLoading } = trpc.order.getOrderDetails.useQuery(
    { orderId: row.id },
    { staleTime: 1000 * 60 * 5 }
  );

  const panelBg = isLight ? 'rgba(15,23,42,0.03)' : 'rgba(0,0,0,0.3)';
  const panelBorder = theme.card.border;
  const innerBg = isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.02)';
  const innerBorder = theme.card.border;

  return (
    <div
      className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200"
      style={{ borderLeft: '3px solid rgba(99,102,241,0.4)' }}
    >
      {/* Order items */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.text.muted }}>
          Order Items
        </p>
        <div className="space-y-2">
          {isLoading ? (
            <div
              className="flex items-center justify-center p-6 rounded-lg"
              style={{ background: panelBg, border: `1px solid ${panelBorder}`, color: theme.text.muted }}
            >
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="ml-3 text-xs">Loading items...</span>
            </div>
          ) : data?.items ? (
            <div className="space-y-2">
              {data.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
                >
                  <div
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-lg flex items-center justify-center relative"
                    style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <LayoutList className="w-4 h-4" style={{ color: theme.text.muted }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.text.primary }}>{item.name}</p>
                    <p className="text-xs" style={{ color: theme.text.muted }}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-amber-500">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-3 rounded-lg text-xs italic"
              style={{ background: panelBg, border: `1px solid ${panelBorder}`, color: theme.text.muted }}
            >
              No item details available.
            </div>
          )}
        </div>
      </div>

      {/* Order details */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.text.muted }}>
          Order Details
        </p>
        <div
          className="p-4 rounded-lg space-y-3 text-sm"
          style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
        >
          {(row.customerEmail || row.customerPhone) && (
            <div>
              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.text.muted }}>Customer Contact</p>
              <div
                className="p-2.5 rounded-md space-y-0.5"
                style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
              >
                {row.customerEmail && <p className="text-[11px]" style={{ color: theme.text.secondary }}>{row.customerEmail}</p>}
                {row.customerPhone && <p className="text-[11px]" style={{ color: theme.text.muted }}>{formatPhoneNumber(row.customerPhone)}</p>}
              </div>
            </div>
          )}
          {row.scheduledFor && (
            <div>
              <p className="text-[10px] font-bold uppercase text-amber-500 mb-1">Scheduled For</p>
              <div className="flex items-center gap-1.5 text-amber-500 text-xs">
                <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                {format(new Date(row.scheduledFor), 'MMM d, yyyy — h:mm a')}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: theme.text.muted }}>Special Instructions</p>
            {row.specialInstruction ? (
              <p
                className="text-xs p-2.5 rounded-md"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.18)',
                  color: theme.text.primary,
                }}
              >
                &ldquo;{row.specialInstruction}&rdquo;
              </p>
            ) : (
              <p className="italic text-xs" style={{ color: theme.text.muted }}>No special instructions.</p>
            )}
          </div>

          {row.rejectionReason && (
            <div>
              <p className="text-[10px] font-bold uppercase text-rose-500/80 mb-1">Rejection Reason</p>
              <p
                className="text-rose-500 text-xs p-2.5 rounded-md"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.18)' }}
              >
                {row.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
