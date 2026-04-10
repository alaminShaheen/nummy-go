import React from 'react';
import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from '@react-email/components';
import { NummyGoEmailLayout } from './NummyGoEmailLayout';

interface OrderDeclinedEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  rejectionReason: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}

export function OrderDeclinedEmail({
  tenantName,
  orderId,
  createdAt,
  totalCents,
  rejectionReason,
  items,
}: OrderDeclinedEmailProps) {
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const totalFmt = `$${(totalCents / 100).toFixed(2)}`;

  return (
    <NummyGoEmailLayout previewText={`Your order from ${tenantName} was declined.`}>

      <Text style={s.h1}>Order Declined ❌</Text>
      <Text style={s.subtitle}>
        We're sorry. <strong>{tenantName}</strong> was unable to fulfil your order. If you were charged, a full refund has been issued.
      </Text>

      {/* Rejection reason */}
      <Section style={s.reasonBox}>
        <Text style={s.reasonLabel}>Message from {tenantName}</Text>
        <Text style={s.reasonText}>"{rejectionReason}"</Text>
      </Section>

      {/* Receipt */}
      <Section style={s.receipt}>
        <Text style={s.receiptTitle}>Order Summary</Text>

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
            <Text style={{ ...s.metaValue, color: '#f43f5e' }}>Declined</Text>
          </Column>
        </Row>

        <Hr style={s.dashedDivider} />

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

        <Row>
          <Column><Text style={s.totalLabel}>Refunded Total</Text></Column>
          <Column style={{ textAlign: 'right' }}>
            <Text style={{ ...s.totalValue, color: '#64748b', textDecoration: 'line-through' }}>{totalFmt}</Text>
          </Column>
        </Row>
      </Section>

    </NummyGoEmailLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  h1: { fontSize: '26px', fontWeight: '800', color: '#f43f5e', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#94a3b8', margin: '0 0 24px 0', lineHeight: '1.5' },
  reasonBox: { backgroundColor: 'rgba(244,63,94,0.06)', borderLeft: '3px solid #f43f5e', borderRadius: '0 8px 8px 0', padding: '14px 16px', marginBottom: '24px' },
  reasonLabel: { fontSize: '10px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 6px 0' },
  reasonText: { fontSize: '14px', color: '#e2e8f0', margin: '0', fontStyle: 'italic' },
  receipt: { backgroundColor: '#0f1623', borderRadius: '10px', padding: '20px' },
  receiptTitle: { fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 16px 0' },
  metaRow: { marginBottom: '16px' },
  metaLabel: { fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px 0' },
  metaValue: { fontSize: '13px', fontWeight: '700', color: '#e2e8f0', margin: '0' },
  dashedDivider: { borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', margin: '12px 0' },
  itemRow: { marginBottom: '10px' },
  itemName: { fontSize: '14px', fontWeight: '700', color: '#64748b', margin: '0 0 2px 0', textDecoration: 'line-through' },
  itemMeta: { fontSize: '12px', color: '#475569', margin: '0' },
  itemPrice: { fontSize: '14px', fontWeight: '800', color: '#64748b', margin: '0' },
  totalLabel: { fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0' },
  totalValue: { fontSize: '18px', fontWeight: '900', color: '#f59e0b', margin: '0' },
};
