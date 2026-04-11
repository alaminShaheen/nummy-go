import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | NummyGo',
  description: 'Live tracking for your NummyGo order.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
