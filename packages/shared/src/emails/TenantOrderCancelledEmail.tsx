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

export interface TenantOrderCancelledEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  customerName: string;
  rejectionReason: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}

// ── Shared config ──────────────────────────────────────────────────────────

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        ng: {
          bg: '#0D1117', surface: '#13191f', card: '#1a2130', border: '#252e3f',
          muted: '#94a3b8', subtle: '#475569', amber: '#f59e0b', orange: '#f97316',
          indigo: '#818cf8', white: '#f1f5f9',
        },
      },
    },
  },
};

const GRADIENT_TEXT: React.CSSProperties = {
  background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #818cf8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: '#f59e0b',
};

// ── Component ──────────────────────────────────────────────────────────────

export function TenantOrderCancelledEmail({
  tenantName,
  orderId,
  createdAt,
  totalCents,
  customerName,
  rejectionReason,
  items,
}: TenantOrderCancelledEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const shortId = orderId.slice(-6).toUpperCase();
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
        </Head>
        <Preview>Order #{shortId} was cancelled by {customerName}</Preview>
        <Body className="m-0 p-0" style={{ backgroundColor: '#0D1117', fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
          <Container className="max-w-[640px] mx-auto py-10 px-4">

            {/* Brand Header */}
            <Section className="text-center mb-8">
              <Text className="text-[20px] font-black tracking-tight m-0">
                <span>🔥 </span><span style={GRADIENT_TEXT}>nummyGo</span>
              </Text>
            </Section>

            {/* Hero */}
            <Section className="text-center mb-6 px-2">
              {/* Status pill — amber/warning */}
              <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto 20px auto' }}>
                <tr>
                  <td style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '999px',
                    padding: '5px 16px',
                  }}>
                    <Text className="text-[11px] font-bold tracking-[0.1em] uppercase m-0" style={{ color: '#f59e0b' }}>
                      ⚠️ Order Cancelled
                    </Text>
                  </td>
                </tr>
              </table>

              <Text className="text-[32px] font-black leading-[1.1] m-0 mb-4" style={GRADIENT_TEXT}>
                Order cancelled
              </Text>
              <Text className="text-[15px] leading-[1.7] m-0 max-w-[440px] mx-auto" style={{ color: '#94a3b8' }}>
                <strong style={{ color: '#f1f5f9' }}>{customerName}</strong> has cancelled their order.
                Please stop preparation if it has already started.
              </Text>
            </Section>

            {/* ── Order # Callout ── */}
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
                    <Text className="text-[9px] font-bold tracking-[2px] uppercase m-0 mb-1" style={{ color: '#64748b' }}>Order Number</Text>
                    <Text className="text-[22px] font-black tracking-[0.05em] m-0" style={{ color: '#f59e0b' }}>#{shortId}</Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Cancellation reason */}
            <Section className="mb-8">
              <Section
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'rgba(245,158,11,0.05)',
                  borderLeft: '3px solid #f59e0b',
                }}
              >
                <Text className="text-[10px] font-bold tracking-[1.5px] uppercase m-0 mb-2" style={{ color: '#f59e0b' }}>
                  Customer Reason
                </Text>
                <Text className="text-[14px] m-0" style={{ color: '#e2e8f0', fontStyle: 'italic' }}>
                  "{rejectionReason}"
                </Text>
              </Section>
            </Section>

            {/* ── Receipt Card ── */}
            <Section
              className="rounded-2xl overflow-hidden mb-8"
              style={{
                backgroundColor: '#13191f',
                border: '1px solid #252e3f',
                boxShadow: '0 0 60px rgba(245, 158, 11, 0.04)',
              }}
            >
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 50%, #818cf8 100%)' }} />
              <Section className="px-5 pt-6 pb-5">
                <Text className="text-[18px] font-black m-0 mb-1" style={{ color: '#f1f5f9' }}>Cancelled Order</Text>
                <Text className="text-[12px] m-0 mb-5" style={{ color: '#94a3b8' }}>{tenantName}</Text>

                {/* Meta row */}
                <Section className="rounded-xl mb-5 px-4 py-3" style={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Row>
                    <Column>
                      <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Time Placed</Text>
                      <Text className="text-[12px] font-bold m-0" style={{ color: '#94a3b8' }}>{dateStr}</Text>
                    </Column>
                    <Column>
                      <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Order #</Text>
                      <Text className="text-[12px] font-bold m-0" style={{ color: '#f59e0b' }}>#{shortId}</Text>
                    </Column>
                    <Column>
                      <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Status</Text>
                      <Text className="text-[12px] font-bold m-0" style={{ color: '#f43f5e' }}>Cancelled</Text>
                    </Column>
                  </Row>
                </Section>

                {/* Items */}
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
                    {i < items.length - 1 && <Hr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '10px 0' }} />}
                  </React.Fragment>
                ))}

                <Hr style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '16px 0 12px 0' }} />

                <Row>
                  <Column><Text className="text-[15px] font-black m-0" style={{ color: '#f1f5f9' }}>Voided Amount</Text></Column>
                  <Column style={{ textAlign: 'right' }}>
                    <Text className="text-[18px] font-black m-0" style={{ color: '#64748b', textDecoration: 'line-through' }}>{fmt(totalCents)}</Text>
                  </Column>
                </Row>

                <Text className="text-[11px] text-center m-0 mt-4" style={{ color: '#64748b', fontStyle: 'italic' }}>
                  This order has been voided. No charges apply.
                </Text>
              </Section>
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(251,191,36,0.3) 0%, rgba(129,140,248,0.3) 100%)' }} />
            </Section>

            {/* Footer */}
            <Section className="mt-8">
              <Hr style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 0 16px 0' }} />
              <Text className="text-[11px] text-center m-0 leading-relaxed" style={{ color: '#475569' }}>
                © {new Date().getFullYear()} NummyGo · Automated transactional email
              </Text>
            </Section>

          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
