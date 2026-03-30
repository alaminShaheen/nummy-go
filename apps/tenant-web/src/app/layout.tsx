/**
 * apps/tenant-web/src/app/layout.tsx
 * Root layout for the tenant dashboard.
 */
import { TRPCProvider } from '@/trpc/Provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'NummyGo – Tenant Dashboard',
  description: 'Manage incoming orders in real-time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
