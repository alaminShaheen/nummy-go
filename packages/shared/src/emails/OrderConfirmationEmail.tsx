import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Hr,
  Link,
  Tailwind,
} from '@react-email/components';

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

const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

// nummyGo light theme palette (matching [data-theme="light"] in globals.css)
const C = {
  pageBg: '#F4F6FB',
  cardBg: '#FFFFFF',
  stripBg: '#F8FAFC',
  totalBg: '#FFF7ED',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLabel: '#64748B',
  accentOrange: '#EA580C',
  accentDeep: '#C2410C',
  accentPurple: '#7C3AED',
  amber: '#F59E0B',
  green: '#10B981',
  indigo: '#818CF8',
  border: 'rgba(15,23,42,0.08)',
  borderCard: 'rgba(15,23,42,0.06)',
  divider: '#E2E8F0',
} as const;

const ACCENT_BORDERS = [C.accentOrange, C.accentPurple, C.green, C.amber, '#8B5CF6'];

const fontStack = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// ── Component ──────────────────────────────────────────────────────────────

export function OrderConfirmationEmail({
  checkoutSessionId,
  createdAt,
  totalCents,
  trackingUrl = '#',
  vendorOrders,
}: OrderConfirmationEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const shortSessionId = checkoutSessionId.slice(-6).toUpperCase();
  const totalItems = vendorOrders.reduce(
    (sum, v) => sum + v.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );
  const vendorCount = vendorOrders.length;
  const subtitle =
    vendorCount === 1
      ? `${totalItems} item${totalItems !== 1 ? 's' : ''} from ${vendorOrders[0]?.tenantName} · ${dateStr}`
      : `${totalItems} item${totalItems !== 1 ? 's' : ''} from ${vendorCount} restaurants · ${dateStr}`;

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          @media only screen and (max-width: 480px) {
            .email-container { padding: 12px !important; }
            .email-card { border-radius: 12px !important; }
            .meta-strip td { display: block !important; width: 100% !important; border-left: none !important; border-bottom: 1px solid ${C.divider} !important; padding: 10px 16px !important; }
            .meta-strip td:last-child { border-bottom: none !important; }
            .vendor-header-pills { display: block !important; margin-top: 8px !important; text-align: left !important; }
            .vendor-header-name { display: block !important; }
          }
        `}</style>
      </Head>
      <Preview>Your order is confirmed! #{shortSessionId} — {fmt(totalCents)}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: C.pageBg, fontFamily: fontStack, WebkitFontSmoothing: 'antialiased' }}>

        {/* Outer container */}
        <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" style={{ backgroundColor: C.pageBg }}>
          <tr>
            <td align="center" style={{ padding: '32px 16px' }} className="email-container">

              {/* Main card */}
              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                width="100%"
                style={{
                  maxWidth: '560px',
                  backgroundColor: C.cardBg,
                  borderRadius: '16px',
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 4px 24px -8px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.04)',
                  overflow: 'hidden',
                }}
                className="email-card"
              >

                {/* ══════════ GRADIENT ACCENT BAR ══════════ */}
                <tr>
                  <td style={{ height: '4px', background: `linear-gradient(90deg, ${C.accentOrange} 0%, ${C.accentDeep} 50%, ${C.accentPurple} 100%)` }} />
                </tr>

                {/* ══════════ HEADER: Brand + Status ══════════ */}
                <tr>
                  <td style={{ padding: '24px 28px 0 28px' }}>
                    <table role="presentation" cellPadding="0" cellSpacing="0" width="100%">
                      <tr>
                        <td style={{ verticalAlign: 'middle' }}>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: C.textPrimary, fontFamily: fontStack, letterSpacing: '-0.3px' }}>
                            🔥{' '}
                            <span style={{ background: `linear-gradient(135deg, ${C.accentOrange}, ${C.accentDeep}, ${C.accentPurple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                              nummyGo
                            </span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.18)',
                            borderRadius: '999px',
                            padding: '4px 12px',
                            fontSize: '10px',
                            fontWeight: 700,
                            color: C.green,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase' as const,
                            fontFamily: fontStack,
                          }}>
                            ✓ Confirmed
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* ══════════ HERO: One-line confirmation ══════════ */}
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

                {/* ══════════ SESSION DETAILS STRIP ══════════ */}
                <tr>
                  <td style={{ padding: '20px 28px 0 28px' }}>
                    <table
                      role="presentation"
                      cellPadding="0"
                      cellSpacing="0"
                      width="100%"
                      style={{
                        backgroundColor: C.stripBg,
                        borderRadius: '10px',
                        border: `1px solid ${C.divider}`,
                      }}
                      className="meta-strip"
                    >
                      <tr>
                        <td style={{ padding: '12px 16px', width: '33%' }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: C.textMuted, fontFamily: fontStack }}>
                            Order
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: C.accentOrange, fontFamily: fontStack }}>
                            #{shortSessionId}
                          </p>
                        </td>
                        <td style={{ padding: '12px 16px', width: '33%', borderLeft: `1px solid ${C.divider}` }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: C.textMuted, fontFamily: fontStack }}>
                            Date
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: C.textSecondary, fontFamily: fontStack }}>
                            {dateStr}
                          </p>
                        </td>
                        <td style={{ padding: '12px 16px', width: '34%', borderLeft: `1px solid ${C.divider}` }}>
                          <p style={{ margin: '0 0 3px 0', fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: C.textMuted, fontFamily: fontStack }}>
                            Total
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: C.accentOrange, fontFamily: fontStack }}>
                            {fmt(totalCents)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* ══════════ VENDOR ORDER BLOCKS ══════════ */}
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
                          role="presentation"
                          cellPadding="0"
                          cellSpacing="0"
                          width="100%"
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
                                      backgroundColor: isDelivery ? 'rgba(129,140,248,0.08)' : `rgba(234,88,12,0.06)`,
                                      border: `1px solid ${isDelivery ? 'rgba(129,140,248,0.2)' : 'rgba(234,88,12,0.15)'}`,
                                      borderRadius: '6px',
                                      padding: '2px 8px',
                                      fontSize: '9px',
                                      fontWeight: 700,
                                      color: isDelivery ? C.indigo : C.accentOrange,
                                      fontFamily: fontStack,
                                      marginRight: '5px',
                                    }}>
                                      {isDelivery ? '🚗 Delivery' : '📍 Pickup'}
                                    </span>
                                    {vendor.paymentMethod && (
                                      <span style={{
                                        display: 'inline-block',
                                        backgroundColor: '#F1F5F9',
                                        border: `1px solid ${C.divider}`,
                                        borderRadius: '6px',
                                        padding: '2px 8px',
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        color: C.textLabel,
                                        fontFamily: fontStack,
                                      }}>
                                        💳 {vendor.paymentMethod}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          {/* Item rows */}
                          {vendor.items.map((item, ii) => (
                            <tr key={ii}>
                              <td style={{ padding: '5px 16px', verticalAlign: 'middle' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: C.textPrimary, fontFamily: fontStack }}>
                                  {item.name}
                                </span>
                              </td>
                              <td style={{ padding: '5px 8px', textAlign: 'center', verticalAlign: 'middle', width: '40px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted, fontFamily: fontStack }}>
                                  ×{item.quantity}
                                </span>
                              </td>
                              <td style={{ padding: '5px 16px', textAlign: 'right', verticalAlign: 'middle', width: '72px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: C.textSecondary, fontFamily: fontStack }}>
                                  {fmt(item.priceCents)}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {/* Dashed divider */}
                          <tr>
                            <td colSpan={3} style={{ padding: '8px 16px 0 16px' }}>
                              <hr style={{ border: 'none', borderTop: `1px dashed ${C.divider}`, margin: 0 }} />
                            </td>
                          </tr>

                          {/* Subtotal */}
                          <tr>
                            <td colSpan={2} style={{ padding: '6px 16px 0 16px' }}>
                              <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: fontStack }}>Subtotal</span>
                            </td>
                            <td style={{ padding: '6px 16px 0 16px', textAlign: 'right' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: C.textSecondary, fontFamily: fontStack }}>{fmt(vendorSubtotal)}</span>
                            </td>
                          </tr>
                          {/* Tax */}
                          <tr>
                            <td colSpan={2} style={{ padding: '2px 16px 0 16px' }}>
                              <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: fontStack }}>Tax (13%)</span>
                            </td>
                            <td style={{ padding: '2px 16px 0 16px', textAlign: 'right' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: C.textSecondary, fontFamily: fontStack }}>{fmt(vendorTax)}</span>
                            </td>
                          </tr>
                          {/* Fulfillment */}
                          <tr>
                            <td colSpan={2} style={{ padding: '2px 16px 0 16px' }}>
                              <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: fontStack }}>
                                {isDelivery ? 'Delivery' : 'Pickup'}
                              </span>
                            </td>
                            <td style={{ padding: '2px 16px 0 16px', textAlign: 'right' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: isDelivery ? C.textSecondary : C.green, fontFamily: fontStack }}>
                                {isDelivery ? fmt(deliveryCents) : 'Free'}
                              </span>
                            </td>
                          </tr>

                          {/* Solid divider before total */}
                          <tr>
                            <td colSpan={3} style={{ padding: '6px 16px 0 16px' }}>
                              <hr style={{ border: 'none', borderTop: `1px solid ${C.divider}`, margin: 0 }} />
                            </td>
                          </tr>
                          {/* Vendor total */}
                          <tr>
                            <td colSpan={2} style={{ padding: '8px 16px 14px 16px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: C.textPrimary, fontFamily: fontStack }}>Total</span>
                            </td>
                            <td style={{ padding: '8px 16px 14px 16px', textAlign: 'right' }}>
                              <span style={{ fontSize: '14px', fontWeight: 900, color: accent, fontFamily: fontStack }}>
                                {fmt(vendor.totalCents)}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  );
                })}

                {/* ══════════ GRAND TOTAL (multi-vendor) ══════════ */}
                {vendorOrders.length > 1 && (
                  <tr>
                    <td style={{ padding: '16px 28px 0 28px' }}>
                      <table
                        role="presentation"
                        cellPadding="0"
                        cellSpacing="0"
                        width="100%"
                        style={{
                          backgroundColor: C.totalBg,
                          border: `1px solid rgba(234,88,12,0.12)`,
                          borderRadius: '10px',
                        }}
                      >
                        <tr>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: C.textPrimary, fontFamily: fontStack }}>
                              Order Total
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <span style={{ fontSize: '20px', fontWeight: 900, color: C.accentOrange, fontFamily: fontStack }}>
                              {fmt(totalCents)}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                )}

                {/* ══════════ CTA BUTTON (table-based for email safety) ══════════ */}
                <tr>
                  <td style={{ padding: '24px 28px 8px 28px' }}>
                    <table role="presentation" cellPadding="0" cellSpacing="0" width="100%">
                      <tr>
                        <td align="center" style={{
                          background: `linear-gradient(135deg, ${C.accentOrange} 0%, ${C.accentDeep} 100%)`,
                          borderRadius: '999px',
                          boxShadow: '0 4px 16px rgba(234,88,12,0.25), 0 1px 3px rgba(234,88,12,0.15)',
                        }}>
                          <a
                            href={trackingUrl}
                            target="_blank"
                            style={{
                              display: 'block',
                              padding: '14px 32px',
                              fontSize: '13px',
                              fontWeight: 800,
                              fontFamily: fontStack,
                              color: '#FFFFFF',
                              textDecoration: 'none',
                              textAlign: 'center',
                              letterSpacing: '0.3px',
                            }}
                          >
                            Track Your Order →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* ══════════ CONTACT FOOTER ══════════ */}
                <tr>
                  <td style={{ padding: '16px 28px 24px 28px' }}>
                    <hr style={{ border: 'none', borderTop: `1px solid ${C.divider}`, margin: '0 0 14px 0' }} />
                    {vendorOrders.map((vendor, vi) => (
                      <p
                        key={vi}
                        style={{
                          margin: '0 0 2px 0',
                          fontSize: '11px',
                          color: C.textMuted,
                          fontFamily: fontStack,
                          textAlign: 'center',
                          lineHeight: '1.6',
                        }}
                      >
                        {vendor.tenantName}
                        {vendor.tenantEmail && <> — {vendor.tenantEmail}</>}
                        {vendor.tenantPhone && <> · {vendor.tenantPhone}</>}
                      </p>
                    ))}
                  </td>
                </tr>
              </table>

              {/* Copyright */}
              <p style={{
                margin: '20px 0 0 0',
                fontSize: '11px',
                color: C.textMuted,
                fontFamily: fontStack,
                textAlign: 'center',
                lineHeight: '1.6',
              }}>
                © {new Date().getFullYear()} nummyGo · Automated transactional email
              </p>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}
