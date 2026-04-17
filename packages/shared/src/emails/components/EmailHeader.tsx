import React from 'react';
import { C, fontStack, BRAND_GRADIENT } from './theme';

type StatusVariant = 'confirmed' | 'declined' | 'cancelled' | 'new-order';

interface EmailHeaderProps {
  status: StatusVariant;
}

const STATUS_CONFIG: Record<StatusVariant, { label: string; color: string; bg: string; border: string }> = {
  'confirmed': {
    label: '✓ Confirmed',
    color: C.green,
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
  },
  'declined': {
    label: '✗ Declined',
    color: C.rose,
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.18)',
  },
  'cancelled': {
    label: '✗ Cancelled',
    color: C.rose,
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.18)',
  },
  'new-order': {
    label: '🛎️ New Order',
    color: C.accentOrange,
    bg: 'rgba(234,88,12,0.06)',
    border: 'rgba(234,88,12,0.15)',
  },
};

/**
 * Brand header row:  🔥 nummyGo  +  status pill
 * Used at the top of every email template.
 */
export function EmailHeader({ status }: EmailHeaderProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <tr>
      <td style={{ padding: '24px 28px 0 28px' }}>
        <table role="presentation" cellPadding="0" cellSpacing="0" width="100%">
          <tr>
            <td style={{ verticalAlign: 'middle' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: C.textPrimary, fontFamily: fontStack, letterSpacing: '-0.3px' }}>
                🔥{' '}
                <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  nummyGo
                </span>
              </span>
            </td>
            <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
              <span style={{
                display: 'inline-block',
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '10px',
                fontWeight: 700,
                color: cfg.color,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                fontFamily: fontStack,
              }}>
                {cfg.label}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}
