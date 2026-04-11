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

export interface OrderConfirmationEmailProps {
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  fulfillmentMethod?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  paymentMethod?: string;
  items: Array<{
    name: string;
    quantity: number;
    priceCents: number;
  }>;
  trackingUrl: string;
}

// ── Shared Tailwind Config ─────────────────────────────────────────────────

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        ng: {
          bg: '#0D1117',
          surface: '#13191f',
          card: '#1a2130',
          border: '#252e3f',
          muted: '#5a6478',
          subtle: '#3d4556',
          amber: '#f59e0b',
          orange: '#f97316',
          indigo: '#818cf8',
          green: '#34d399',
          white: '#f1f5f9',
        },
      },
    },
  },
};

// ── Brand gradient (matching globals.css .gradient-text) ───────────────────
const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  color: '#f59e0b',
};

// ── Component ──────────────────────────────────────────────────────────────

export function OrderConfirmationEmail({
  tenantName,
  tenantEmail,
  tenantPhone,
  orderId,
  createdAt,
  totalCents,
  fulfillmentMethod = 'pickup',
  deliveryAddress,
  paymentMethod = 'Cash',
  items,
  trackingUrl = '#',
}: OrderConfirmationEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const shortId = orderId.slice(-6).toUpperCase();
  const subtotalCents = items.reduce((s, i) => s + i.priceCents, 0);
  const taxCents = Math.round(subtotalCents * 0.13);
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          `}</style>
        </Head>
        <Preview>Your order from {tenantName} is confirmed! Order #{shortId}</Preview>
        <Body
          className="m-0 p-0"
          style={{
            backgroundColor: '#0D1117',
            fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {/* ── Outer wrapper ── */}
          <Container className="max-w-[640px] mx-auto py-10 px-4">

            {/* ═══════════════════════════════════════════════════════════
                BRAND HEADER — matching Navbar: 🔥 + gradient "nummyGo"
            ═══════════════════════════════════════════════════════════ */}
            <Section className="text-center mb-8">
              <Text className="text-[20px] font-black tracking-tight m-0">
                <span>🔥 </span>
                <span style={GRADIENT_TEXT_STYLE}>nummyGo</span>
              </Text>
            </Section>

            {/* ═══════════════════════════════════════════════════════════
                HERO — Status pill + Gradient heading + Order # callout
            ═══════════════════════════════════════════════════════════ */}
            <Section className="text-center mb-6 px-2">
              {/* Status pill */}
              <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto 20px auto' }}>
                <tr>
                  <td style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: '999px',
                    padding: '5px 16px',
                  }}>
                    <Text className="text-[11px] font-bold tracking-[0.1em] uppercase m-0" style={{ color: '#34d399' }}>
                      ✓ Order Confirmed
                    </Text>
                  </td>
                </tr>
              </table>

              {/* Gradient heading — matching .gradient-text */}
              <Text
                className="text-[36px] font-black leading-[1.1] m-0 mb-4"
                style={GRADIENT_TEXT_STYLE}
              >
                Thank you for<br />your order!
              </Text>

              <Text
                className="text-[15px] leading-[1.7] m-0 max-w-[440px] mx-auto"
                style={{ color: '#94a3b8' }}
              >
                Your order from <strong style={{ color: '#f1f5f9' }}>{tenantName}</strong> has been
                received. We'll keep you updated every step of the way.
              </Text>
            </Section>

            {/* ── Order # Callout — immediately visible ── */}
            <Section className="text-center mb-8">
              <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto' }}>
                <tr>
                  <td style={{
                    backgroundColor: '#13191f',
                    border: '1px solid #252e3f',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    textAlign: 'center' as const,
                  }}>
                    <Text className="text-[9px] font-bold tracking-[2px] uppercase m-0 mb-1" style={{ color: '#64748b' }}>
                      Order Number
                    </Text>
                    <Text className="text-[22px] font-black tracking-[0.05em] m-0" style={{ color: '#f59e0b' }}>
                      #{shortId}
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* ── CTA Button ── */}
            <Section className="text-center mb-10">
              <Link
                href={trackingUrl}
                className="inline-block rounded-full px-10 py-3.5 text-[13px] font-bold text-black no-underline tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.25), 0 0 60px rgba(249, 115, 22, 0.1)',
                }}
              >
                Track Your Order →
              </Link>
            </Section>

            {/* ═══════════════════════════════════════════════════════════
                STACKED LAYOUT: Receipt Card FIRST, then Contact Details
            ═══════════════════════════════════════════════════════════ */}
            <Section className="mb-6">
              {/* ── Receipt Card ── */}
              <Section
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#13191f',
                  border: '1px solid #252e3f',
                  boxShadow: '0 0 60px rgba(245, 158, 11, 0.06), 0 0 120px rgba(129, 140, 248, 0.04)',
                }}
              >
                {/* Gradient accent bar */}
                <div style={{
                  height: '3px',
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 50%, #818cf8 100%)',
                }} />

                <Section className="px-5 pt-6 pb-5">
                  <Text className="text-[18px] font-black m-0 mb-1" style={{ color: '#f1f5f9' }}>Order Summary</Text>
                  <Text className="text-[12px] m-0 mb-5" style={{ color: '#94a3b8' }}>{tenantName}</Text>

                  {/* ── Meta block ── */}
                  <Section
                    className="rounded-xl mb-5 px-4 py-4"
                    style={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <Row>
                      <Column style={{ paddingBottom: '12px' }}>
                        <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Date</Text>
                        <Text className="text-[12px] font-bold m-0" style={{ color: '#94a3b8' }}>{dateStr}</Text>
                      </Column>
                    </Row>
                    <Hr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 0 12px 0' }} />
                    <Row>
                      <Column>
                        <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Order #</Text>
                        <Text className="text-[12px] font-bold m-0" style={{ color: '#f59e0b' }}>#{shortId}</Text>
                      </Column>
                      <Column>
                        <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Payment</Text>
                        <Text className="text-[12px] font-bold m-0" style={{ color: '#94a3b8' }}>{paymentMethod}</Text>
                      </Column>
                    </Row>
                  </Section>

                  {/* ── Items ── */}
                  {items.map((item, i) => (
                    <React.Fragment key={i}>
                      <Row className="mb-1">
                        <Column>
                          <Text className="text-[13px] font-bold m-0" style={{ color: '#f1f5f9' }}>{item.name}</Text>
                          <Text className="text-[11px] m-0 mt-1" style={{ color: '#64748b' }}>Qty: {item.quantity}</Text>
                        </Column>
                        <Column style={{ textAlign: 'right', verticalAlign: 'top' }}>
                          <Text className="text-[13px] font-extrabold m-0" style={{ color: '#94a3b8' }}>{fmt(item.priceCents)}</Text>
                        </Column>
                      </Row>
                      {i < items.length - 1 && (
                        <Hr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '10px 0' }} />
                      )}
                    </React.Fragment>
                  ))}

                  {/* ── Pricing breakdown ── */}
                  <Hr style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '16px 0 12px 0' }} />

                  <Row className="mb-1">
                    <Column><Text className="text-[12px] m-0" style={{ color: '#64748b' }}>Subtotal</Text></Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text className="text-[12px] font-semibold m-0" style={{ color: '#94a3b8' }}>{fmt(subtotalCents)}</Text>
                    </Column>
                  </Row>
                  <Row className="mb-1">
                    <Column><Text className="text-[12px] m-0" style={{ color: '#64748b' }}>Tax (13%)</Text></Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text className="text-[12px] font-semibold m-0" style={{ color: '#94a3b8' }}>{fmt(taxCents)}</Text>
                    </Column>
                  </Row>
                  <Row className="mb-1">
                    <Column>
                      <Text className="text-[12px] m-0" style={{ color: '#64748b' }}>
                        {fulfillmentMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                      </Text>
                    </Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text className="text-[12px] font-semibold m-0" style={{ color: '#94a3b8' }}>
                        {fulfillmentMethod === 'delivery' ? '$2.99' : 'Free'}
                      </Text>
                    </Column>
                  </Row>

                  {/* ── Total ── */}
                  <Hr style={{ borderTop: '1px solid #252e3f', margin: '12px 0' }} />
                  <Row>
                    <Column><Text className="text-[15px] font-black m-0" style={{ color: '#f1f5f9' }}>Total</Text></Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text className="text-[18px] font-black m-0" style={{ color: '#f59e0b' }}>{fmt(totalCents)}</Text>
                    </Column>
                  </Row>
                </Section>

                {/* Bottom accent bar */}
                <div style={{
                  height: '2px',
                  background: 'linear-gradient(90deg, rgba(251,191,36,0.3) 0%, rgba(129,140,248,0.3) 100%)',
                }} />
              </Section>
            </Section>

            <Section className="mb-8">
              {/* ── Restaurant Details ── */}
              <Section
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: '#13191f',
                  border: '1px solid #252e3f',
                }}
              >
                <Text className="text-[9px] font-bold tracking-[2px] uppercase m-0 mb-5" style={{ color: '#f59e0b' }}>
                  Restaurant Details
                </Text>

                <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-1" style={{ color: '#475569' }}>Name</Text>
                <Text className="text-[14px] font-semibold m-0 mb-4" style={{ color: '#f1f5f9' }}>{tenantName}</Text>

                {tenantEmail && (
                  <>
                    <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-1" style={{ color: '#475569' }}>Email</Text>
                    <Text className="text-[13px] font-medium m-0 mb-4" style={{ color: '#f1f5f9' }}>{tenantEmail}</Text>
                  </>
                )}

                {tenantPhone && (
                  <>
                    <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-1" style={{ color: '#475569' }}>Phone</Text>
                    <Text className="text-[13px] font-medium m-0 mb-4" style={{ color: '#f1f5f9' }}>{tenantPhone}</Text>
                  </>
                )}

                <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-2" style={{ color: '#475569' }}>Fulfillment</Text>
                <table cellPadding="0" cellSpacing="0" role="presentation">
                  <tr>
                    <td style={{
                      backgroundColor: fulfillmentMethod === 'delivery'
                        ? 'rgba(129, 140, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      border: `1px solid ${fulfillmentMethod === 'delivery'
                        ? 'rgba(129, 140, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                      borderRadius: '8px',
                      padding: '4px 12px',
                    }}>
                      <Text
                        className="text-[11px] font-bold m-0"
                        style={{ color: fulfillmentMethod === 'delivery' ? '#818cf8' : '#f59e0b' }}
                      >
                        {fulfillmentMethod === 'delivery' ? '🚗 Delivery' : '📍 Pickup'}
                      </Text>
                    </td>
                  </tr>
                </table>

                {fulfillmentMethod === 'delivery' && deliveryAddress && (
                  <>
                    <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mt-4 mb-1" style={{ color: '#475569' }}>Delivery Address</Text>
                    <Text className="text-[13px] m-0" style={{ color: '#94a3b8' }}>{deliveryAddress}</Text>
                  </>
                )}
              </Section>

              <Text className="text-[11px] leading-[1.6] m-0 mt-4 px-1" style={{ color: '#475569' }}>
                Need help? Contact <strong style={{ color: '#94a3b8' }}>{tenantName}</strong> directly.
              </Text>
            </Section>

            {/* ═══════════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════════ */}
            <Section className="mt-12">
              <Hr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 0 16px 0' }} />
              <Text className="text-[11px] text-center m-0 leading-relaxed" style={{ color: '#475569' }}>
                © {new Date().getFullYear()} nummyGo · Automated transactional email
              </Text>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
