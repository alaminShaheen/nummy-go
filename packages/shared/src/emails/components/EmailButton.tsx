import React from 'react';
import { C, fontStack } from './theme';

interface EmailButtonProps {
  href: string;
  label: string;
  /** Override gradient. Default: orange→deep orange */
  gradient?: string;
}

/**
 * Full-width table-based CTA button.
 * Uses <table><td><a> pattern for bulletproof email client rendering.
 * Never overflows the container.
 */
export function EmailButton({
  href,
  label,
  gradient = `linear-gradient(135deg, ${C.accentOrange} 0%, ${C.accentDeep} 100%)`,
}: EmailButtonProps) {
  return (
    <tr>
      <td style={{ padding: '24px 28px 8px 28px' }}>
        <table role="presentation" cellPadding="0" cellSpacing="0" width="100%">
          <tr>
            <td
              align="center"
              style={{
                background: gradient,
                borderRadius: '999px',
                boxShadow: '0 4px 16px rgba(234,88,12,0.25), 0 1px 3px rgba(234,88,12,0.15)',
              }}
            >
              <a
                href={href}
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
                {label}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}
