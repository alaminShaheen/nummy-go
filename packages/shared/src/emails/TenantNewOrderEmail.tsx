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
  Tailwind,
} from '@react-email/components';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TenantNewOrderEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
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
          indigo: '#818cf8', green: '#34d399', white: '#f1f5f9',
        },
      },
    },
  },
};

const GRADIENT_TEXT: React.CSSProperties = {
  color: '#f59e0b',
};

// ── Component ──────────────────────────────────────────────────────────────

export function TenantNewOrderEmail({
  tenantName,
  orderId,
  createdAt,
  totalCents,
  customerName,
  customerEmail,
  customerPhone,
  items,
}: TenantNewOrderEmailProps) {
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
        <Preview>New order #{shortId} from {customerName} — {fmt(totalCents)}</Preview>
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
              {/* Status pill — amber */}
              <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto 20px auto' }}>
                <tr>
                  <td style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '999px',
                    padding: '5px 16px',
                  }}>
                    <Text className="text-[11px] font-bold tracking-[0.1em] uppercase m-0" style={{ color: '#f59e0b' }}>
                      🛎️ New Order
                    </Text>
                  </td>
                </tr>
              </table>

              <Text className="text-[32px] font-black leading-[1.1] m-0 mb-4" style={GRADIENT_TEXT}>
                New order received!
              </Text>
              <Text className="text-[15px] leading-[1.7] m-0 max-w-[440px] mx-auto" style={{ color: '#94a3b8' }}>
                A customer just placed an order at <strong style={{ color: '#f1f5f9' }}>{tenantName}</strong>.
                Open your dashboard to accept and begin preparation.
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

            {/* ── Stacked: Receipt Card + Customer Details ── */}
            <Section className="mb-6">
              {/* Receipt */}
              <Section
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#13191f',
                  border: '1px solid #252e3f',
                  boxShadow: '0 0 60px rgba(245, 158, 11, 0.06), 0 0 120px rgba(129, 140, 248, 0.04)',
                }}
              >
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 50%, #818cf8 100%)' }} />
                <Section className="px-5 pt-6 pb-5">
                  <Text className="text-[18px] font-black m-0 mb-1" style={{ color: '#f1f5f9' }}>Order Details</Text>
                  <Text className="text-[12px] m-0 mb-5" style={{ color: '#94a3b8' }}>{tenantName}</Text>

                  {/* Meta block */}
                  <Section className="rounded-xl mb-5 px-4 py-4" style={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <Row>
                      <Column style={{ paddingBottom: '12px' }}>
                        <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Received</Text>
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
                        <Text className="text-[8px] font-bold tracking-[1.5px] uppercase m-0 mb-1" style={{ color: '#475569' }}>Status</Text>
                        <Text className="text-[12px] font-bold m-0" style={{ color: '#f59e0b' }}>Confirmed</Text>
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
                    <Column><Text className="text-[15px] font-black m-0" style={{ color: '#f1f5f9' }}>Expected Revenue</Text></Column>
                    <Column style={{ textAlign: 'right' }}>
                      <Text className="text-[18px] font-black m-0" style={{ color: '#f59e0b' }}>{fmt(totalCents)}</Text>
                    </Column>
                  </Row>

                  <Text className="text-[11px] text-center m-0 mt-4" style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Please review and accept this order on your dashboard.
                  </Text>
                </Section>
                <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(251,191,36,0.3) 0%, rgba(129,140,248,0.3) 100%)' }} />
              </Section>
            </Section>

            <Section className="mb-8">
              {/* Customer Info */}
              <Section className="rounded-2xl p-5" style={{ backgroundColor: '#13191f', border: '1px solid #252e3f' }}>
                <Text className="text-[9px] font-bold tracking-[2px] uppercase m-0 mb-5" style={{ color: '#f59e0b' }}>
                  Customer Information
                </Text>

                <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-1" style={{ color: '#475569' }}>Name</Text>
                <Text className="text-[14px] font-semibold m-0 mb-4" style={{ color: '#f1f5f9' }}>{customerName}</Text>

                <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-1" style={{ color: '#475569' }}>Email</Text>
                <Text className="text-[13px] font-medium m-0 mb-4" style={{ color: '#f1f5f9' }}>{customerEmail}</Text>

                {customerPhone && (
                  <>
                    <Text className="text-[10px] font-semibold uppercase tracking-[1px] m-0 mb-1" style={{ color: '#475569' }}>Phone</Text>
                    <Text className="text-[13px] font-medium m-0" style={{ color: '#f1f5f9' }}>{customerPhone}</Text>
                  </>
                )}
              </Section>
            </Section>

            {/* Footer */}
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
