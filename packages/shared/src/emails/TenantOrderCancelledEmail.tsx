import React from 'react';
import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from '@react-email/components';
import { NummyGoEmailLayout } from './NummyGoEmailLayout';

interface TenantOrderCancelledEmailProps {
  tenantName: string;
  orderId: string;
  createdAt: number;
  totalCents: number;
  customerName: string;
  rejectionReason: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
}

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
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const totalFmt = `$${(totalCents / 100).toFixed(2)}`;

  return (
    <NummyGoEmailLayout previewText={`Order #${orderId.slice(-6).toUpperCase()} was cancelled by ${customerName}`}>

      <Text style={s.h1}>Order Cancelled ⚠️</Text>
      <Text style={s.subtitle}>
        <strong>{customerName}</strong> has cancelled their order. Please stop preparation if it has already started.
      </Text>

      {/* Cancellation reason */}
      <Section style={s.reasonBox}>
        <Text style={s.reasonLabel}>Customer Reason</Text>
        <Text style={s.reasonText}>"{rejectionReason}"</Text>
      </Section>

      {/* Receipt */}
      <Section style={s.receipt}>
        <Text style={s.receiptTitle}>Cancelled Order</Text>

        <Row style={s.metaRow}>
          <Column>
            <Text style={s.metaLabel}>Time Placed</Text>
            <Text style={s.metaValue}>{dateStr}</Text>
          </Column>
          <Column>
            <Text style={s.metaLabel}>Order #</Text>
            <Text style={s.metaValue}>#{orderId.slice(-6).toUpperCase()}</Text>
          </Column>
          <Column>
            <Text style={s.metaLabel}>Status</Text>
            <Text style={{ ...s.metaValue, color: '#f43f5e' }}>Cancelled</Text>
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
          <Column><Text style={s.totalLabel}>Voided Amount</Text></Column>
          <Column style={{ textAlign: 'right' }}>
            <Text style={{ ...s.totalValue, color: '#64748b' }}>{totalFmt}</Text>
          </Column>
        </Row>
      </Section>

    </NummyGoEmailLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  h1: { fontSize: '26px', fontWeight: '800', color: '#f59e0b', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#94a3b8', margin: '0 0 24px 0', lineHeight: '1.5' },
  reasonBox: { backgroundColor: 'rgba(245,158,11,0.06)', borderLeft: '3px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '14px 16px', marginBottom: '24px' },
  reasonLabel: { fontSize: '10px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 6px 0' },
  reasonText: { fontSize: '14px', color: '#e2e8f0', margin: '0', fontStyle: 'italic' },
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
