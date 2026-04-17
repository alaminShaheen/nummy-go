import React from 'react';
import { EmailShell } from './components/EmailShell';
import { EmailHeader } from './components/EmailHeader';
import { ItemTable } from './components/ItemTable';
import { MetaStrip } from './components/MetaStrip';
import { C, fontStack, fmt } from './components/theme';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TenantOrderCancelledEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  rejectionReason: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}

// ── Component ──────────────────────────────────────────────────────────────

export function TenantOrderCancelledEmail({
  tenantName,
  orderId,
  createdAt,
  totalCents,
  customerName,
  customerEmail,
  customerPhone,
  rejectionReason,
  items,
}: TenantOrderCancelledEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const shortId = orderId.slice(-6).toUpperCase();

  return (
    <EmailShell previewText={`Order #${shortId} cancelled by ${customerName}`}>

      <EmailHeader status="cancelled" />

      {/* ── Hero ── */}
      <tr>
        <td style={{ padding: '20px 28px 0 28px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 900, lineHeight: 1.2, color: C.textPrimary, fontFamily: fontStack, letterSpacing: '-0.4px' }}>
            Order cancelled
          </p>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: C.textMuted, fontFamily: fontStack, lineHeight: 1.6 }}>
            <strong style={{ color: C.textPrimary }}>{customerName}</strong> has cancelled their order.
            Please stop preparation if it has already started.
          </p>
        </td>
      </tr>

      {/* ── Order Meta ── */}
      <MetaStrip entries={[
        { label: 'Order', value: `#${shortId}`, highlight: true },
        { label: 'Placed', value: dateStr },
        { label: 'Status', value: 'Cancelled' },
      ]} />

      {/* ── Cancellation Reason ── */}
      <tr>
        <td style={{ padding: '16px 28px 0 28px' }}>
          <table
            role="presentation" cellPadding="0" cellSpacing="0" width="100%"
            style={{
              backgroundColor: C.dangerBg,
              borderLeft: `3px solid ${C.rose}`,
              borderRadius: '10px',
              border: '1px solid rgba(244,63,94,0.1)',
            }}
          >
            <tr>
              <td style={{ padding: '14px 16px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: C.rose, fontFamily: fontStack }}>
                  Customer Reason
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, fontFamily: fontStack, fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{rejectionReason}"
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      {/* ── Items ── */}
      <tr>
        <td style={{ padding: '16px 28px 0 28px' }}>
          <table
            role="presentation" cellPadding="0" cellSpacing="0" width="100%"
            style={{ backgroundColor: C.stripBg, border: `1px solid ${C.divider}`, borderRadius: '10px' }}
          >
            <tr>
              <td colSpan={3} style={{ padding: '14px 16px 6px 16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>
                  Cancelled Items
                </span>
              </td>
            </tr>

            <ItemTable items={items} />

            <tr><td colSpan={3} style={{ padding: '8px 16px 0 16px' }}><hr style={{ border: 'none', borderTop: `1px dashed ${C.divider}`, margin: 0 }} /></td></tr>
            <tr>
              <td colSpan={2} style={{ padding: '8px 16px 14px 16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>Voided Amount</span>
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

      {/* ── Customer Info ── */}
      <tr>
        <td style={{ padding: '16px 28px 0 28px' }}>
          <table
            role="presentation" cellPadding="0" cellSpacing="0" width="100%"
            style={{ backgroundColor: C.stripBg, border: `1px solid ${C.divider}`, borderRadius: '10px' }}
          >
            <tr>
              <td style={{ padding: '14px 16px 4px 16px' }}>
                <p style={{ margin: '0 0 3px 0', fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: C.textMuted, fontFamily: fontStack }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: C.textPrimary, fontFamily: fontStack }}>
                  {customerName}
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 16px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, fontFamily: fontStack, lineHeight: 1.5 }}>
                  ✉ {customerEmail}
                  {customerPhone && <> · 📱 {customerPhone}</>}
                </p>
              </td>
            </tr>
            <tr><td style={{ padding: '0 16px 14px 16px' }} /></tr>
          </table>
        </td>
      </tr>

      {/* ── Voided notice ── */}
      <tr>
        <td style={{ padding: '12px 28px 0 28px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: C.textLabel, fontFamily: fontStack, fontStyle: 'italic', lineHeight: 1.6 }}>
            This order has been voided. No charges apply.
          </p>
        </td>
      </tr>

      {/* ── Footer divider ── */}
      <tr>
        <td style={{ padding: '16px 28px 24px 28px' }}>
          <hr style={{ border: 'none', borderTop: `1px solid ${C.divider}`, margin: 0 }} />
        </td>
      </tr>

    </EmailShell>
  );
}
