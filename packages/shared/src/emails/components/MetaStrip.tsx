import React from 'react';
import { C, fontStack } from './theme';

interface MetaEntry {
  label: string;
  value: string;
  /** Render value in accent orange + bold */
  highlight?: boolean;
}

interface MetaStripProps {
  entries: MetaEntry[];
}

/**
 * Horizontal key-value metadata strip (Order #, Date, Total, etc.).
 * Stacks vertically on mobile via the `.meta-strip` responsive class.
 */
export function MetaStrip({ entries }: MetaStripProps) {
  return (
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
            {entries.map((entry, i) => (
              <td
                key={i}
                style={{
                  padding: '12px 16px',
                  width: `${Math.round(100 / entries.length)}%`,
                  ...(i > 0 ? { borderLeft: `1px solid ${C.divider}` } : {}),
                }}
              >
                <p style={{
                  margin: '0 0 3px 0',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase' as const,
                  color: C.textMuted,
                  fontFamily: fontStack,
                }}>
                  {entry.label}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: entry.highlight ? '14px' : '13px',
                  fontWeight: entry.highlight ? 900 : 600,
                  color: entry.highlight ? C.accentOrange : C.textSecondary,
                  fontFamily: fontStack,
                }}>
                  {entry.value}
                </p>
              </td>
            ))}
          </tr>
        </table>
      </td>
    </tr>
  );
}
