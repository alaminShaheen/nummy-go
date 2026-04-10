import React from 'react';
import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from '@react-email/components';
import { NummyGoEmailLayout } from './NummyGoEmailLayout';

interface OrderConfirmationEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}

export function OrderConfirmationEmail({
  tenantName,
  orderId,
  createdAt,
  totalCents,
  customerName,
  customerEmail,
  customerPhone,
  items,
}: OrderConfirmationEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const totalFmt = `$${(totalCents / 100).toFixed(2)}`;

  return (
    <NummyGoEmailLayout previewText={`Your order from ${tenantName} is confirmed!`}>

      {/* Heading */}
      <Text style={s.h1}>Order Confirmed ✅</Text>
      <Text style={s.subtitle}>
        Your order has been received by <strong>{tenantName}</strong> and is now being prepared.
      </Text>

      {/* Customer info */}
      <Section style={s.infoBox}>
        <Text style={s.infoLabel}>CUSTOMER DETAILS</Text>
        <Text style={s.infoRow}><span style={s.infoKey}>Name</span>{customerName}</Text>
        <Text style={s.infoRow}><span style={s.infoKey}>Email</span>{customerEmail}</Text>
        {customerPhone && <Text style={s.infoRow}><span style={s.infoKey}>Phone</span>{customerPhone}</Text>}
      </Section>

      {/* Receipt */}
      <Section style={s.receipt}>
        <Text style={s.receiptTitle}>Order Summary</Text>

        {/* Meta row */}
        <Row style={s.metaRow}>
          <Column>
            <Text style={s.metaLabel}>Date</Text>
            <Text style={s.metaValue}>{dateStr}</Text>
          </Column>
          <Column>
            <Text style={s.metaLabel}>Order #</Text>
            <Text style={s.metaValue}>#{orderId.slice(-6).toUpperCase()}</Text>
          </Column>
          <Column>
            <Text style={s.metaLabel}>Status</Text>
            <Text style={{ ...s.metaValue, color: '#10b981' }}>Confirmed</Text>
          </Column>
        </Row>

        <Hr style={s.dashedDivider} />

        {/* Items */}
        {items.map((item, i) => (
          <Row key={i} style={s.itemRow}>
            <Column>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={s.itemMeta}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={{ textAlign: 'right' }}>
              <Text style={s.itemPrice}>${(item.priceCents / 100).toFixed(2)}</Text>
            </Column>
          </Row>
        ))}

        <Hr style={s.dashedDivider} />

        {/* Total */}
        <Row>
          <Column><Text style={s.totalLabel}>Order Total</Text></Column>
          <Column style={{ textAlign: 'right' }}>
            <Text style={s.totalValue}>{totalFmt}</Text>
          </Column>
        </Row>
      </Section>

    </NummyGoEmailLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  h1: { fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#94a3b8', margin: '0 0 24px 0', lineHeight: '1.5' },
  infoBox: { backgroundColor: '#0f1623', borderRadius: '10px', padding: '16px', marginBottom: '24px' },
  infoLabel: { fontSize: '10px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 10px 0' },
  infoRow: { fontSize: '14px', color: '#e2e8f0', margin: '0 0 4px 0' },
  infoKey: { color: '#64748b', display: 'inline-block', width: '60px' },
  receipt: { backgroundColor: '#0f1623', borderRadius: '10px', padding: '20px' },
  receiptTitle: { fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 16px 0' },
  metaRow: { marginBottom: '16px' },
  metaLabel: { fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' },
  metaValue: { fontSize: '13px', fontWeight: '700', color: '#e2e8f0', margin: '0' },
  dashedDivider: { borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', margin: '12px 0' },
  itemRow: { marginBottom: '10px' },
  itemName: { fontSize: '14px', fontWeight: '700', color: '#ffffff', margin: '0 0 2px 0' },
  itemMeta: { fontSize: '12px', color: '#64748b', margin: '0' },
  itemPrice: { fontSize: '14px', fontWeight: '800', color: '#f1f5f9', margin: '0' },
  totalLabel: { fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0' },
  totalValue: { fontSize: '18px', fontWeight: '900', color: '#f59e0b', margin: '0' },
};
