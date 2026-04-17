import React from 'react';
import { C, fontStack, fmt } from './theme';

interface ItemTableProps {
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  /** Render items with line-through (for declined/cancelled orders) */
  strikethrough?: boolean;
}

/**
 * Compact receipt-style item rows.
 * Shows item name, ×quantity, and price.
 * Supports optional strikethrough for declined orders.
 */
export function ItemTable({ items, strikethrough = false }: ItemTableProps) {
  const textDeco = strikethrough ? 'line-through' : 'none';
  const nameColor = strikethrough ? C.textLabel : C.textPrimary;
  const priceColor = strikethrough ? C.textLabel : C.textSecondary;

  return (
    <>
      {items.map((item, i) => (
        <tr key={i}>
          <td style={{ padding: '5px 16px', verticalAlign: 'middle' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: nameColor, fontFamily: fontStack, textDecoration: textDeco }}>
              {item.name}
            </span>
          </td>
          <td style={{ padding: '5px 8px', textAlign: 'center', verticalAlign: 'middle', width: '40px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted, fontFamily: fontStack }}>
              ×{item.quantity}
            </span>
          </td>
          <td style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', width: '72px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: priceColor, fontFamily: fontStack, textDecoration: textDeco }}>
              {fmt(item.priceCents)}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
