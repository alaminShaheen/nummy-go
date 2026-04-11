import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface NummyGoLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export function NummyGoEmailLayout({ children, previewText }: NummyGoLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Brand Header */}
          <Section style={styles.brandHeader}>
            <Text style={styles.brandText}>🔥 nummyGo</Text>
          </Section>
          <Hr style={styles.divider} />
          {children}
          {/* Footer */}
          <Hr style={styles.divider} />
          <Text style={styles.footer}>
            © {new Date().getFullYear()} nummyGo. This is an automated transactional email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#0D1117',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    margin: '0',
    padding: '20px 10px',
  },
  container: {
    backgroundColor: '#13171F',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  brandHeader: {
    marginBottom: '4px',
  },
  brandText: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#f59e0b',
    margin: '0 0 16px 0',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.08)',
    margin: '16px 0',
  },
  footer: {
    fontSize: '12px',
    color: '#475569',
    textAlign: 'center',
    margin: '0',
  },
};
