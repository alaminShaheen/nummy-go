import React from 'react';
import { EmailShell } from './components/EmailShell';
import { EmailHeader } from './components/EmailHeader';
import { EmailButton } from './components/EmailButton';
import { ItemTable } from './components/ItemTable';
import { MetaStrip } from './components/MetaStrip';
import { C, fontStack, fmt } from './components/theme';

// ── Types ──────────────────────────────────────────────────────────────────

export interface OrderDeclinedEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  rejectionReason: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}

// ── Component ──────────────────────────────────────────────────────────────

export function OrderDeclinedEmail({
  tenantName,
  orderId,
  createdAt,
  totalCents,
  rejectionReason,
  items,
}: OrderDeclinedEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const shortId = orderId.slice(-6).toUpperCase();

  return (
    <EmailShell previewText={`Your order from ${tenantName} was declined · #${shortId}`}>

      <EmailHeader status="declined" />

      {/* ── Hero ── */}
      <tr>
        <td style={{ padding: '20px 28px 0 28px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 900, lineHeight: 1.2, color: C.textPrimary, fontFamily: fontStack, letterSpacing: '-0.4px' }}>
            We're sorry.
          </p>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: C.textMuted, fontFamily: fontStack, lineHeight: 1.6 }}>
            <strong style={{ color: C.textPrimary }}>{tenantName}</strong> was unable to fulfil your
            order. If you were charged, a full refund has been issued.
          </p>
        </td>
      </tr>

      {/* ── Order Meta ── */}
      <MetaStrip entries={[
        { label: 'Order', value: `#${shortId}`, highlight: true },
        { label: 'Date', value: dateStr },
        { label: 'Status', value: 'Declined' },
      ]} />

      {/* ── Rejection Reason ── */}
      <tr>
        <td style={{ padding: '16px 28px 0 28px' }}>
          <table
            role="presentation" cellPadding="0" cellSpacing="0" width="100%"
            style={{
              backgroundColor: C.dangerBg,
              borderLeft: `3px solid ${C.rose}`,
              borderRadius: '10px',
              border: `1px solid rgba(244,63,94,0.1)`,
            }}
          >
            <tr>
              <td style={{ padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: C.rose, fontFamily: fontStack }}>
                  Message from {tenantName}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, fontFamily: fontStack, fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{rejectionReason}"
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      {/* ── Items (struck through) ── */}
      <tr>
        <td style={{ padding: '16px 28px 0 28px' }}>
          <table
            role="presentation" cellPadding="0" cellSpacing="0" width="100%"
            style={{ backgroundColor: C.stripBg, border: `1px solid ${C.divider}`, borderRadius: '10px' }}
          >
            <tr>
              <td colSpan={3} style={{ padding: '14px 16px 6px 16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>
                  Order Summary
                </span>
              </td>
            </tr>

            <ItemTable items={items} strikethrough />

            {/* Divider + refunded total */}
            <tr><td colSpan={3} style={{ padding: '8px 16px 0 16px' }}><hr style={{ border: 'none', borderTop: `1px dashed ${C.divider}`, margin: 0 }} /></td></tr>
            <tr>
              <td colSpan={2} style={{ padding: '8px 16px 14px 16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>Refunded Total</span>
              </td>
              <td style={{ padding: '8px 16px 14px 16px', textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: C.textLabel, fontFamily: fontStack, textDecoration: 'line-through' }}>
                  {fmt(totalCents)}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      {/* ── Refund notice ── */}
      <tr>
        <td style={{ padding: '12px 28px 0 28px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: C.textLabel, fontFamily: fontStack, fontStyle: 'italic', lineHeight: 1.6 }}>
            A full refund will be processed within 3–5 business days.
          </p>
        </td>
      </tr>

      <EmailButton href="https://nummygo.ca" label="Browse Restaurants →" />

      {/* ── Footer divider ── */}
      <tr>
        <td style={{ padding: '16px 28px 24px 28px' }}>
          <hr style={{ border: 'none', borderTop: `1px solid ${C.divider}`, margin: 0 }} />
        </td>
      </tr>

    </EmailShell>
  );
}
