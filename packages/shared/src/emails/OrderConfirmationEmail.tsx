import React from 'react';
import { EmailShell } from './components/EmailShell';
import { EmailHeader } from './components/EmailHeader';
import { EmailButton } from './components/EmailButton';
import { ItemTable } from './components/ItemTable';
import { MetaStrip } from './components/MetaStrip';
import { C, fontStack, fmt } from './components/theme';

// ── Types ──────────────────────────────────────────────────────────────────

export interface VendorOrderBlock {
  orderId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  fulfillmentMethod: 'pickup' | 'delivery';
  paymentMethod?: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  totalCents: number;
}

export interface OrderConfirmationEmailProps {
  checkoutSessionId: string;
  createdAt: number;
  totalCents: number;
  trackingUrl: string;
  vendorOrders: VendorOrderBlock[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ACCENT_BORDERS = [C.accentOrange, C.accentPurple, C.green, C.amber, '#8B5CF6'];

// ── Component ──────────────────────────────────────────────────────────────

export function OrderConfirmationEmail({
  checkoutSessionId,
  createdAt,
  totalCents,
  trackingUrl = '#',
  vendorOrders,
}: OrderConfirmationEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const shortSessionId = checkoutSessionId.slice(-6).toUpperCase();
  const totalItems = vendorOrders.reduce(
    (sum, v) => sum + v.items.reduce((s, i) => s + i.quantity, 0), 0,
  );
  const vendorCount = vendorOrders.length;
  const subtitle =
    vendorCount === 1
      ? `${totalItems} item${totalItems !== 1 ? 's' : ''} from ${vendorOrders[0]?.tenantName} · ${dateStr}`
      : `${totalItems} item${totalItems !== 1 ? 's' : ''} from ${vendorCount} restaurants · ${dateStr}`;

  return (
    <EmailShell previewText={`Your order is confirmed! #${shortSessionId} — ${fmt(totalCents)}`}>

      <EmailHeader status="confirmed" />

      {/* ── Hero ── */}
      <tr>
        <td style={{ padding: '20px 28px 0 28px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 900, lineHeight: 1.2, color: C.textPrimary, fontFamily: fontStack, letterSpacing: '-0.4px' }}>
            Your order is confirmed!
          </p>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: C.textMuted, fontFamily: fontStack, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </td>
      </tr>

      {/* ── Session Meta ── */}
      <MetaStrip entries={[
        { label: 'Order', value: `#${shortSessionId}`, highlight: true },
        { label: 'Date', value: dateStr },
        { label: 'Total', value: fmt(totalCents), highlight: true },
      ]} />

      {/* ── Vendor Blocks ── */}
      {vendorOrders.map((vendor, vi) => {
        const accent = ACCENT_BORDERS[vi % ACCENT_BORDERS.length];
        const vendorSubtotal = vendor.items.reduce((s, i) => s + i.priceCents, 0);
        const vendorTax = Math.round(vendorSubtotal * 0.13);
        const isDelivery = vendor.fulfillmentMethod === 'delivery';
        const deliveryCents = isDelivery ? 299 : 0;

        return (
          <tr key={vi}>
            <td style={{ padding: '16px 28px 0 28px' }}>
              <table
                role="presentation" cellPadding="0" cellSpacing="0" width="100%"
                style={{
                  backgroundColor: C.stripBg,
                  border: `1px solid ${C.divider}`,
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: '10px',
                }}
              >
                {/* Vendor name + pills */}
                <tr>
                  <td colSpan={3} style={{ padding: '14px 16px 6px 16px' }}>
                    <table role="presentation" cellPadding="0" cellSpacing="0" width="100%">
                      <tr>
                        <td className="vendor-header-name" style={{ verticalAlign: 'middle' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>
                            {vendor.tenantName}
                          </span>
                        </td>
                        <td className="vendor-header-pills" style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: isDelivery ? 'rgba(129,140,248,0.08)' : 'rgba(234,88,12,0.06)',
                            border: `1px solid ${isDelivery ? 'rgba(129,140,248,0.2)' : 'rgba(234,88,12,0.15)'}`,
                            borderRadius: '6px', padding: '2px 8px', fontSize: '9px', fontWeight: 700,
                            color: isDelivery ? C.indigo : C.accentOrange, fontFamily: fontStack, marginRight: '5px',
                          }}>
                            {isDelivery ? '🚗 Delivery' : '📍 Pickup'}
                          </span>
                          {vendor.paymentMethod && (
                            <span style={{
                              display: 'inline-block', backgroundColor: '#F1F5F9',
                              border: `1px solid ${C.divider}`, borderRadius: '6px', padding: '2px 8px',
                              fontSize: '9px', fontWeight: 700, color: C.textLabel, fontFamily: fontStack,
                            }}>
                              💳 {vendor.paymentMethod}
                            </span>
                          )}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <ItemTable items={vendor.items} />

                {/* Dashed divider + totals */}
                <tr><td colSpan={3} style={{ padding: '8px 16px 0 16px' }}><hr style={{ border: 'none', borderTop: `1px dashed ${C.divider}`, margin: 0 }} /></td></tr>
                <tr>
                  <td colSpan={2} style={{ padding: '6px 16px 0 16px' }}><span style={{ fontSize: '11px', color: C.textMuted, fontFamily: fontStack }}>Subtotal</span></td>
                  <td style={{ padding: '6px 16px 0 16px', textAlign: 'right' }}><span style={{ fontSize: '11px', fontWeight: 600, color: C.textSecondary, fontFamily: fontStack }}>{fmt(vendorSubtotal)}</span></td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ padding: '2px 16px 0 16px' }}><span style={{ fontSize: '11px', color: C.textMuted, fontFamily: fontStack }}>Tax (13%)</span></td>
                  <td style={{ padding: '2px 16px 0 16px', textAlign: 'right' }}><span style={{ fontSize: '11px', fontWeight: 600, color: C.textSecondary, fontFamily: fontStack }}>{fmt(vendorTax)}</span></td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ padding: '2px 16px 0 16px' }}><span style={{ fontSize: '11px', color: C.textMuted, fontFamily: fontStack }}>{isDelivery ? 'Delivery' : 'Pickup'}</span></td>
                  <td style={{ padding: '2px 16px 0 16px', textAlign: 'right' }}><span style={{ fontSize: '11px', fontWeight: 600, color: isDelivery ? C.textSecondary : C.green, fontFamily: fontStack }}>{isDelivery ? fmt(deliveryCents) : 'Free'}</span></td>
                </tr>
                <tr><td colSpan={3} style={{ padding: '6px 16px 0 16px' }}><hr style={{ border: 'none', borderTop: `1px solid ${C.divider}`, margin: 0 }} /></td></tr>
                <tr>
                  <td colSpan={2} style={{ padding: '8px 16px 14px 16px' }}><span style={{ fontSize: '12px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>Total</span></td>
                  <td style={{ padding: '8px 16px 14px 16px', textAlign: 'right' }}><span style={{ fontSize: '14px', fontWeight: 900, color: accent, fontFamily: fontStack }}>{fmt(vendor.totalCents)}</span></td>
                </tr>
              </table>
            </td>
          </tr>
        );
      })}

      {/* ── Grand Total (multi-vendor) ── */}
      {vendorOrders.length > 1 && (
        <tr>
          <td style={{ padding: '16px 28px 0 28px' }}>
            <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" style={{ backgroundColor: C.totalBg, border: '1px solid rgba(234,88,12,0.12)', borderRadius: '10px' }}>
              <tr>
                <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '13px', fontWeight: 700, color: C.textPrimary, fontFamily: fontStack }}>Order Total</span></td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}><span style={{ fontSize: '20px', fontWeight: 900, color: C.accentOrange, fontFamily: fontStack }}>{fmt(totalCents)}</span></td>
              </tr>
            </table>
          </td>
        </tr>
      )}

      <EmailButton href={trackingUrl} label="Track Your Order →" />

      {/* ── Contact Footer ── */}
      <tr>
        <td style={{ padding: '16px 28px 24px 28px' }}>
          <hr style={{ border: 'none', borderTop: `1px solid ${C.divider}`, margin: '0 0 14px 0' }} />
          {vendorOrders.map((vendor, vi) => (
            <p key={vi} style={{ margin: '0 0 2px 0', fontSize: '11px', color: C.textMuted, fontFamily: fontStack, textAlign: 'center', lineHeight: '1.6' }}>
              {vendor.tenantName}
              {vendor.tenantEmail && <> — {vendor.tenantEmail}</>}
              {vendor.tenantPhone && <> · {vendor.tenantPhone}</>}
            </p>
          ))}
        </td>
      </tr>

    </EmailShell>
  );
}
