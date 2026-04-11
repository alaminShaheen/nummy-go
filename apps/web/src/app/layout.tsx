/**
 * apps/web/src/app/layout.tsx
 * Root layout for the unified web app.
 */
import type { Metadata } from 'next';
import { TRPCProvider } from '@/trpc/Provider';
import './globals.css';
import { Geist } from "next/font/google";
import { cn, Toaster } from '@/components/ui';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    template: '%s | nummyGo',
    default: 'nummyGo - Direct Restaurant Ordering',
  },
  description: 'Order directly from your favorite local restaurants without third-party markups.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'nummyGo',
    description: 'Order directly from your favorite local restaurants without third-party markups.',
    siteName: 'nummyGo',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nummyGo',
    description: 'Order directly from your favorite local restaurants without third-party markups.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TRPCProvider>{children}</TRPCProvider>
        <ScrollToTop />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
