import React from 'react';
import { Html, Head, Preview, Body } from '@react-email/components';
import { C, fontStack, responsiveCss, GRADIENT_BAR } from './theme';

interface EmailShellProps {
  previewText: string;
  children: React.ReactNode;
}

/**
 * Shared outer wrapper for every nummyGo transactional email.
 * Provides: responsive CSS, Inter font, page background, main card
 * with gradient top bar, and copyright footer.
 */
export function EmailShell({ previewText, children }: EmailShellProps) {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>{responsiveCss}</style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: C.pageBg, fontFamily: fontStack, WebkitFontSmoothing: 'antialiased' as any }}>
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
                {/* Gradient accent bar */}
                <tr>
                  <td style={{ height: '4px', background: GRADIENT_BAR }} />
                </tr>

                {/* Template content */}
                {children}
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
