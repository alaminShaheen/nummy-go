import { TRPCProvider } from '@/trpc/Provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Web - tRPC + Next.js',
  description: 'Next.js app with tRPC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
