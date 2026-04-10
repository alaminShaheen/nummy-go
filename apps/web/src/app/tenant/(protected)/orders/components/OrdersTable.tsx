'use client';

import React from 'react';
import { flexRender, type Table as TanstackTable, type ColumnDef } from '@tanstack/react-table';
import type { Order } from '@nummygo/shared/models/types';
import { CalendarClock, LayoutList } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { OrderTab } from './OrderFilterTabs';

// ── OrdersTable ──────────────────────────────────────────────────────────────

interface OrdersTableProps {
  table: TanstackTable<Order>;
  columns: ColumnDef<Order>[];
  activeTab: OrderTab;
}

export function OrdersTable({ table, columns, activeTab }: OrdersTableProps) {
  const rows = table.getRowModel().rows;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#111820' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">

          {/* ── Head ── */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderColor: 'rgba(255,255,255,0.05)',
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
                  <div className="flex flex-col items-center gap-2 text-slate-600">
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
                      'hover:bg-white/[0.02]',
                      row.original.modificationStatus === 'pending'
                        ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500/40'
                        : '',
                      row.getIsExpanded() ? 'bg-white/[0.02]' : ''
                    )}
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}
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
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td
                        colSpan={columns.length}
                        style={{ background: 'rgba(0,0,0,0.25)', padding: 0 }}
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
  return (
    <div
      className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200"
      style={{ borderLeft: '3px solid rgba(99,102,241,0.4)' }}
    >
      {/* Order items placeholder */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          Order Items
        </p>
        <div
          className="p-3 rounded-lg text-xs text-slate-500 italic"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          Item breakdown coming soon.
        </div>
      </div>

      {/* Order details */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
          Order Details
        </p>
        <div
          className="p-4 rounded-lg space-y-3 text-sm"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          {row.scheduledFor && (
            <div>
              <p className="text-[10px] font-bold uppercase text-amber-500 mb-1">Scheduled For</p>
              <div className="flex items-center gap-1.5 text-amber-300 text-xs">
                <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                {format(new Date(row.scheduledFor), 'MMM d, yyyy — h:mm a')}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Special Instructions</p>
            {row.specialInstruction ? (
              <p
                className="text-slate-200 text-xs p-2.5 rounded-md"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
              >
                &ldquo;{row.specialInstruction}&rdquo;
              </p>
            ) : (
              <p className="text-slate-600 italic text-xs">No special instructions.</p>
            )}
          </div>

          {row.rejectionReason && (
            <div>
              <p className="text-[10px] font-bold uppercase text-rose-500/80 mb-1">Rejection Reason</p>
              <p
                className="text-rose-400 text-xs p-2.5 rounded-md"
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
